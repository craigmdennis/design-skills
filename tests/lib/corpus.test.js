'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const CORPUS = path.join(__dirname, '..', 'corpus');
const SKILLS = ['conversation-prose', 'documentation-prose'];

test('each skill has at least six corpus files, numbered from 01 with no gaps', () => {
  for (const skill of SKILLS) {
    const files = fs.readdirSync(path.join(CORPUS, skill)).filter(f => f.endsWith('.md')).sort();
    assert.ok(files.length >= 6, `${skill} should have at least 6 corpus files`);

    // The runner takes each output's identifier from the first two characters
    // of the filename, so a duplicate or a gap would silently overwrite a pair.
    const ids = files.map(f => f.slice(0, 2));
    assert.deepStrictEqual(
      ids,
      files.map((f, i) => String(i + 1).padStart(2, '0')),
      `${skill} filenames should number from 01 with no gaps and no duplicates`
    );
  }
});

test('each corpus file has a scenario, a separator, and an instruction', () => {
  for (const skill of SKILLS) {
    const dir = path.join(CORPUS, skill);
    for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.md'))) {
      const text = fs.readFileSync(path.join(dir, file), 'utf8');
      const parts = text.split(/^---$/m);
      assert.strictEqual(parts.length, 2, `${skill}/${file} needs exactly one --- separator`);
      assert.ok(parts[0].trim().length > 50, `${skill}/${file} scenario is too short`);
      assert.ok(parts[1].trim().length > 5, `${skill}/${file} instruction is missing`);
    }
  }
});

test('corpus files are self-contained', () => {
  for (const skill of SKILLS) {
    const dir = path.join(CORPUS, skill);
    for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.md'))) {
      const text = fs.readFileSync(path.join(dir, file), 'utf8');
      assert.ok(!/\bread the file\b|\bopen the repo\b|\bsearch the codebase\b/i.test(text),
        `${skill}/${file} asks for tool use, which is not reproducible`);
    }
  }
});
