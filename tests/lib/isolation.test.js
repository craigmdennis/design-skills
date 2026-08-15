'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const { makeCleanConfigDir, removeConfigDir, cleanEnv, assertIsolated } = require('./isolation');

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

test('the copied credential is present and owner-readable only', () => {
  const dir = makeCleanConfigDir();
  try {
    const target = `${dir}/.credentials.json`;
    assert.ok(fs.existsSync(target), 'the run cannot authenticate without it');
    assert.strictEqual(fs.statSync(target).mode & 0o777, 0o600);
    assert.strictEqual(fs.statSync(dir).mode & 0o777, 0o700);
  } finally {
    removeConfigDir(dir);
  }
});

test('the credential is the only thing copied from the real configuration', () => {
  const dir = makeCleanConfigDir();
  try {
    const entries = fs.readdirSync(dir).sort();
    assert.deepStrictEqual(entries, ['.credentials.json', 'settings.json']);
  } finally {
    removeConfigDir(dir);
  }
});

test('removeConfigDir deletes the directory and the credential in it', () => {
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

test('assertIsolated throws when the probe names a prose skill', () => {
  assert.throws(() => assertIsolated('Loaded skills: conversation-prose'), /not isolated/i);
  assert.throws(() => assertIsolated('A UserPromptSubmit hook injected checks.md'), /not isolated/i);
});

test('assertIsolated passes on a clean probe', () => {
  assert.doesNotThrow(() => assertIsolated('NONE'));
});
