'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { buildAfterPrompt, REWRITE_INSTRUCTION } = require('../run');

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
