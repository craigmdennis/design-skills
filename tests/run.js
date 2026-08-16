#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync, spawnSync } = require('node:child_process');
const {
  makeCleanConfigDir, removeConfigDir, cleanEnv, assertIsolated,
  assertAuthAvailable, probePrompt, CLAUDE_BIN
} = require('./lib/isolation');
const { loadEnvFile } = require('./lib/env');

const SKILLS = ['conversation', 'documentation'];
const CORPUS = path.join(__dirname, 'corpus');
const BASELINE = path.join(__dirname, 'baseline');
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

// A published figure that names no model cannot be reproduced or compared
// against a later run. --model pins one, and PROSE_TEST_MODEL in .env.test sets
// a default for every run.
function pinnedModel() {
  return process.env.PROSE_TEST_MODEL || process.env.ANTHROPIC_MODEL || '';
}

// --bare skips hooks, auto-memory, and CLAUDE.md discovery. CLAUDE_CONFIG_DIR
// alone stops the hooks and the installed skills and leaves CLAUDE.md loaded,
// and an account CLAUDE.md that routes to the skill under test contaminates
// the before call. Both are used together.
//
// --output-format json returns the reply alongside the models that produced it
// and the cost, so meta.json can name what actually ran.
//
// Every call runs with no tools and from an empty directory. A call made inside
// this repository read the documentation skill off disk and applied the
// house style to a before text, which is the contamination the whole harness
// exists to prevent. The skills are still on disk under `plugins/prose/`, so
// the empty working directory and the disallowed tools both stay. The isolation
// probe cannot see this failure, because at probe time no tool has run yet.
const NO_TOOLS = ['Bash', 'Read', 'Glob', 'Grep', 'Edit', 'Write', 'WebFetch', 'WebSearch',
  'NotebookEdit', 'Task', 'TodoWrite'];

function callClaude(prompt, env, tally, cwd) {
  const args = [
    '--bare', '-p', prompt, '--output-format', 'json',
    '--disallowedTools', ...NO_TOOLS,
    '--disable-slash-commands'
  ];
  const model = pinnedModel();
  if (model) args.push('--model', model);

  const result = spawnSync(CLAUDE_BIN, args, {
    env, cwd, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024
  });
  if (result.status !== 0) {
    throw new Error(`the claude call failed: ${result.stderr || result.status}`);
  }

  let payload;
  try {
    payload = JSON.parse(result.stdout);
  } catch (error) {
    throw new Error(
      `the claude call returned output that is not JSON: ${result.stdout.slice(0, 200)}`
    );
  }
  if (payload.is_error) {
    throw new Error(`the claude call reported an error: ${payload.result}`);
  }

  if (tally) {
    for (const id of Object.keys(payload.modelUsage || {})) tally.models.add(id);
    tally.costUSD += payload.total_cost_usd || 0;
  }
  return String(payload.result || '').trim();
}

// Where a reader's copy comes from: the prose plugin in this repository.
const PLUGIN_SKILLS = path.join(__dirname, '..', 'plugins', 'prose', 'skills');

// Two places a skill can be. An installed copy at ~/.claude/skills/<skill>/ is
// preferred, because it is the copy that actually runs and may carry local
// edits. The plugin's own copy is the fallback, so a fresh clone measures
// something without an install step. The hook script uses the same order.
function resolveSkillDir(skill) {
  const installed = path.join(SKILL_HOME, skill);
  if (fs.existsSync(path.join(installed, 'SKILL.md'))) {
    return { dir: installed, source: 'installed' };
  }
  const shipped = path.join(PLUGIN_SKILLS, skill);
  if (fs.existsSync(path.join(shipped, 'SKILL.md'))) {
    return { dir: shipped, source: 'plugin' };
  }
  return { dir: null, source: null };
}

function readSkillBody(skill) {
  const { dir } = resolveSkillDir(skill);
  if (!dir) {
    throw new Error(
      `no skill named ${skill} at ${path.join(SKILL_HOME, skill)} or ` +
      `${path.join(PLUGIN_SKILLS, skill)}. Install it with ` +
      'claude plugin install prose@design-skills, or run from a clone of this repository.'
    );
  }
  return fs.readFileSync(path.join(dir, 'SKILL.md'), 'utf8');
}

// The numbered check titles, which are what the judge marks against and what
// sets the denominator of every judged figure.
function checkTitles(text) {
  if (!text) return null;
  return [...text.matchAll(/^\s*(\d+)\.\s+\*\*(.+?)\.?\*\*/gm)].map(m => `${m[1]} ${m[2]}`);
}

