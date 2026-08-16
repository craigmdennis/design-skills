'use strict';
const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { scoreRun } = require('../score');

const SAMPLE = path.join(__dirname, '..', 'fixtures', 'run-sample');
const APPROXIMATE = path.join(__dirname, '..', 'fixtures', 'run-approximate');
const REGRESSION = path.join(__dirname, '..', 'fixtures', 'run-regression');
const CLEAN = path.join(__dirname, '..', 'fixtures', 'run-clean');
const ORPHAN = path.join(__dirname, '..', 'fixtures', 'run-orphan');

test('scoreRun reports one result per skill in the run', () => {
  const results = scoreRun(SAMPLE);
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].skill, 'conversation');
});

test('scoreRun counts the exact tier only in the total', () => {
  const [result] = scoreRun(SAMPLE);
  const exact = result.detectors.filter(d => d.tier === 'exact');
  const sumBefore = exact.reduce((n, d) => n + d.before, 0);
  assert.strictEqual(result.exactBefore, sumBefore);
});

test('the sample run improves', () => {
  const [result] = scoreRun(SAMPLE);
  assert.ok(result.exactAfter < result.exactBefore, 'after should have fewer violations');
  assert.ok(result.delta < 0, 'delta should be negative');
});

test('scoreRun normalises per 1,000 words', () => {
  const [result] = scoreRun(SAMPLE);
  const expected = (result.exactBefore / result.wordsBefore) * 1000;
  assert.ok(Math.abs(result.perThousandBefore - expected) < 0.01);
});

test('scoreRun throws on a missing run directory', () => {
  assert.throws(() => scoreRun(path.join(SAMPLE, 'nope')));
});

test('approximate-tier movement does not affect the exact total or the delta', () => {
  const [result] = scoreRun(APPROXIMATE);
  const exact = result.detectors.filter(d => d.tier === 'exact');
  const approximate = result.detectors.filter(d => d.tier === 'approximate');

  const exactBeforeSum = exact.reduce((n, d) => n + d.before, 0);
  const exactAfterSum = exact.reduce((n, d) => n + d.after, 0);
  assert.strictEqual(exactBeforeSum, 0, 'the fixture must carry no exact-tier violations before');
  assert.strictEqual(exactAfterSum, 0, 'the fixture must carry no exact-tier violations after');

  assert.strictEqual(result.exactBefore, 0);
  assert.strictEqual(result.exactAfter, 0);
  assert.strictEqual(result.perThousandBefore, 0);
  assert.strictEqual(result.perThousandAfter, 0);
  assert.strictEqual(result.delta, 0);

  const moved = approximate.some(d => d.before !== d.after);
  assert.ok(moved, 'at least one approximate detector must differ between before and after');
});

test('delta is null when the before text is clean and the after text is not', () => {
  const [result] = scoreRun(REGRESSION);
  assert.strictEqual(result.exactBefore, 0);
  assert.ok(result.exactAfter > 0, 'the after text must introduce a violation');
  assert.strictEqual(result.delta, null);
});

test('delta is 0 when both before and after are clean', () => {
  const [result] = scoreRun(CLEAN);
  assert.strictEqual(result.exactBefore, 0);
  assert.strictEqual(result.exactAfter, 0);
  assert.strictEqual(result.delta, 0);
});

test('scoreRun throws when a before file has no matching after file', () => {
  assert.throws(() => scoreRun(ORPHAN));
});
