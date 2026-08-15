'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const {
  makeCleanConfigDir, removeConfigDir, cleanEnv, assertIsolated, assertAuthAvailable
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
  assert.strictEqual(assertAuthAvailable({ CLAUDE_CODE_OAUTH_TOKEN: 'x' }), 'CLAUDE_CODE_OAUTH_TOKEN');
  assert.strictEqual(assertAuthAvailable({ ANTHROPIC_API_KEY: 'x' }), 'ANTHROPIC_API_KEY');
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

test('assertIsolated throws when the probe names a prose skill, proven by the pattern reason', () => {
  // The reply also affirms NONE, so this can only fail by matching the
  // contaminant pattern, not by lacking the affirmation.
  assert.throws(
    () => assertIsolated('Loaded skills: conversation-prose. NONE else.'),
    /the probe returned/
  );
});

test('assertIsolated throws when the probe names an injection point, proven by the pattern reason', () => {
  assert.throws(
    () => assertIsolated('A UserPromptSubmit hook injected checks.md. NONE else.'),
    /the probe returned/
  );
});

test('assertIsolated throws when the probe names a contaminant with no NONE affirmation', () => {
  assert.throws(() => assertIsolated('A UserPromptSubmit hook injected checks.md'), /not isolated/i);
});

test('assertIsolated throws when the probe names an unrelated skill that no pattern lists', () => {
  assert.throws(
    () => assertIsolated('Loaded skill: some-unrelated-helper'),
    /did not report an empty context/
  );
});

test('assertIsolated passes on a clean probe', () => {
  assert.doesNotThrow(() => assertIsolated('NONE'));
});