// A measured copy and a published copy. Where the measured one is installed at
// ~/.claude/skills/, the bytes of the two never match: the published copy is
// de-personalised and re-wrapped on purpose. What has to match is the check
// list, because that is what the judge marks against and what sets every
// denominator. A figure produced against a different check list describes a
// skill nobody can install from this repository. Where the plugin's own copy
// was measured, the two are one file and the comparison is trivially true, so
// `source` records which case produced the figure.
function skillFingerprint(skill) {
  const digest = file => (fs.existsSync(file)
    ? crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0, 12)
    : null);

  const { dir, source } = resolveSkillDir(skill);
  const measuredChecksFile = dir ? path.join(dir, 'checks.md') : null;
  const measuredChecks = measuredChecksFile && fs.existsSync(measuredChecksFile)
    ? fs.readFileSync(measuredChecksFile, 'utf8')
    : null;

  const publishedChecksFile = path.join(PLUGIN_SKILLS, skill, 'checks.md');
  const publishedChecks = fs.existsSync(publishedChecksFile)
    ? fs.readFileSync(publishedChecksFile, 'utf8')
    : null;

  const measuredTitles = checkTitles(measuredChecks);
  const publishedTitles = checkTitles(publishedChecks);

  return {
    source,
    installed: {
      'SKILL.md': dir ? digest(path.join(dir, 'SKILL.md')) : null,
      'checks.md': measuredChecksFile ? digest(measuredChecksFile) : null
    },
    checkCount: measuredTitles ? measuredTitles.length : null,
    publishedCheckCount: publishedTitles ? publishedTitles.length : null,
    checksMatchPublished: measuredTitles && publishedTitles
      ? JSON.stringify(measuredTitles) === JSON.stringify(publishedTitles)
      : null
  };
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// A date alone collides with a second run on the same day, which forces a
// person to delete files before running again. Seconds make each run its own
// directory, and the format sorts in the same order as the clock.
function stamp() {
  return new Date().toISOString().slice(0, 19).replace(/:/g, '-');
}

// Runs before the credential check, the throwaway directory, and the isolation
// probe, so a collision costs no model call. A second skill added to an
// existing run directory is the intended two-skill workflow and passes, because
// only this skill's own subdirectory is examined.
function assertRunDirFree(runDir, skill, force) {
  const outDir = path.join(runDir, skill);
  if (!fs.existsSync(outDir)) return;

  const existing = fs.readdirSync(outDir).filter(f => f.endsWith('.md'));
  if (existing.length === 0) return;

  if (force) {
    console.log(`--force: overwriting ${existing.length} files in ${outDir}`);
    return;
  }

  throw new Error(
    `${outDir} already holds ${existing.length} result files. Writing here ` +
    'would mix results from two runs in one directory, and the scorer would ' +
    'read them as one. Run again without --out to get a new directory, pass ' +
    '--out <dir> to name one, or pass --force to overwrite these files.'
  );
}

// The before text carries no skill, so it changes only when the corpus or the
// model changes. Editing a check changes nothing about it. Generating it once
// and committing it halves every later run, and it removes generation variance
// between two comparisons, so a change in the delta comes from the skill edit
// alone. `--make-baseline` regenerates it.
function readBaseline(skill, id) {
  const file = path.join(BASELINE, skill, `${id}.before.md`);
  if (!fs.existsSync(file)) {
    throw new Error(
      `no baseline at ${file}. Generate it once with ` +
      `\`node tests/run.js ${skill} --make-baseline\`, or pass --fresh-before ` +
      'to generate the before texts as part of this run.'
    );
  }
  return fs.readFileSync(file, 'utf8').trim();
}

// The baseline answers the corpus prompts as they stood when it was made.
// Editing a prompt leaves a baseline that answers the old question, and every
// run afterwards would compare a new after text against a before text made from
// different input. The hash makes that visible.
function corpusHash(skill) {
  const dir = path.join(CORPUS, skill);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
  const digest = crypto.createHash('sha256');
  for (const file of files) {
    digest.update(file);
    digest.update(fs.readFileSync(path.join(dir, file)));
  }
  return digest.digest('hex').slice(0, 12);
}

