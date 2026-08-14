'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { stripQuoted, countWords, splitSentences } = require('./text');

test('stripQuoted removes fenced code blocks', () => {
  const input = 'Before.\n\n```js\nconst a = 1;\n```\n\nAfter.';
  const out = stripQuoted(input);
  assert.ok(!out.includes('const a = 1;'));
  assert.ok(out.includes('Before.'));
  assert.ok(out.includes('After.'));
});

test('stripQuoted removes inline code spans', () => {
  assert.ok(!stripQuoted('Run `npm test; now` first.').includes('npm test'));
});

test('stripQuoted removes block quotations', () => {
  const input = 'A rule.\n\n> the rule holds; it earned its keep\n\nAnother rule.';
  const out = stripQuoted(input);
  assert.ok(!out.includes('earned its keep'));
  assert.ok(out.includes('Another rule.'));
});

test('stripQuoted keeps ordinary prose untouched', () => {
  const input = 'The build failed. The cause was a placeholder.';
  assert.strictEqual(stripQuoted(input).trim(), input);
});

test('countWords counts words and not punctuation', () => {
  assert.strictEqual(countWords('The build failed, twice.'), 4);
});

test('splitSentences splits on terminators', () => {
  const s = splitSentences('One thing. Two things! Three things?');
  assert.strictEqual(s.length, 3);
});

test('splitSentences ignores headings and list markers', () => {
  const s = splitSentences('# A heading\n\n- One item.\n- Two items.');
  assert.strictEqual(s.length, 3);
  assert.strictEqual(s[0], 'A heading.');
  assert.ok(!s[0].startsWith('#'));
});

test('splitSentences terminates headings without punctuation', () => {
  const s = splitSentences('# Install\n\nRun the build first.');
  assert.strictEqual(s.length, 2);
  assert.ok(!s[0].includes('Run'));
  assert.ok(!s[1].includes('Install'));
});

test('splitSentences terminates list items without punctuation', () => {
  const s = splitSentences('- first item\n- second item');
  assert.strictEqual(s.length, 2);
});

test('splitSentences preserves question marks in headings', () => {
  const s = splitSentences('# Why?\n\nBecause it fails.');
  assert.strictEqual(s.length, 2);
  assert.strictEqual(s[0], 'Why?');
});

test('splitSentences handles ordered lists', () => {
  const s = splitSentences('1. Run the build\n2. Check the size');
  assert.strictEqual(s.length, 2);
  assert.ok(!s[0].match(/^\d/));
  assert.ok(!s[1].match(/^\d/));
});
