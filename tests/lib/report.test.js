'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { build, readJudged, pairTable, checkTable } = require('../report');

// A run directory with two pairs, a judged record, and a control record. The
// texts are short and carry known violations, so the detector counts in the
// report are predictable.
function makeRun() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prose-report-'));
  const skillDir = path.join(dir, 'conversation-prose');
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(path.join(skillDir, '01.before.md'),
    'The rule holds; I decided to keep it rather than drop it.\n');
  fs.writeFileSync(path.join(skillDir, '01.after.md'), 'The rule applies. I kept it.\n');
  fs.writeFileSync(path.join(skillDir, '02.before.md'), 'The check earned its keep.\n');
  fs.writeFileSync(path.join(skillDir, '02.after.md'), 'The check found two failures.\n');

  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify({
    modelPinned: 'test-model', models: ['test-model'], calls: 3, costUSD: 0.2,
    date: '2026-08-15', cli: 'test', corpusCommit: 'abc1234', baseline: 'tests/baseline',
    skills: { 'conversation-prose': { calls: 3, costUSD: 0.2, models: ['test-model'] } }
  }));
  return dir;
}

const JUDGED = {
  rounds: 2, batch: false, control: false, blinded: true, calls: 4,
  model: 'test-model', costUSD: 0.5,
  results: [{
    skill: 'conversation-prose',
    pairs: 2,
    rows: [
      { round: 1, before: 10, after: 30, a: 20, b: 20, denominator: 32, unparsed: 0 },
      { round: 2, before: 12, after: 30, a: 21, b: 21, denominator: 32, unparsed: 0 }
    ]
  }],
  positionSplit: {
    inA: { calls: 2, after: 93.8, before: 34.4 },
    inB: { calls: 2, after: 93.8, before: 3.1 }
  },
  marks: [
    {
      skill: 'conversation-prose', round: 1, pair: '01', afterSlot: 'b',
      a: 4, b: 15, before: 4, after: 15, denominator: 16,
      checks: [
        { check: '1 animacy', before: 'FAIL', after: 'PASS', quote: 'the check earned its keep' },
        { check: '2 literal', before: 'PASS', after: 'PASS', quote: null }
      ]
    },
    {
      skill: 'conversation-prose', round: 1, pair: '02', afterSlot: 'a',
      a: 15, b: 6, before: 6, after: 15, denominator: 16,
      checks: [
        { check: '1 animacy', before: 'FAIL', after: 'PASS', quote: null },
        { check: '2 literal', before: 'FAIL', after: 'PASS', quote: 'a rock that wants' }
      ]
    }
  ]
};