// One hash per prompt, so a changed prompt names itself and the others stay
// valid. A single hash for the whole corpus cannot say which prompt moved, so
// adding one prompt would invalidate every before text in the skill.
function corpusFileHashes(skill) {
  const dir = path.join(CORPUS, skill);
  const hashes = {};
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort()) {
    hashes[file.slice(0, 2)] = crypto.createHash('sha256')
      .update(file)
      .update(fs.readFileSync(path.join(dir, file)))
      .digest('hex')
      .slice(0, 12);
  }
  return hashes;
}

// Returns the ids to generate: the ones with no before text, and the ones whose
// prompt changed. --force returns every id.
function baselineWorkList(skill, ids, force) {
  if (force) return { ids, unverified: [] };

  const meta = readBaselineMeta();
  const recorded = meta && meta.corpusHash && meta.corpusHash[skill];
  const current = corpusFileHashes(skill);
  const wanted = [];
  const unverified = [];

  for (const id of ids) {
    const missing = !fs.existsSync(path.join(BASELINE, skill, `${id}.before.md`));
    if (missing) {
      wanted.push(id);
      continue;
    }
    if (recorded && typeof recorded === 'object') {
      if (recorded[id] !== current[id]) wanted.push(id);
      continue;
    }
    // An older baseline recorded one hash for the whole corpus, so a per-prompt
    // comparison is unavailable and these are left alone.
    if (recorded) unverified.push(id);
  }
  return { ids: wanted, unverified };
}

function assertBaselineCorpusMatches(skill, force) {
  const meta = readBaselineMeta();
  const recorded = meta && meta.corpusHash && meta.corpusHash[skill];
  if (!recorded) return;

  const current = corpusFileHashes(skill);
  const changed = typeof recorded === 'object'
    ? Object.keys(current).filter(id => recorded[id] !== current[id])
    : (recorded === corpusHash(skill) ? [] : Object.keys(current));

  if (changed.length === 0) return;

  if (force) {
    console.log(`--force: the ${skill} corpus changed for ${changed.join(', ')}`);
    return;
  }
  throw new Error(
    `the ${skill} corpus changed for ${changed.join(', ')} since the baseline ` +
    'was made. The baseline answers the old prompts, so a run would compare a ' +
    'new after text against a before text made from different input. ' +
    `Regenerate the changed ones with \`node tests/run.js ${skill} ` +
    '--make-baseline`, or pass --force to compare them anyway.'
  );
}

// Runs before the credential check and the isolation probe, so a missing
// baseline costs no model call.
function assertBaselineComplete(skill, ids) {
  const missing = ids.filter(id => !fs.existsSync(path.join(BASELINE, skill, `${id}.before.md`)));
  if (missing.length === 0) return;

  throw new Error(
    `the baseline has no before text for ${skill} ${missing.join(', ')}. ` +
    `Generate it once with \`node tests/run.js ${skill} --make-baseline\`, or ` +
    'pass --fresh-before to generate the before texts as part of this run.'
  );
}

function readBaselineMeta() {
  const file = path.join(BASELINE, 'meta.json');
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    return null;
  }
}

// The baseline and the after call must come from the same model. A baseline
// written by one model and an after text written by another measures both the
// skill and the difference between the models, and reports the total as the
// skill's effect.
function assertBaselineModelMatches(force) {
  const meta = readBaselineMeta();
  const wanted = pinnedModel();
  if (!meta || !wanted) return;

  const used = meta.modelPinned || (meta.models || [])[0] || null;
  if (!used || used === wanted) return;

  if (force) {
    console.log(`--force: the baseline came from ${used} and this run pins ${wanted}`);
    return;
  }
  throw new Error(
    `the baseline came from ${used} and this run pins ${wanted}. Comparing ` +
    'them measures the difference between the models as well as the skill. ' +
    `Regenerate the baseline with --make-baseline --model ${wanted}, or pass ` +
    '--force to compare them anyway.'
  );
}

function gitCommit() {
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch (error) {
    return 'unknown';
  }
}

