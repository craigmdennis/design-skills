'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const {
  buildAfterPrompt, REWRITE_INSTRUCTION, stamp, assertRunDirFree, assertBaselineComplete,
  assertBaselineCorpusMatches, corpusHash, pinnedModel
} = require('../run');

const RUN_JS = path.join(__dirname, '..', 'run.js');

test('the after prompt contains the skill, the instruction, and the before text', () => {
  const prompt = buildAfterPrompt('SKILL BODY HERE', 'BEFORE TEXT HERE');
  assert.ok(prompt.includes('SKILL BODY HERE'));
  assert.ok(prompt.includes(REWRITE_INSTRUCTION));
  assert.ok(prompt.includes('BEFORE TEXT HERE'));
});

test('the skill comes before the instruction, and the instruction before the text', () => {
  const prompt = buildAfterPrompt('SKILLBODY', 'BEFORETEXT');
  assert.ok(prompt.indexOf('SKILLBODY') < prompt.indexOf(REWRITE_INSTRUCTION));
  assert.ok(prompt.indexOf(REWRITE_INSTRUCTION) < prompt.indexOf('BEFORETEXT'));
});

test('the instruction forbids adding or removing information', () => {
  assert.match(REWRITE_INSTRUCTION, /Do not add information/);
  assert.match(REWRITE_INSTRUCTION, /Do not remove information/);
});

// Both tests below drive the CLI entry point as a child process. Neither
// makes a model call: a dry run skips the corpus loop entirely, and a run
// with no credential fails before the first call.

test('a dry run reports no model calls and does not point at the scorer', () => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prose-run-dry-'));
  let result;
  try {
    result = spawnSync(
      process.execPath,
      [RUN_JS, 'conversation-prose', '--dry-run', '--out', outDir],
      { encoding: 'utf8' }
    );
  } finally {
    fs.rmSync(outDir, { recursive: true, force: true });
  }

  assert.strictEqual(result.status, 0);
  assert.match(result.stdout, /dry run: walked 6 corpus files, made no model calls/);
  assert.ok(!/\d+ model calls,/.test(result.stdout), 'should not report a call count it did not make');
  assert.ok(!result.stdout.includes('score it with'), 'should not point at the scorer for a run with no pairs');
});

test('a run with no credential prints the message alone, with no stack trace, and creates nothing', () => {
  const env = Object.assign({}, process.env);
  delete env.CLAUDE_CODE_OAUTH_TOKEN;
  delete env.ANTHROPIC_API_KEY;
  // Stop the runner reading .env.test, which would restore the key and start a
  // real run of twelve model calls inside this test.
  env.PROSE_TEST_SKIP_ENV_FILE = '1';

  const outDir = path.join(os.tmpdir(), `prose-run-nocred-${process.pid}`);
  assert.ok(!fs.existsSync(outDir));

  const result = spawnSync(
    process.execPath,
    [RUN_JS, 'conversation-prose', '--out', outDir],
    { encoding: 'utf8', env }
  );

  assert.strictEqual(result.status, 1);
  assert.match(result.stderr, /claude setup-token/);
  assert.ok(!result.stderr.includes('isolation.js'), 'stderr should be the message alone, not a stack trace');
  assert.ok(!result.stdout.includes('config directory:'), 'no throwaway directory should have been created');
  assert.ok(!fs.existsSync(outDir), 'no run directory should have been created');
});

test('the run stamp carries seconds and sorts in clock order', () => {
  const s = stamp();
  assert.match(s, /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}$/);
  assert.ok(!s.includes(':'), 'a colon is not usable in a path on every platform');
  assert.ok('2026-08-15T09-00-00' < '2026-08-15T14-32-08', 'the format sorts as the clock runs');
});

test('assertRunDirFree passes on a directory that does not exist', () => {
  assert.doesNotThrow(() => assertRunDirFree('/no/such/prose-run', 'conversation-prose', false));
});

test('assertRunDirFree passes on an empty skill directory', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prose-free-'));
  try {
    fs.mkdirSync(path.join(dir, 'conversation-prose'), { recursive: true });
    assert.doesNotThrow(() => assertRunDirFree(dir, 'conversation-prose', false));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('assertRunDirFree stops a run that would overwrite results', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prose-free-'));
  try {
    const skillDir = path.join(dir, 'conversation-prose');
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, '01.before.md'), 'x\n');
    assert.throws(
      () => assertRunDirFree(dir, 'conversation-prose', false),
      /already holds 1 result files/
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('assertRunDirFree lets a second skill join the same run', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prose-free-'));
  try {
    const skillDir = path.join(dir, 'conversation-prose');
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, '01.before.md'), 'x\n');
    assert.doesNotThrow(() => assertRunDirFree(dir, 'documentation-prose', false));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('--force allows the overwrite', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prose-free-'));
  try {
    const skillDir = path.join(dir, 'conversation-prose');
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, '01.before.md'), 'x\n');
    assert.doesNotThrow(() => assertRunDirFree(dir, 'conversation-prose', true));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('assertBaselineComplete names every missing before text', () => {
  // Ids the corpus will never carry, so the test holds once the baseline exists.
  assert.throws(
    () => assertBaselineComplete('conversation-prose', ['98', '99']),
    /no before text for conversation-prose 98, 99/
  );
});

test('assertBaselineComplete passes when every id is present', () => {
  const ids = fs.readdirSync(path.join(__dirname, '..', 'baseline', 'conversation-prose'))
    .filter(f => f.endsWith('.before.md'))
    .map(f => f.slice(0, 2));
  assert.doesNotThrow(() => assertBaselineComplete('conversation-prose', ids));
});

test('assertBaselineComplete names the command that fixes it', () => {
  assert.throws(
    () => assertBaselineComplete('documentation-prose', ['99']),
    /--make-baseline/
  );
});

test('pinnedModel reads the environment and returns empty when unset', () => {
  const savedPin = process.env.PROSE_TEST_MODEL;
  const savedAnthropic = process.env.ANTHROPIC_MODEL;
  try {
    process.env.PROSE_TEST_MODEL = 'claude-haiku-4-5';
    assert.strictEqual(pinnedModel(), 'claude-haiku-4-5');
    delete process.env.PROSE_TEST_MODEL;
    delete process.env.ANTHROPIC_MODEL;
    assert.strictEqual(pinnedModel(), '');
  } finally {
    if (savedPin === undefined) delete process.env.PROSE_TEST_MODEL;
    else process.env.PROSE_TEST_MODEL = savedPin;
    if (savedAnthropic === undefined) delete process.env.ANTHROPIC_MODEL;
    else process.env.ANTHROPIC_MODEL = savedAnthropic;
  }
});

test('corpusHash is stable across calls and differs between skills', () => {
  assert.strictEqual(corpusHash('conversation-prose'), corpusHash('conversation-prose'));
  assert.notStrictEqual(corpusHash('conversation-prose'), corpusHash('documentation-prose'));
  assert.match(corpusHash('conversation-prose'), /^[0-9a-f]{12}$/);
});

test('assertBaselineCorpusMatches passes when no baseline meta exists', () => {
  assert.doesNotThrow(() => assertBaselineCorpusMatches('conversation-prose', false));
});