test('the report names the run, the model, and the judging mode', () => {
  const dir = makeRun();
  try {
    fs.writeFileSync(path.join(dir, 'judge.per-pair.test-model.json'), JSON.stringify(JUDGED));
    const report = build(dir);
    assert.match(report, /# Prose skill test report/);
    assert.match(report, /\| model, pinned \| test-model \|/);
    assert.match(report, /per-pair, 2 rounds, 4 calls/);
    assert.match(report, /\| judge blinded \| yes \|/);
    assert.match(report, /corpus commit \| abc1234/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('the headline percentage spans the same rounds as the count beside it', () => {
  const dir = makeRun();
  try {
    fs.writeFileSync(path.join(dir, 'judge.per-pair.test-model.json'), JSON.stringify(JUDGED));
    const report = build(dir);
    // before ran 10 and 12 of 32, which is 31.3% to 37.5%.
    assert.match(report, /10 to 12\/32 \(31\.3% to 37\.5%\)/);
    // after was 30 both rounds, so one figure and one percentage.
    assert.match(report, /30\/32 \(93\.8%\)/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('the report survives a run that was never judged', () => {
  const dir = makeRun();
  try {
    const report = build(dir);
    assert.match(report, /not judged/);
    assert.match(report, /per 1,000 words/);
    assert.ok(!/Calibration\n\n\|/.test(report), 'no calibration table without a judged record');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('the report carries the cost of every phase it found', () => {
  const dir = makeRun();
  try {
    fs.writeFileSync(path.join(dir, 'judge.per-pair.test-model.json'), JSON.stringify(JUDGED));
    fs.writeFileSync(path.join(dir, 'judge.control.per-pair.test-model.json'), JSON.stringify({
      rounds: 1, batch: false, control: true, calls: 2, costUSD: 0.25,
      results: [{
        skill: 'conversation-prose', pairs: 2,
        rows: [{ round: 1, before: 10, after: 10, a: 10, b: 10, denominator: 32, unparsed: 0 }]
      }],
      marks: []
    }));
    const report = build(dir);
    assert.match(report, /\$0\.95 \(\$0\.20 corpus, \$0\.50 judging, \$0\.25 control\)/);
    assert.match(report, /judged against a copy of itself/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('the per-pair record is preferred over a batch record', () => {
  const dir = makeRun();
  try {
    fs.writeFileSync(path.join(dir, 'judge.batch.other.json'), JSON.stringify({ calls: 1 }));
    fs.writeFileSync(path.join(dir, 'judge.per-pair.test-model.json'), JSON.stringify(JUDGED));
    const { main } = readJudged(dir);
    assert.strictEqual(main.file, 'judge.per-pair.test-model.json');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('a control record is never read as the main result', () => {
  const dir = makeRun();
  try {
    fs.writeFileSync(path.join(dir, 'judge.control.per-pair.test-model.json'),
      JSON.stringify({ calls: 2, control: true }));
    const { main, control } = readJudged(dir);
    assert.strictEqual(main, null);
    assert.strictEqual(control.file, 'judge.control.per-pair.test-model.json');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('the per-prompt table averages every round of each pair', () => {
  const table = pairTable([
    { skill: 's', pair: '01', before: 4, after: 16, denominator: 16 },
    { skill: 's', pair: '01', before: 6, after: 16, denominator: 16 },
    { skill: 's', pair: '02', before: 8, after: 12, denominator: 16 }
  ], 's');
  assert.match(table, /\| 01 \| 5\.0\/16 \| 16\.0\/16 \| \+11\.0 \| 2 \|/);
  assert.match(table, /\| 02 \| 8\.0\/16 \| 12\.0\/16 \| \+4\.0 \| 1 \|/);
});

test('the per-check table counts failures and quotes one of them', () => {
  const table = checkTable(JUDGED.marks, 'conversation-prose');
  assert.match(table, /\| 1 animacy \| 2\/2 \| 0\/2 \| "the check earned its keep" \|/);
  assert.match(table, /\| 2 literal \| 1\/2 \| 0\/2 \| "a rock that wants" \|/);
});

test('the per-check table is empty when the record carries no check rows', () => {
  assert.strictEqual(checkTable([{ skill: 's', pair: '01', checks: null }], 's'), '');
});

test('the report states what the figures do not show', () => {
  const dir = makeRun();
  try {
    const report = build(dir);
    assert.match(report, /not calibrated against a person/);
    assert.match(report, /published-prose` is not covered/);
    assert.match(report, /does not measure whether the writing is better/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('the report names a skill measured against a different check list', () => {
  const dir = makeRun();
  try {
    const meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8'));
    meta.skills['conversation-prose'].fingerprint = {
      installed: { 'SKILL.md': 'aaaaaaaaaaaa', 'checks.md': 'bbbbbbbbbbbb' },
      checkCount: 16, publishedCheckCount: 15, checksMatchPublished: false
    };
    fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta));

    const report = build(dir);
    assert.match(report, /\| \*\*no\*\* \|/);
    assert.match(report, /differs from the one in `prompts\/`/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('the report confirms the check list a reader would install', () => {
  const dir = makeRun();
  try {
    const meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8'));
    meta.skills['conversation-prose'].fingerprint = {
      installed: { 'SKILL.md': 'aaaaaaaaaaaa', 'checks.md': 'bbbbbbbbbbbb' },
      checkCount: 16, publishedCheckCount: 16, checksMatchPublished: true
    };
    fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta));

    const report = build(dir);
    assert.match(report, /\| yes \|/);
    assert.ok(!/differs from the one in/.test(report));
    assert.match(report, /\| 16 \|/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
