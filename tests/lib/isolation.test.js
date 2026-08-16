'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const {
  makeCleanConfigDir, removeConfigDir, cleanEnv, assertIsolated, assertAuthAvailable,
  probePrompt, CLAUDE_BIN
} = require('./isolation');

test('makeCleanConfigDir creates a directory with no CLAUDE.md, hooks, or skills', () => {
  const dir = makeCleanConfigDir();
  try {
    assert.ok(fs.existsSync(dir));
    assert.ok(!fs.existsSync(`${dir}/CLAUDE.md`));
    assert.ok(!fs.existsSync(`${dir}/skills`));
    const settings = JSON.parse(fs.readFileSync(`${dir}/settings.json`, 'utf8'));
    assert.deepStrictEqual(settings.hooks, undefined);
  } finally {
    removeConfigDir(dir);
  }
});

test('nothing is copied from the real configuration directory', () => {
  const dir = makeCleanConfigDir();
  try {
    assert.deepStrictEqual(fs.readdirSync(dir).sort(), ['settings.json']);
    assert.strictEqual(fs.statSync(dir).mode & 0o777, 0o700);
  } finally {
    removeConfigDir(dir);
  }
});

test('assertAuthAvailable names the variable it found', () => {
  assert.strictEqual(assertAuthAvailable({ ANTHROPIC_API_KEY: 'x' }), 'ANTHROPIC_API_KEY');
});

test('assertAuthAvailable rejects a setup-token credential', () => {
  // Every call passes --bare, which reads neither OAuth nor the keychain, so
  // that token fails inside the CLI with "Not logged in". Accepting it here
  // would start the run and fail one call later with a message about login.
  assert.throws(
    () => assertAuthAvailable({ CLAUDE_CODE_OAUTH_TOKEN: 'x' }),
    /no ANTHROPIC_API_KEY/
  );
});

test('assertAuthAvailable explains how to get a credential when none is set', () => {
  assert.throws(() => assertAuthAvailable({}), /setup-token/);
  assert.throws(() => assertAuthAvailable({}), /keychain/);
});

test('cleanEnv carries a credential through from the environment', () => {
  const dir = makeCleanConfigDir();
  try {
    const env = cleanEnv(dir);
    assert.strictEqual(env.PATH, process.env.PATH, 'the environment should pass through');
  } finally {
    removeConfigDir(dir);
  }
});

test('removeConfigDir deletes the directory', () => {
  const dir = makeCleanConfigDir();
  removeConfigDir(dir);
  assert.ok(!fs.existsSync(dir));
});

test('removeConfigDir is safe to call twice and on a missing directory', () => {
  const dir = makeCleanConfigDir();
  removeConfigDir(dir);
  assert.doesNotThrow(() => removeConfigDir(dir));
  assert.doesNotThrow(() => removeConfigDir('/no/such/prose-test-dir'));
});

test('cleanEnv points the CLI at the throwaway directory', () => {
  const dir = makeCleanConfigDir();
  try {
    const env = cleanEnv(dir);
    assert.strictEqual(env.CLAUDE_CONFIG_DIR, dir);
  } finally {
    removeConfigDir(dir);
  }
});

test('assertIsolated throws when the probe describes the skill under test', () => {
  assert.throws(
    () => assertIsolated('Check 8 is Signposting and significance.', 'conversation-prose'),
    /the probe described conversation-prose/
  );
});

test('assertIsolated names the skill it asked about in the message', () => {
  assert.throws(
    () => assertIsolated('It bans metaphor and idiom.', 'documentation-prose'),
    /documentation-prose/
  );
});

test('assertIsolated passes when the model reports no such skill', () => {
  assert.doesNotThrow(() => assertIsolated('NO SUCH SKILL', 'conversation-prose'));
});

test('assertIsolated passes when the denial carries surrounding prose', () => {
  assert.doesNotThrow(
    () => assertIsolated('I have no such skill in my context: NO SUCH SKILL', 'conversation-prose')
  );
});

test('assertIsolated throws on a self-report that lists context instead of answering', () => {
  // A self-report probe cannot separate a clean context from a clean context
  // plus harness text, because the model counts its own system prompt. Only the
  // exact denial passes.
  assert.throws(
    () => assertIsolated('Instruction files: none. Skills: none loaded.', 'conversation-prose'),
    /not isolated/i
  );
});

test('probePrompt names the skill and demands the exact denial', () => {
  const prompt = probePrompt('documentation-prose');
  assert.match(prompt, /documentation-prose/);
  assert.match(prompt, /NO SUCH SKILL/);
});

test('CLAUDE_BIN prefers the real binary over a wrapper on PATH', () => {
  assert.strictEqual(CLAUDE_BIN, process.env.CLAUDE_CODE_EXECPATH || 'claude');
});
