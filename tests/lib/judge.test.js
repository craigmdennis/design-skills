'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const JUDGE = fs.readFileSync(path.join(__dirname, '..', 'judge.md'), 'utf8');

test('the judge asks for a pass or fail on each text', () => {
  assert.match(JUDGE, /passes or fails/i);
  assert.match(JUDGE, /\|\s*A\s*\|/);
  assert.match(JUDGE, /\|\s*B\s*\|/);
});

test('the template names neither text before nor after', () => {
  // The template is everything the judge reads about the two texts apart from
  // the texts themselves. A judge told which one the skill produced marks the
  // other against an expectation.
  const head = JUDGE.slice(0, JUDGE.indexOf('===== CHECKS ====='));
  assert.ok(!/\bbefore\b|\bafter\b/i.test(head), head);
  assert.ok(!/skill|revis|improv|rewrit/i.test(head), head);
});

test('the judge asks for a quoted sentence on every failure', () => {
  assert.match(JUDGE, /quote/i);
});

test('the judge never receives the deterministic scores', () => {
  assert.ok(!/per 1,000|exact total|detector/i.test(JUDGE),
    'a judge shown the script output agrees with the script');
});

test('the judge asks for a fixed output shape', () => {
  assert.match(JUDGE, /\|\s*check\s*\|\s*A\s*\|\s*B\s*\|\s*failing sentence\s*\|/);
  assert.match(JUDGE, /TOTALS A \d+\/\d+ B \d+\/\d+/);
});
