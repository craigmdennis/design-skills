'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ALL_JS = path.join(__dirname, '..', 'all.js');

function plan(args) {
  return spawnSync(process.execPath, [ALL_JS, ...args, '--plan'], { encoding: 'utf8' });
}

test('--plan creates no directory and makes no call', () => {
  const before = fs.existsSync(path.join(__dirname, '..', 'runs'))
    ? fs.readdirSync(path.join(__dirname, '..', 'runs')).length
    : 0;
  const result = plan([]);
  const after = fs.existsSync(path.join(__dirname, '..', 'runs'))
    ? fs.readdirSync(path.join(__dirname, '..', 'runs')).length
    : 0;

  assert.strictEqual(result.status, 0);
  assert.match(result.stdout, /nothing ran and no directory was created/);
  assert.strictEqual(after, before, '--plan should leave the runs directory alone');
});

test('--plan counts the corpus and the judging rounds', () => {
  const result = plan([]);
  assert.match(result.stdout, /15 for the corpus/);
  assert.match(result.stdout, /39 for 3 judging rounds/);
  assert.match(result.stdout, /54 in total/);
});

test('the plan counts the corpus files instead of assuming a size', () => {
  // documentation-prose carries one more prompt than conversation-prose, so a
  // hardcoded six would report the wrong number for both.
  const both = plan([]).stdout.match(/(\d+) for the corpus/)[1];
  const one = plan(['conversation-prose']).stdout.match(/(\d+) for the corpus/)[1];
  const other = plan(['documentation-prose']).stdout.match(/(\d+) for the corpus/)[1];
  assert.strictEqual(Number(both), Number(one) + Number(other));
  assert.notStrictEqual(one, other, 'the two corpora differ in size');
});

test('--batch takes judging to one call per skill per round', () => {
  const result = plan(['--batch']);
  assert.match(result.stdout, /6 for 3 judging rounds/);
  assert.match(result.stdout, /21 in total/);
});

test('--fresh-before doubles the corpus calls', () => {
  const result = plan(['--fresh-before']);
  assert.match(result.stdout, /28 for the corpus/);
});

test('the plan names where the before texts come from', () => {
  assert.match(plan([]).stdout, /before texts: from the committed baseline/);
  assert.match(plan(['--fresh-before']).stdout, /before texts: generated as part of this run/);
});

test('naming one skill counts only that corpus', () => {
  const result = plan(['conversation-prose', '--rounds', '1']);
  assert.match(result.stdout, /7 for the corpus/);
  assert.match(result.stdout, /6 for 1 judging rounds/);
  assert.match(result.stdout, /13 in total/);
});

test('--no-judge removes the judging calls from the count', () => {
  const result = plan(['--no-judge']);
  assert.match(result.stdout, /15 in total/);
  assert.ok(!result.stdout.includes('judging rounds'));
});

test('--plan reports a cost or says it has nothing to estimate from', () => {
  const result = plan([]);
  assert.match(result.stdout, /cost: (about \$\d+\.\d\d|no earlier run recorded one)/);
});

test('--rounds refuses a value that is not a whole number above zero', () => {
  const result = spawnSync(process.execPath, [ALL_JS, '--rounds', '0', '--plan'], { encoding: 'utf8' });
  assert.strictEqual(result.status, 1);
  assert.match(result.stderr, /whole number of 1 or more/);
});
