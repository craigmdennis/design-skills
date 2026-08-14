'use strict';
const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { scoreRun } = require('../score');

const SAMPLE = path.join(__dirname, '..', 'fixtures', 'run-sample');

test('scoreRun reports one result per skill in the run', () => {
  const results = scoreRun(SAMPLE);
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].skill, 'conversation-prose');
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