function cliVersion(env) {
  const result = spawnSync(CLAUDE_BIN, ['--version'], { env, encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : 'unknown';
}

// One run directory holds every skill, and each skill is a separate invocation
// of this file, so the second write must add to the first instead of replacing
// it. Calls and cost accumulate, models merge, and each skill keeps its own
// entry under `skills`. Without this the run records only whichever skill ran
// last, and the cost estimate in all.js reads a fraction of the real figure.
function mergeMeta(file, skill, fresh) {
  let existing = null;
  if (fs.existsSync(file)) {
    try {
      existing = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (error) {
      existing = null;
    }
  }

  const skills = Object.assign({}, existing && existing.skills);
  skills[skill] = {
    calls: fresh.calls,
    costUSD: fresh.costUSD,
    models: fresh.models,
    // Each skill has its own installed files, so the fingerprint belongs to the
    // skill and not to the run.
    fingerprint: fresh.skillFingerprint || null
  };

  const totals = Object.values(skills).reduce(
    (sum, entry) => ({
      calls: sum.calls + entry.calls,
      costUSD: sum.costUSD + entry.costUSD
    }),
    { calls: 0, costUSD: 0 }
  );

  const merged = Object.assign({}, fresh, {
    models: [...new Set(Object.values(skills).flatMap(entry => entry.models))].sort(),
    calls: totals.calls,
    costUSD: Number(totals.costUSD.toFixed(4)),
    skills
  });
  delete merged.skillFingerprint;
  return merged;
}

function main(argv) {
  loadEnvFile();
  const args = argv.slice(2);

  if (args.includes('--show-instruction')) {
    console.log(REWRITE_INSTRUCTION);
    return;
  }

  const skill = args.find(a => !a.startsWith('--'));
  if (!SKILLS.includes(skill)) {
    console.error(
      `usage: node tests/run.js <${SKILLS.join('|')}> [--out <dir>] [--dry-run]\n` +
      '                        [--force] [--model <id>] [--fresh-before]\n' +
      '                        [--make-baseline]'
    );
    process.exit(1);
  }

  const modelIndex = args.indexOf('--model');
  if (modelIndex >= 0) process.env.PROSE_TEST_MODEL = args[modelIndex + 1];

  const outIndex = args.indexOf('--out');
  const runDir = outIndex >= 0 ? args[outIndex + 1] : path.join(__dirname, 'runs', stamp());
  const dryRun = args.includes('--dry-run');

  const makeBaseline = args.includes('--make-baseline');
  const freshBefore = args.includes('--fresh-before');
  const force = args.includes('--force');

  const corpusIds = fs.readdirSync(path.join(CORPUS, skill))
    .filter(f => f.endsWith('.md'))
    .sort()
    .map(f => f.slice(0, 2));

  // Fail before creating anything if the run cannot authenticate. An isolated
  // configuration directory cannot see the keychain login the interactive CLI
  // uses, so the credential comes from the environment. A dry run makes no
  // model call, so it needs no credential and runs no probe, which keeps the
  // plumbing testable without one.
  if (!dryRun) console.log(`credential from ${assertAuthAvailable()}`);

  let work = { ids: corpusIds, unverified: [] };
  if (makeBaseline) {
    work = baselineWorkList(skill, corpusIds, force);
    if (work.ids.length === 0) {
      console.log(`the ${skill} baseline is already current for ${corpusIds.join(', ')}.`);
      console.log('Pass --force to regenerate every before text.');
      return;
    }
    console.log(`generating ${work.ids.join(', ')}`);
    if (work.unverified.length > 0) {
      console.log(
        `leaving ${work.unverified.join(', ')} alone. The baseline recorded one ` +
        'hash for the whole corpus, so no per-prompt comparison is available ' +
        'for them. Pass --force to regenerate every before text.'
      );
    }
  } else if (!freshBefore && !dryRun) {
    assertBaselineComplete(skill, corpusIds);
    assertBaselineCorpusMatches(skill, force);
    assertBaselineModelMatches(force);
    assertRunDirFree(runDir, skill, force);
  } else {
    assertRunDirFree(runDir, skill, force);
  }

  const started = Date.now();
  const tally = { models: new Set(), costUSD: 0 };
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
      assertIsolated(callClaude(probePrompt(skill), env, tally, configDir), skill);
      console.log('isolation confirmed');
    }

    const skillBody = makeBaseline ? '' : readSkillBody(skill);
    const outDir = makeBaseline ? path.join(BASELINE, skill) : path.join(runDir, skill);
    fs.mkdirSync(outDir, { recursive: true });

    const files = fs.readdirSync(path.join(CORPUS, skill)).filter(f => f.endsWith('.md')).sort();

    for (const file of files) {
      const id = file.slice(0, 2);
      if (makeBaseline && !work.ids.includes(id)) continue;

      const prompt = fs.readFileSync(path.join(CORPUS, skill, file), 'utf8');
      process.stdout.write(`  ${file}  `);

      if (dryRun) {
        console.log('skipped');
        continue;
      }

      let before;
      if (makeBaseline || freshBefore) {
        before = callClaude(prompt, env, tally, configDir);
        process.stdout.write('before ');
      } else {
        before = readBaseline(skill, id);
        process.stdout.write('baseline ');
      }
      fs.writeFileSync(path.join(outDir, `${id}.before.md`), `${before}\n`);

      if (makeBaseline) {
        console.log('written');
        continue;
      }

      const after = callClaude(buildAfterPrompt(skillBody, before), env, tally, configDir);
      fs.writeFileSync(path.join(outDir, `${id}.after.md`), `${after}\n`);
      console.log('after');
    }

    if (makeBaseline) {
      fs.mkdirSync(BASELINE, { recursive: true });
      const baselineMeta = {
        models: [...tally.models].sort(),
        modelPinned: pinnedModel() || null,
        date: today(),
        cli: cliVersion(env),
        corpusCommit: gitCommit(),
        corpusHash: { [skill]: corpusFileHashes(skill) },
        skills: [skill]
      };
      const existing = readBaselineMeta();
      if (existing && Array.isArray(existing.skills)) {
        baselineMeta.skills = [...new Set([...existing.skills, skill])].sort();
      }
      if (existing && existing.corpusHash) {
        baselineMeta.corpusHash = Object.assign({}, existing.corpusHash, baselineMeta.corpusHash);
      }
      fs.writeFileSync(path.join(BASELINE, 'meta.json'), `${JSON.stringify(baselineMeta, null, 2)}\n`);
      console.log(`\nwrote ${path.join(BASELINE, skill)}`);
      console.log(`${work.ids.length + 1} model calls, ${Math.round((Date.now() - started) / 1000)} seconds`);
      console.log(`cost: $${tally.costUSD.toFixed(4)}`);
      console.log('Commit tests/baseline so every later run compares the same texts.');
      return;
    }

    const calls = (makeBaseline || freshBefore) ? files.length * 2 + 1 : files.length + 1;
    const meta = mergeMeta(path.join(runDir, 'meta.json'), skill, {
      // Every model the run actually used, as the CLI reported it per call.
      models: [...tally.models].sort(),
      modelPinned: pinnedModel() || null,
      // calls and cost together give a per-call figure, which `all.js --plan`
      // multiplies to predict what a run will cost.
      calls,
      baseline: (makeBaseline || freshBefore) ? null : 'tests/baseline',
      costUSD: Number(tally.costUSD.toFixed(4)),
      date: today(),
      cli: cliVersion(env),
      corpusCommit: gitCommit(),
      instructionHash: crypto.createHash('sha256').update(REWRITE_INSTRUCTION).digest('hex').slice(0, 12),
      skillFingerprint: skillFingerprint(skill)
    });
    fs.writeFileSync(path.join(runDir, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`);

    console.log(`\nwrote ${runDir}`);
    if (dryRun) {
      // No model call was made, so no call count, no token-cost note, and no
      // scorer command: none of the three describes what a dry run did.
      console.log(`dry run: walked ${files.length} corpus files, made no model calls`);
      console.log('the throwaway configuration directory was created and will be deleted on exit');
    } else {
      const calls = (makeBaseline || freshBefore) ? files.length * 2 + 1 : files.length + 1;
      console.log(`${calls} model calls, ${Math.round((Date.now() - started) / 1000)} seconds`);
      console.log(`models: ${[...tally.models].sort().join(', ') || 'none reported'}`);
      console.log(`cost: $${tally.costUSD.toFixed(4)}`);
      console.log(`score it with: node tests/score.js ${runDir}`);
    }
  } finally {
    cleanUp();
  }
}

if (require.main === module) {
  try {
    main(process.argv);
  } catch (error) {
    // Surface the message alone: a missing credential or a failed isolation
    // check is a runner telling the reader what to do next, not a crash, and a
    // stack trace buries the one line that matters.
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  buildAfterPrompt, REWRITE_INSTRUCTION, stamp, assertRunDirFree, readBaseline,
  assertBaselineComplete, assertBaselineCorpusMatches, assertBaselineModelMatches,
  corpusHash, corpusFileHashes, baselineWorkList, pinnedModel, mergeMeta, skillFingerprint,
  resolveSkillDir, readSkillBody, SKILLS, PLUGIN_SKILLS
};
