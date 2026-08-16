'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const {
  buildAfterPrompt, REWRITE_INSTRUCTION, stamp, assertRunDirFree, assertBaselineComplete,
  assertBaselineCorpusMatches, corpusHash, pinnedModel, mergeMeta, skillFingerprint, resolveSkillDir, readSkillBody, SKILLS, PLUGIN_SKILLS
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
      [RUN_JS, 'conversation', '--dry-run', '--out', outDir],
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
    [RUN_JS, 'conversation', '--out', outDir],
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
  assert.doesNotThrow(() => assertRunDirFree('/no/such/prose-run', 'conversation', false));
});

test('assertRunDirFree passes on an empty skill directory', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prose-free-'));
  try {
    fs.mkdirSync(path.join(dir, 'conversation'), { recursive: true });
    assert.doesNotThrow(() => assertRunDirFree(dir, 'conversation', false));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('assertRunDirFree stops a run that would overwrite results', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prose-free-'));
  try {
    const skillDir = path.join(dir, 'conversation');
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, '01.before.md'), 'x\n');
    assert.throws(
      () => assertRunDirFree(dir, 'conversation', false),
      /already holds 1 result files/
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('assertRunDirFree lets a second skill join the same run', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prose-free-'));
  try {
    const skillDir = path.join(dir, 'conversation');
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, '01.before.md'), 'x\n');
    assert.doesNotThrow(() => assertRunDirFree(dir, 'documentation', false));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('--force allows the overwrite', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prose-free-'));
  try {
    const skillDir = path.join(dir, 'conversation');
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, '01.before.md'), 'x\n');
    assert.doesNotThrow(() => assertRunDirFree(dir, 'conversation', true));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('assertBaselineComplete names every missing before text', () => {
  // Ids the corpus will never carry, so the test holds once the baseline exists.
  assert.throws(
    () => assertBaselineComplete('conversation', ['98', '99']),
    /no before text for conversation 98, 99/
  );
});

test('assertBaselineComplete passes when every id is present', () => {
  const ids = fs.readdirSync(path.join(__dirname, '..', 'baseline', 'conversation'))
    .filter(f => f.endsWith('.before.md'))
    .map(f => f.slice(0, 2));
  assert.doesNotThrow(() => assertBaselineComplete('conversation', ids));
});

test('assertBaselineComplete names the command that fixes it', () => {
  assert.throws(
    () => assertBaselineComplete('documentation', ['99']),
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
  assert.strictEqual(corpusHash('conversation'), corpusHash('conversation'));
  assert.notStrictEqual(corpusHash('conversation'), corpusHash('documentation'));
  assert.match(corpusHash('conversation'), /^[0-9a-f]{12}$/);
});

test('assertBaselineCorpusMatches passes when no baseline meta exists', () => {
  assert.doesNotThrow(() => assertBaselineCorpusMatches('conversation', false));
});

test('a second skill adds to the run metadata instead of replacing it', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prose-meta-'));
  try {
    const file = path.join(dir, 'meta.json');

    const first = mergeMeta(file, 'conversation', {
      models: ['claude-opus-5'], calls: 7, costUSD: 0.4, date: '2026-08-15'
    });
    fs.writeFileSync(file, JSON.stringify(first));

    const second = mergeMeta(file, 'documentation', {
      models: ['claude-opus-5', 'claude-haiku-4-5'], calls: 8, costUSD: 0.5, date: '2026-08-15'
    });

    assert.strictEqual(second.calls, 15, 'both skills counted');
    assert.strictEqual(second.costUSD, 0.9);
    assert.deepStrictEqual(second.models, ['claude-haiku-4-5', 'claude-opus-5']);
    assert.deepStrictEqual(Object.keys(second.skills).sort(),
      ['conversation', 'documentation']);
    assert.strictEqual(second.skills['conversation'].calls, 7);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('re-running one skill replaces that skill and leaves the other alone', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prose-meta-'));
  try {
    const file = path.join(dir, 'meta.json');
    fs.writeFileSync(file, JSON.stringify(mergeMeta(file, 'a', {
      models: ['m'], calls: 3, costUSD: 0.1
    })));
    fs.writeFileSync(file, JSON.stringify(mergeMeta(file, 'b', {
      models: ['m'], calls: 4, costUSD: 0.2
    })));

    const again = mergeMeta(file, 'b', { models: ['m'], calls: 9, costUSD: 0.9 });
    assert.strictEqual(again.calls, 12, 'the rerun replaces b and keeps a');
    assert.strictEqual(again.skills.a.calls, 3);
    assert.strictEqual(again.skills.b.calls, 9);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('merging into a corrupt metadata file starts over instead of throwing', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prose-meta-'));
  try {
    const file = path.join(dir, 'meta.json');
    fs.writeFileSync(file, '{ not json');
    const meta = mergeMeta(file, 'a', { models: ['m'], calls: 2, costUSD: 0.1 });
    assert.strictEqual(meta.calls, 2);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('a fingerprint is stored per skill, not per run', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prose-meta-'));
  try {
    const file = path.join(dir, 'meta.json');
    fs.writeFileSync(file, JSON.stringify(mergeMeta(file, 'a', {
      models: ['m'], calls: 1, costUSD: 0.1,
      skillFingerprint: { installed: { 'SKILL.md': 'aaa' }, checksMatchPublished: true }
    })));
    const meta = mergeMeta(file, 'b', {
      models: ['m'], calls: 1, costUSD: 0.1,
      skillFingerprint: { installed: { 'SKILL.md': 'bbb' }, checksMatchPublished: true }
    });

    assert.strictEqual(meta.skills.a.fingerprint.installed['SKILL.md'], 'aaa',
      'the second skill did not overwrite the first');
    assert.strictEqual(meta.skills.b.fingerprint.installed['SKILL.md'], 'bbb');
    assert.ok(!('skillFingerprint' in meta), 'it does not sit at the top level');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('the plugin installs the same checks the figures are measured against', t => {
  // The harness reads the skill from ~/.claude/skills/ and the README publishes
  // figures from it. A reader installs the plugin. If the two check lists
  // ever diverge, the published figure describes a skill nobody can install.
  for (const skill of ['conversation', 'documentation']) {
    const print = skillFingerprint(skill);
    if (!print.installed['checks.md']) {
      t.diagnostic(`${skill} is not installed with a checks.md, so nothing was compared`);
      continue;
    }
    assert.strictEqual(
      print.checksMatchPublished, true,
      `${skill}: the installed checks (${print.checkCount}) and the checks in ` +
      `plugins/prose/skills/${skill}/checks.md (${print.publishedCheckCount}) are not the same list`
    );
  }
});

// A skill resolves in two places, installed first and the plugin second. The
// fallback is what lets a clone with nothing installed produce a figure, and
// `source` is what stops the report claiming the wrong provenance for it.
test('the plugin ships every skill the harness measures, so the fallback always finds one', () => {
  for (const skill of SKILLS) {
    const shipped = path.join(PLUGIN_SKILLS, skill, 'SKILL.md');
    assert.ok(fs.existsSync(shipped), `${skill} is measured but ${shipped} does not exist`);
  }
});

test('a resolved skill names which of the two copies produced it', () => {
  for (const skill of SKILLS) {
    const { dir, source } = resolveSkillDir(skill);
    assert.ok(dir, `${skill} resolved to nothing`);
    assert.ok(['installed', 'plugin'].includes(source), `unexpected source ${source}`);
    assert.ok(fs.existsSync(path.join(dir, 'SKILL.md')));
    assert.strictEqual(skillFingerprint(skill).source, source, 'the fingerprint records the same source');
  }
});

test('a skill in neither place resolves to nothing and names both paths', () => {
  const { dir, source } = resolveSkillDir('no-such-skill');
  assert.strictEqual(dir, null);
  assert.strictEqual(source, null);
  assert.throws(() => readSkillBody('no-such-skill'), err => {
    assert.match(err.message, /\.claude\/skills\/no-such-skill/);
    assert.match(err.message, /plugins\/prose\/skills\/no-such-skill/);
    return true;
  });
});
