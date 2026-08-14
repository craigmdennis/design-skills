'use strict';

// Both prose skills exempt quoted material from their own rules, because a rule
// that bans a phrase has to print that phrase to be usable. Counting quoted
// examples would penalise a document for stating its own rules.
function stripQuoted(text) {
  let out = text.replace(/^```[\s\S]*?^```[ \t]*$/gm, '');
  out = out.replace(/^~~~[\s\S]*?^~~~[ \t]*$/gm, '');
  out = out.replace(/`[^`\n]*`/g, '');
  out = out.replace(/^[ \t]*>.*$/gm, '');
  return out;
}

function countWords(text) {
  const found = text.match(/[A-Za-z0-9][A-Za-z0-9'-]*/g);
  return found ? found.length : 0;
}

function splitSentences(text) {
  const flat = text
    .replace(/^#{1,6}[ \t]+/gm, '')
    .replace(/^[ \t]*[-*+][ \t]+/gm, '')
    .replace(/^[ \t]*\d+\.[ \t]+/gm, '')
    .replace(/\|/g, ' ');
  return flat
    .split(/(?<=[.!?])[ \t\n]+/)
    .map(s => s.replace(/\s+/g, ' ').trim())
    .filter(s => countWords(s) > 0);
}

module.exports = { stripQuoted, countWords, splitSentences };
