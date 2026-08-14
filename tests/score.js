#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { DETECTORS, runDetectors } = require('./lib/detectors');

const SKILLS = ['conversation-prose', 'documentation-prose'];

function readPairs(runDir, skill) {
  const dir = path.join(runDir, skill);
  if (!fs.existsSync(dir)) return [];
  const befores = fs.readdirSync(dir).filter(f => f.endsWith('.before.md')).sort();
  return befores.map(file => {
    const id = file.replace('.before.md', '');
    const afterPath = path.join(dir, `${id}.after.md`);
    if (!fs.existsSync(afterPath)) {
      throw new Error(`${skill}/${id}: the before file has no matching after file`);
    }
    return {
      id,
      before: fs.readFileSync(path.join(dir, file), 'utf8'),
      after: fs.readFileSync(afterPath, 'utf8')
    };
  });
}

function scoreRun(runDir) {
  if (!fs.existsSync(runDir)) throw new Error(`no run directory at ${runDir}`);
  const results = [];

  for (const skill of SKILLS) {
    const pairs = readPairs(runDir, skill);
    if (pairs.length === 0) continue;

    const totals = {};
    let wordsBefore = 0;
    let wordsAfter = 0;

    for (const pair of pairs) {
      const before = runDetectors(pair.before, skill);
      const after = runDetectors(pair.after, skill);
      wordsBefore += before.words;
      wordsAfter += after.words;
      for (const id of Object.keys(before.counts)) {
        if (!totals[id]) totals[id] = { before: 0, after: 0 };
        totals[id].before += before.counts[id];
        totals[id].after += after.counts[id];
      }
    }

    const detectors = DETECTORS
      .filter(d => d.skills.includes(skill))
      .map(d => ({
        id: d.id,
        label: d.label,
        tier: d.tier,
        before: totals[d.id].before,
        after: totals[d.id].after
      }));

    const exact = detectors.filter(d => d.tier === 'exact');
    const exactBefore = exact.reduce((n, d) => n + d.before, 0);
    const exactAfter = exact.reduce((n, d) => n + d.after, 0);
    const perThousandBefore = wordsBefore ? (exactBefore / wordsBefore) * 1000 : 0;
    const perThousandAfter = wordsAfter ? (exactAfter / wordsAfter) * 1000 : 0;
    let delta;
    if (perThousandBefore) {
      delta = ((perThousandAfter - perThousandBefore) / perThousandBefore) * 100;
    } else if (perThousandAfter) {
      delta = null;
    } else {
      delta = 0;
    }

    results.push({
      skill, pairs: pairs.length, detectors,
      exactBefore, exactAfter, wordsBefore, wordsAfter,
      perThousandBefore, perThousandAfter, delta
    });
  }

  return results;
}

function pad(text, width) {
  return String(text).padEnd(width);
}

function padLeft(text, width) {
  return String(text).padStart(width);
}

function print(runDir, results) {
  for (const r of results) {
    console.log(`\n${runDir}   ${r.skill}   ${r.pairs} pairs\n`);
    console.log(`  ${pad('detector', 38)}${padLeft('before', 8)}${padLeft('after', 9)}`);
    for (const d of r.detectors.filter(x => x.tier === 'exact')) {
      console.log(`  ${pad(d.label, 38)}${padLeft(d.before, 8)}${padLeft(d.after, 9)}`);
    }
    console.log(`  ${'-'.repeat(55)}`);
    console.log(`  ${pad('exact total', 38)}${padLeft(r.exactBefore, 8)}${padLeft(r.exactAfter, 9)}`);
    console.log(`  ${pad('words', 38)}${padLeft(r.wordsBefore, 8)}${padLeft(r.wordsAfter, 9)}`);
    console.log(`  ${pad('per 1,000 words', 38)}${padLeft(r.perThousandBefore.toFixed(1), 8)}${padLeft(r.perThousandAfter.toFixed(1), 9)}`);
    const deltaText = r.delta === null ? 'n/a (no violations before)' : `${r.delta.toFixed(0)}%`;
    console.log(`  ${pad('delta', 38)}${padLeft('', 8)}${padLeft(deltaText, 9)}`);
    console.log(`\n  approximate, excluded from the total`);
    for (const d of r.detectors.filter(x => x.tier === 'approximate')) {
      console.log(`  ${pad(d.label, 38)}${padLeft(d.before, 8)}${padLeft(d.after, 9)}`);
    }
  }
  console.log('');
}

function main(argv) {
  const args = argv.slice(2).filter(a => a !== '--json');
  const asJson = argv.includes('--json');
  const runDir = args[0];

  if (!runDir) {
    console.error('usage: node tests/score.js <run-dir> [--json]');
    process.exit(1);
  }

  const results = scoreRun(runDir);
  if (results.length === 0) {
    console.error(`no scorable pairs in ${runDir}`);
    process.exit(1);
  }

  if (asJson) console.log(JSON.stringify({ runDir, results }, null, 2));
  else print(runDir, results);
}

if (require.main === module) main(process.argv);

module.exports = { scoreRun };
