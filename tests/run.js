#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync, spawnSync } = require('node:child_process');
const {
  makeCleanConfigDir, removeConfigDir, cleanEnv, assertIsolated,
  assertAuthAvailable, PROBE_PROMPT
} = require('./lib/isolation');

const SKILLS = ['conversation-prose', 'documentation-prose'];
const CORPUS = path.join(__dirname, 'corpus');
const SKILL_HOME = path.join(os.homedir(), '.claude', 'skills');

// The rewrite instruction is one constant so a reader can see exactly what the
// model was told. `--show-instruction` prints it.
const REWRITE_INSTRUCTION = [
  'Rewrite the text below so that it follows every rule in the skill above.',
  'Change only the wording. Keep every fact, number, name, file path, and code',
  'sample exactly as it is. Do not add information. Do not remove information.',
  'Output only the rewritten text, with no preamble and no commentary.'
].join('\n');

function buildAfterPrompt(skillBody, beforeText) {
  return [
    '===== SKILL =====',
    skillBody,
    '===== END SKILL =====',
    '',
    REWRITE_INSTRUCTION,
    '',
    '===== TEXT =====',
    beforeText
  ].join('\n');
}

function callClaude(prompt, env) {
  const result = spawnSync('claude', ['-p', prompt], {
    env, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024
  });
  if (result.status !== 0) {
    throw new Error(`the claude call failed: ${result.stderr || result.status}`);
  }
  return result.stdout.trim();
}

function readSkillBody(skill) {
  const file = path.join(SKILL_HOME, skill, 'SKILL.md');
  if (!fs.existsSync(file)) {
    throw new Error(
      `no skill at ${file}. Install it first by pasting prompts/${skill}.md into a session.`
    );
  }
  return fs.readFileSync(file, 'utf8');
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function gitCommit() {
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch (error) {
    return 'unknown';
  }
}

function cliVersion(env) {
  const result = spawnSync('claude', ['--version'], { env, encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : 'unknown';
}

function main(argv) {
  const args = argv.slice(2);

  if (args.includes('--show-instruction')) {
    console.log(REWRITE_INSTRUCTION);
    return;
  }

  const skill = args.find(a => !a.startsWith('--'));
  if (!SKILLS.includes(skill)) {
    console.error(`usage: node tests/run.js <${SKILLS.join('|')}> [--out <dir>] [--dry-run]`);
    process.exit(1);
  }

  const outIndex = args.indexOf('--out');
  const runDir = outIndex >= 0 ? args[outIndex + 1] : path.join(__dirname, 'runs', today());
  const dryRun = args.includes('--dry-run');

  // Fail before creating anything if the run cannot authenticate. An isolated
  // configuration directory cannot see the keychain login the interactive CLI
  // uses, so the credential comes from the environment. A dry run makes no
  // model call, so it needs no credential and runs no probe, which keeps the
  // plumbing testable without one.
  if (!dryRun) console.log(`credential from ${assertAuthAvailable()}`);

  const started = Date.now();
  const configDir = makeCleanConfigDir();

  // Every exit path deletes the directory: the end of the run, a thrown error,
  // and an interrupted process.
  let removed = false;
  const cleanUp = () => {
    if (removed) return;
    removed = true;
    removeConfigDir(configDir);
  };
  process.on('exit', cleanUp);
  process.on('SIGINT', () => { cleanUp(); process.exit(130); });
  process.on('SIGTERM', () => { cleanUp(); process.exit(143); });

  try {
    const env = cleanEnv(configDir);

    console.log(`config directory: ${configDir}`);

    if (dryRun) {
      console.log('dry run: no credential, no isolation probe, no model calls');
    } else {
      console.log('checking isolation');
      assertIsolated(callClaude(PROBE_PROMPT, env));
      console.log('isolation confirmed');
    }

    const skillBody = readSkillBody(skill);
    const outDir = path.join(runDir, skill);
    fs.mkdirSync(outDir, { recursive: true });

    const files = fs.readdirSync(path.join(CORPUS, skill)).filter(f => f.endsWith('.md')).sort();

    for (const file of files) {
      const id = file.slice(0, 2);
      const prompt = fs.readFileSync(path.join(CORPUS, skill, file), 'utf8');
      process.stdout.write(`  ${file}  `);

      if (dryRun) {
        console.log('skipped');
        continue;
      }

      const before = callClaude(prompt, env);
      fs.writeFileSync(path.join(outDir, `${id}.before.md`), `${before}\n`);
      process.stdout.write('before ');

      const after = callClaude(buildAfterPrompt(skillBody, before), env);
      fs.writeFileSync(path.join(outDir, `${id}.after.md`), `${after}\n`);
      console.log('after');
    }

    const meta = {
      model: process.env.ANTHROPIC_MODEL || 'default',
      date: today(),
      cli: cliVersion(env),
      corpusCommit: gitCommit(),
      instructionHash: crypto.createHash('sha256').update(REWRITE_INSTRUCTION).digest('hex').slice(0, 12)
    };
    fs.writeFileSync(path.join(runDir, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`);

    const calls = files.length * 2 + 1;
    console.log(`\nwrote ${runDir}`);
    console.log(`${calls} model calls, ${Math.round((Date.now() - started) / 1000)} seconds`);
    console.log('Token cost depends on the model in use and is not reported by the CLI.');
    console.log(`score it with: node tests/score.js ${runDir}`);
  } finally {
    cleanUp();
  }
}

if (require.main === module) main(process.argv);

module.exports = { buildAfterPrompt, REWRITE_INSTRUCTION };
