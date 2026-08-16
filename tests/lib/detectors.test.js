'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { runDetectors, DETECTORS } = require('./detectors');

const FIXTURES = path.join(__dirname, '..', 'fixtures');

function checkFixture(name) {
  const text = fs.readFileSync(path.join(FIXTURES, `${name}.md`), 'utf8');
  const expected = JSON.parse(fs.readFileSync(path.join(FIXTURES, `${name}.expected.json`), 'utf8'));
  const actual = runDetectors(text, expected.skill);
  for (const [id, want] of Object.entries(expected.counts)) {
    assert.strictEqual(actual.counts[id], want, `${name}: detector ${id}`);
  }
}

test('conversation exact detectors match the fixture', () => {
  checkFixture('conversation-exact');
});

test('documentation exact detectors match the fixture', () => {
  checkFixture('documentation-exact');
});

test('every detector has an id, a label, a tier, and skills', () => {
  for (const d of DETECTORS) {
    assert.ok(d.id && d.label, 'detector needs an id and a label');
    assert.ok(['exact', 'approximate'].includes(d.tier), `${d.id} has an unknown tier`);
    assert.ok(Array.isArray(d.skills) && d.skills.length > 0, `${d.id} has no skills`);
    assert.strictEqual(typeof d.count, 'function', `${d.id} has no count function`);
  }
});

test('detector ids are unique', () => {
  const ids = DETECTORS.map(d => d.id);
  assert.strictEqual(new Set(ids).size, ids.length);
});

test('code fences and block quotes are not counted', () => {
  const plain = runDetectors('Nothing here.', 'conversation');
  const quoted = runDetectors('Nothing here.\n\n```\na; b; c;\n```\n\n> a; b;\n', 'conversation');
  assert.strictEqual(quoted.counts.semicolon, plain.counts.semicolon);
});

test('agent-clause does not count the imperative you', () => {
  const actual = runDetectors('Before you run the build, set the token.', 'documentation');
  assert.strictEqual(actual.counts['agent-clause'], 0);
});

test('approximate detectors match the fixture', () => {
  checkFixture('approximate');
});

test('approximate detectors are marked as approximate', () => {
  const ids = ['noun-cluster', 'fronted-clause', 'cleft', 'animacy', 'em-dash'];
  for (const id of ids) {
    const d = DETECTORS.find(x => x.id === id);
    assert.ok(d, `${id} is missing`);
    assert.strictEqual(d.tier, 'approximate', `${id} must be approximate`);
  }
});
