'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const JUDGE = fs.readFileSync(path.join(__dirname, '..', 'judge.md'), 'utf8');

test('the judge asks for a pass or fail on each text', () => {
  assert.match(JUDGE, /passes or fails/i);
  assert.match(JUDGE, /\|\s*before\s*\|/i);
  assert.match(JUDGE, /\|\s*after\s*\|/i);
});

test('the judge asks for a quoted sentence on every failure', () => {
  assert.match(JUDGE, /quote/i);
});

test('the judge never receives the deterministic scores', () => {
  assert.ok(!/per 1,000|exact total|detector/i.test(JUDGE),
    'a judge shown the script output agrees with the script');
});

test('the judge asks for a fixed output shape', () => {
  assert.match(JUDGE, /\|\s*check\s*\|\s*before\s*\|\s*after\s*\|\s*failing sentence\s*\|/i);
  assert.match(JUDGE, /TOTALS before \d+\/\d+ after \d+\/\d+/);
});
