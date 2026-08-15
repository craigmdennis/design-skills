'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const JUDGE = fs.readFileSync(path.join(__dirname, '..', 'judge.md'), 'utf8');

test('the judge asks for a verdict on both texts', () => {
  assert.match(JUDGE, /BEFORE/);
  assert.match(JUDGE, /AFTER/);
});

test('the judge asks for a quoted sentence on every failure', () => {
  assert.match(JUDGE, /quote/i);
});

test('the judge never receives the deterministic scores', () => {
  assert.ok(!/per 1,000|exact total|detector/i.test(JUDGE),
    'a judge shown the script output agrees with the script');
});

test('the judge asks for a fixed output shape', () => {
  assert.match(JUDGE, /\| *check *\|/i);
});
