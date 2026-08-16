'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const RUN_JS = path.join(__dirname, '..', 'run.js');
const INJECT_JS = path.join(__dirname, '..', '..', 'plugins', 'prose', 'scripts', 'inject.js');
const PLUGIN_ROOT = path.join(__dirname, '..', '..', 'plugins', 'prose');

// Both the harness and the hook script resolve a skill in two places: an
// installed copy at ~/.claude/skills/<skill>/ first, the plugin's own second.
// The order is the whole point — an installed copy may carry local edits, and
// measuring or injecting the plugin's copy instead would silently describe a
// skill the reader is not running. Neither can be tested in process, because
// the home directory is read once at load, so each test drives a child with a
// planted HOME.

function withFakeHome(fn) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'prose-home-'));
  try {
    return fn(home);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
}

function plantSkill(home, skill, files) {
  const dir = path.join(home, '.claude', 'skills', skill);
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, body] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), body);
  }
  return dir;
}

function resolveIn(home, skill) {
  const result = spawnSync(
    process.execPath,
    ['-e', `process.stdout.write(JSON.stringify(require(${JSON.stringify(RUN_JS)}).resolveSkillDir(${JSON.stringify(skill)})))`],
    { encoding: 'utf8', env: Object.assign({}, process.env, { HOME: home }) }
  );
  assert.strictEqual(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test('the harness measures an installed copy in preference to the plugin', () => {
  withFakeHome(home => {
    const planted = plantSkill(home, 'conversation', { 'SKILL.md': '# local\n' });
    const { dir, source } = resolveIn(home, 'conversation');
    assert.strictEqual(source, 'installed');
    assert.strictEqual(dir, planted);
  });
});

test('the harness falls back to the plugin when nothing is installed', () => {
  withFakeHome(home => {
    const { dir, source } = resolveIn(home, 'conversation');
    assert.strictEqual(source, 'plugin');
    assert.match(dir, /plugins[/\\]prose[/\\]skills[/\\]conversation$/);
  });
});

function inject(home, skill, file) {
  const result = spawnSync(
    process.execPath,
    [INJECT_JS, skill, file],
    {
      encoding: 'utf8',
      env: Object.assign({}, process.env, { HOME: home, CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT })
    }
  );
  assert.strictEqual(result.status, 0, 'the hook script always exits 0');
  return result.stdout;
}

test('the hook injects an installed copy in preference to the plugin', () => {
  withFakeHome(home => {
    plantSkill(home, 'conversation', { 'checks.md': 'LOCAL CHECKS\n' });
    assert.strictEqual(inject(home, 'conversation', 'checks.md'), 'LOCAL CHECKS\n');
  });
});

test('the hook falls back to the plugin when nothing is installed', () => {
  withFakeHome(home => {
    assert.match(inject(home, 'conversation', 'checks.md'), /^# conversation: run these/);
  });
});

// An empty file is a truncated write, never a deliberate silence. Stopping
// there would leave the standard out of context with no sign that it happened.
test('the hook reads past an empty installed copy to the plugin', () => {
  withFakeHome(home => {
    plantSkill(home, 'conversation', { 'checks.md': '   \n' });
    assert.match(inject(home, 'conversation', 'checks.md'), /^# conversation: run these/);
  });
});

test('the hook strips frontmatter, which is loader metadata and not prose', () => {
  withFakeHome(home => {
    plantSkill(home, 'conversation', {
      'SKILL.md': '---\nname: conversation\ndescription: x\n---\n\n# Body\n'
    });
    assert.strictEqual(inject(home, 'conversation', 'SKILL.md'), '# Body\n');
  });
});

test('the hook prints nothing and exits 0 when a skill is in neither place', () => {
  withFakeHome(home => {
    assert.strictEqual(inject(home, 'no-such-skill', 'SKILL.md'), '');
  });
});
