'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { buildAfterPrompt, REWRITE_INSTRUCTION } = require('../run');

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
