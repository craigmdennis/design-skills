'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const JUDGE_JS = path.join(__dirname, '..', 'judge.js');
const SKILL_HOME = path.join(os.homedir(), '.claude', 'skills');

// These tests drive judge.js as a child process and make no model call. A stub
// binary stands in for the CLI, records the arguments it was given, and returns
// a canned reply. The judge once reached a real run with no credential loaded
// and stopped at its first call, after the corpus phase had been paid for, and
// nothing here covered that path.
function makeStub(dir) {
  const stub = path.join(dir, 'claude-stub.js');
  const log = path.join(dir, 'invocations.log');
  fs.writeFileSync(stub, [
    '#!/usr/bin/env node',
    "const fs = require('node:fs');",
    // Log the flags alone, one line per call. The prompt carries newlines, so
    // logging every argument would write many lines for a single invocation.
    "const flags = process.argv.slice(2).filter(a => a.startsWith('--'));",
    `fs.appendFileSync(${JSON.stringify(log)}, flags.join(' ') + '\\n');`,
    "process.stdout.write(JSON.stringify({",
    "  result: 'TOTALS A 4/16 B 13/16',",
    "  total_cost_usd: 0.01,",
    "  modelUsage: { 'stub-model': {} }",
    '}));'
  ].join('\n'));
  fs.chmodSync(stub, 0o755);
  return { stub, log };
}

function makeRun(dir) {
  const skillDir = path.join(dir, 'conversation-prose');
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(path.join(skillDir, '01.before.md'), 'The rule holds; I decided to keep it.\n');
  fs.writeFileSync(path.join(skillDir, '01.after.md'), 'The rule applies. I kept it.\n');
}

test('the judge reaches its first call and parses the reply', t => {
  if (!fs.existsSync(path.join(SKILL_HOME, 'conversation-prose'))) {
    t.skip('conversation-prose is not installed, so the judge has no checks to send');
    return;
  }

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prose-judge-'));
  try {
    const { stub, log } = makeStub(dir);
    makeRun(dir);

    const result = spawnSync(process.execPath, [JUDGE_JS, dir, '--rounds', '1'], {
      encoding: 'utf8',
      env: Object.assign({}, process.env, { CLAUDE_CODE_EXECPATH: `${process.execPath} ${stub}` })
    });

    // The stub path carries a space, so spawnSync cannot run it as one binary.
    // Fall back to a shell wrapper when that is how this platform behaves.
    if (result.status !== 0) {
      const wrapper = path.join(dir, 'claude');
      fs.writeFileSync(wrapper, `#!/bin/sh\nexec ${process.execPath} ${stub} "$@"\n`);
      fs.chmodSync(wrapper, 0o755);

      const second = spawnSync(process.execPath, [JUDGE_JS, dir, '--rounds', '1'], {
        encoding: 'utf8',
        env: Object.assign({}, process.env, { CLAUDE_CODE_EXECPATH: wrapper })
      });
      assert.strictEqual(second.status, 0, `judge exited ${second.status}: ${second.stderr}`);
      assert.match(second.stdout, /checks passed: before 4\/16   after 13\/16/);
    } else {
      assert.match(result.stdout, /checks passed: before 4\/16   after 13\/16/);
    }

    const invocations = fs.readFileSync(log, 'utf8').trim().split('\n');
    assert.strictEqual(invocations.length, 1, 'one pair and one round is one call');
    assert.match(invocations[0], /--bare/);
    assert.match(invocations[0], /--disallowedTools/);
    assert.match(invocations[0], /--disable-slash-commands/);

    // The record is named for its model and its mode, so two judged runs of one
    // directory never overwrite each other. The child loads the environment file,
    // which may pin a model this process cannot see, so the file is found here
    // and not predicted.
    const records = fs.readdirSync(dir).filter(f => /^judge\..+\.json$/.test(f));
    assert.strictEqual(records.length, 1, `expected one judged record, found ${records}`);
    assert.match(records[0], /^judge\.per-pair\./);

    const record = JSON.parse(fs.readFileSync(path.join(dir, records[0]), 'utf8'));
    assert.strictEqual(record.calls, 1);
    assert.strictEqual(record.rounds, 1);
    assert.strictEqual(record.batch, false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('the judge stops before its first call when no credential is set', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prose-judge-'));
  try {
    const { log } = makeStub(dir);
    makeRun(dir);

    const env = Object.assign({}, process.env);
    delete env.ANTHROPIC_API_KEY;
    delete env.CLAUDE_CODE_OAUTH_TOKEN;
    env.PROSE_TEST_SKIP_ENV_FILE = '1';

    const result = spawnSync(process.execPath, [JUDGE_JS, dir, '--rounds', '1'], {
      encoding: 'utf8', env
    });

    assert.strictEqual(result.status, 1);
    assert.match(result.stderr, /no ANTHROPIC_API_KEY/);
    assert.ok(!fs.existsSync(log), 'no call should have been made');
    assert.ok(
      fs.readdirSync(dir).every(f => !f.startsWith('judge.')),
      'no record should have been written'
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('the judge loads the credential from .env.test without shell setup', () => {
  const envFile = path.join(__dirname, '..', '..', '.env.test');
  if (!fs.existsSync(envFile)) return;

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prose-judge-'));
  try {
    makeRun(dir);

    const env = Object.assign({}, process.env);
    delete env.ANTHROPIC_API_KEY;
    delete env.CLAUDE_CODE_OAUTH_TOKEN;
    // A stub binary that exits non-zero, so the run fails at the call rather
    // than at the credential check. Reaching the call is what this asserts.
    const failing = path.join(dir, 'claude-fail');
    fs.writeFileSync(failing, '#!/bin/sh\nexit 3\n');
    fs.chmodSync(failing, 0o755);
    env.CLAUDE_CODE_EXECPATH = failing;

    const result = spawnSync(process.execPath, [JUDGE_JS, dir, '--rounds', '1'], {
      encoding: 'utf8', env
    });

    assert.strictEqual(result.status, 1);
    assert.match(result.stderr, /the judge call failed/);
    assert.ok(!/no ANTHROPIC_API_KEY/.test(result.stderr), 'the credential should have loaded');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
