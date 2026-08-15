#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { scoreRun } = require('./score');

// A run directory holds raw numbers in three files and no explanation of them.
// This writes the explanation: what the detectors counted, what the judge
// marked, what the calibrations returned, and what the figures do not cover.
// all.js calls it at the end of every run, so the committed report always
// describes the most recent one.
const DEFAULT_OUT = path.join(__dirname, '..', 'docs', 'prose-test-report.md');

function readJson(file) {
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    return null;
  }
}

// One judged record per model and mode. The per-pair record is the one behind a
// published figure, so it is preferred; a batch record is reported with its mode
// named, because the two are not comparable.
function readJudged(runDir) {
  const names = fs.readdirSync(runDir)
    .filter(f => f.startsWith('judge.') && f.endsWith('.json'));
  const pick = list => {
    const found = list.find(n => n.includes('.per-pair.')) || list[0];
    return found ? Object.assign(readJson(path.join(runDir, found)) || {}, { file: found }) : null;
  };
  return {
    main: pick(names.filter(n => !n.startsWith('judge.control.'))),
    control: pick(names.filter(n => n.startsWith('judge.control.')))
  };
}

function pct(part, whole) {
  return whole ? `${((part / whole) * 100).toFixed(1)}%` : 'n/a';
}

function range(list) {
  const low = Math.min(...list);
  const high = Math.max(...list);
  return low === high ? `${low}` : `${low} to ${high}`;
}

function detectorTable(result) {
  const lines = [
    '| detector | before | after |',
    '|---|---:|---:|'
  ];
  for (const d of result.detectors.filter(d => d.tier === 'exact')) {
    lines.push(`| ${d.label} | ${d.before} | ${d.after} |`);
  }
  lines.push(`| **exact total** | **${result.exactBefore}** | **${result.exactAfter}** |`);
  lines.push(`| words | ${result.wordsBefore} | ${result.wordsAfter} |`);
  lines.push(
    `| **per 1,000 words** | **${result.perThousandBefore.toFixed(1)}** ` +
    `| **${result.perThousandAfter.toFixed(1)}** |`
  );
  return lines.join('\n');
}

function approximateTable(result) {
  const rows = result.detectors.filter(d => d.tier === 'approximate');
  if (rows.length === 0) return '';
  const lines = [
    '| detector | before | after |',
    '|---|---:|---:|'
  ];
  for (const d of rows) lines.push(`| ${d.label} | ${d.before} | ${d.after} |`);
  return lines.join('\n');
}

// Every marking of one pair, averaged across rounds. A pair that improves by one
// check and a pair that improves by twelve are both inside a headline range, and
// this is where the difference is visible.
function pairTable(marks, skill) {
  const rows = marks.filter(m => m.skill === skill);
  if (rows.length === 0) return '';

  const byPair = new Map();
  for (const mark of rows) {
    if (!byPair.has(mark.pair)) byPair.set(mark.pair, []);
    byPair.get(mark.pair).push(mark);
  }

  const lines = [
    '| pair | before | after | gain | rounds |',
    '|---|---:|---:|---:|---:|'
  ];
  for (const [id, list] of [...byPair.entries()].sort()) {
    const mean = key => list.reduce((n, m) => n + m[key], 0) / list.length;
    const denominator = list[0].denominator;
    const before = mean('before');
    const after = mean('after');
    lines.push(
      `| ${id} | ${before.toFixed(1)}/${denominator} | ${after.toFixed(1)}/${denominator} ` +
      `| +${(after - before).toFixed(1)} | ${list.length} |`
    );
  }
  return lines.join('\n');
}

// Which checks the before text failed, counted across every marking. The totals
// line says how many failed and never which, so this is the part that tells a
// reader what the skill actually removes.
function checkTable(marks, skill) {
  const rows = marks.filter(m => m.skill === skill && Array.isArray(m.checks));
  if (rows.length === 0) return '';

  const tally = new Map();
  for (const mark of rows) {
    for (const check of mark.checks) {
      if (!tally.has(check.check)) {
        tally.set(check.check, { failedBefore: 0, failedAfter: 0, seen: 0, quote: null });
      }
      const entry = tally.get(check.check);
      entry.seen += 1;
      if (check.before === 'FAIL') entry.failedBefore += 1;
      if (check.after === 'FAIL') entry.failedAfter += 1;
      if (!entry.quote && check.quote) entry.quote = check.quote;
    }
  }

  const ordered = [...tally.entries()]
    .sort((a, b) => b[1].failedBefore - a[1].failedBefore)
    .filter(([, entry]) => entry.failedBefore > 0 || entry.failedAfter > 0);
  if (ordered.length === 0) return '';

  const lines = [
    '| check | failed before | failed after | example of a failure |',
    '|---|---:|---:|---|'
  ];
  for (const [name, entry] of ordered) {
    const quote = entry.quote ? `"${entry.quote.replace(/\|/g, '\\|')}"` : '';
    lines.push(`| ${name} | ${entry.failedBefore}/${entry.seen} | ${entry.failedAfter}/${entry.seen} | ${quote} |`);
  }
  return lines.join('\n');
}

function build(runDir) {
  const scores = scoreRun(runDir);
  const meta = readJson(path.join(runDir, 'meta.json')) || {};
  const { main, control } = readJudged(runDir);
  const marks = (main && main.marks) || [];

  const out = [];
  out.push('# Prose skill test report');
  out.push('');
  out.push(
    'Generated by `node tests/report.js <run-dir>`, which `tests/all.js` calls at ' +
    'the end of every run. It describes one run directory and is overwritten by ' +
    'the next one.'
  );
  out.push('');

  out.push('## The run');
  out.push('');
  out.push('| | |');
  out.push('|---|---|');
  out.push(`| run | \`${runDir}\` |`);
  out.push(`| date | ${meta.date || 'unrecorded'} |`);
  out.push(`| model, pinned | ${meta.modelPinned || 'unpinned'} |`);
  out.push(`| models the CLI reported | ${(meta.models || []).join(', ') || 'unrecorded'} |`);
  out.push(`| CLI | ${meta.cli || 'unrecorded'} |`);
  out.push(`| corpus commit | ${meta.corpusCommit || 'unrecorded'} |`);
  out.push(`| before texts | ${meta.baseline ? `from \`${meta.baseline}\`` : 'generated in this run'} |`);
  if (main) {
    out.push(`| judging | ${main.batch ? 'batch' : 'per-pair'}, ${main.rounds} rounds, ${main.calls} calls |`);
    out.push(`| judge blinded | ${main.blinded ? 'yes' : 'no'} |`);
    out.push(`| judging model | ${main.model || 'unpinned'} |`);
  }
  const corpusCost = typeof meta.costUSD === 'number' ? meta.costUSD : 0;
  const judgeCost = (main && main.costUSD) || 0;
  const controlCost = (control && control.costUSD) || 0;
  out.push(`| cost | $${(corpusCost + judgeCost + controlCost).toFixed(2)} ` +
    `($${corpusCost.toFixed(2)} corpus, $${judgeCost.toFixed(2)} judging` +
    `${controlCost ? `, $${controlCost.toFixed(2)} control` : ''}) |`);
  out.push('');
  if (!meta.skills && scores.length > 1) {
    out.push(
      'The corpus figure covers one skill. Each skill is a separate invocation of ' +
      '`run.js`, and this run was made before `meta.json` accumulated them, so the ' +
      'earlier skill\'s calls are not in the total above.'
    );
    out.push('');
  }

  out.push('## Headline');
  out.push('');
  out.push('| skill | pairs | violations per 1,000 words, before | after | change | checks passed, before | after |');
  out.push('|---|---:|---:|---:|---:|---:|---:|');
  for (const result of scores) {
    const judged = main && (main.results || []).find(r => r.skill === result.skill);
    let before = 'not judged';
    let after = '';
    if (judged) {
      const d = judged.rows[0].denominator;
      // The percentage covers the same span as the count beside it. Taking the
      // first round's figure would print a point value against a range.
      const span = key => {
        const list = judged.rows.map(r => r[key]);
        const low = pct(Math.min(...list), d);
        const high = pct(Math.max(...list), d);
        return `${range(list)}/${d} (${low === high ? low : `${low} to ${high}`})`;
      };
      before = span('before');
      after = span('after');
    }
    out.push(
      `| ${result.skill} | ${result.pairs} | ${result.perThousandBefore.toFixed(1)} ` +
      `| ${result.perThousandAfter.toFixed(1)} | ${result.delta.toFixed(0)}% | ${before} | ${after} |`
    );
  }
  out.push('');
  out.push(
    'The first three columns are counted by script and reproduce exactly from the ' +
    'committed texts. The last two are marked by a model and vary between rounds, ' +
    'so they are reported as a range.'
  );
  out.push('');

  for (const result of scores) {
    out.push(`## ${result.skill}`);
    out.push('');
    out.push(`${result.pairs} pairs. Counted by script, exact detectors only:`);
    out.push('');
    out.push(detectorTable(result));
    out.push('');

    const approximate = approximateTable(result);
    if (approximate) {
      out.push('Approximate detectors, excluded from the total because they ' +
        'over-count and under-count equally on both sides:');
      out.push('');
      out.push(approximate);
      out.push('');
    }

    const judged = main && (main.results || []).find(r => r.skill === result.skill);
    if (judged) {
      out.push('Marked by the judge, round by round:');
      out.push('');
      out.push('| round | before | after | gain |');
      out.push('|---|---:|---:|---:|');
      for (const row of judged.rows) {
        out.push(`| ${row.round} | ${row.before}/${row.denominator} | ` +
          `${row.after}/${row.denominator} | +${row.after - row.before} |`);
      }
      out.push('');
    }

    const pairs = pairTable(marks, result.skill);
    if (pairs) {
      out.push('Per prompt, averaged across rounds:');
      out.push('');
      out.push(pairs);
      out.push('');
    }

    const checks = checkTable(marks, result.skill);
    if (checks) {
      out.push('Per check, counted across every marking:');
      out.push('');
      out.push(checks);
      out.push('');
    }
  }

  out.push('## Calibration');
  out.push('');
  if (main && main.positionSplit && main.positionSplit.inA.calls && main.positionSplit.inB.calls) {
    const s = main.positionSplit;
    out.push(
      'The two texts reach the judge as TEXT A and TEXT B, and which slot the ' +
      'after text takes flips between rounds. The same text is therefore marked ' +
      'from both positions, and a gap between those two figures is position ' +
      'alone:'
    );
    out.push('');
    out.push('| text | in slot A | in slot B | gap |');
    out.push('|---|---:|---:|---:|');
    out.push(`| after | ${s.inA.after.toFixed(1)}% | ${s.inB.after.toFixed(1)}% ` +
      `| ${(s.inB.after - s.inA.after).toFixed(1)} points |`);
    out.push(`| before | ${s.inA.before.toFixed(1)}% | ${s.inB.before.toFixed(1)}% ` +
      `| ${(s.inB.before - s.inA.before).toFixed(1)} points |`);
    out.push('');
  }
  if (control) {
    out.push(
      `Control (\`${control.file}\`): each before text judged against a copy of ` +
      'itself. Both texts pass and fail the same checks, so a gap is error.'
    );
    out.push('');
    out.push('| skill | slot A | slot B | gap |');
    out.push('|---|---:|---:|---:|');
    for (const result of control.results || []) {
      const row = result.rows[0];
      out.push(`| ${result.skill} | ${row.a}/${row.denominator} | ${row.b}/${row.denominator} ` +
        `| ${row.b - row.a} |`);
    }
    out.push('');
    out.push(
      'A zero here is weak evidence on its own: a judge given two identical texts ' +
      'can answer by copying one column into the other. The position split above ' +
      'is the measurement that uses texts which differ.'
    );
    out.push('');
  }

  out.push('## What these figures do not show');
  out.push('');
  out.push([
    '1. The detectors are taken from the skills\' own rules, so this measures ' +
      'whether a skill removes the failures it names. It does not measure whether ' +
      'the writing is better, and no automatic test can.',
    '2. The judge is not calibrated against a person. Blinding, the control, and ' +
      'the position split show that it agrees with itself and does not read ' +
      'position. None of them show that it agrees with a reader marking the same ' +
      'checks by hand.',
    '3. One model on one date, both recorded above.',
    '4. Thirteen prompts is enough for a direction and too few for a confidence ' +
      'interval.',
    '5. The test measures a rewrite pass over fixed text. It does not measure ' +
      'prose written with the skill already loaded, which is how these skills are ' +
      'normally used.',
    '6. `published-prose` is not covered. That skill reads a voice profile written ' +
      'at install time, so a shared run would measure either a profile that does ' +
      'not generalise or only part of the skill.'
  ].join('\n'));
  out.push('');

  return `${out.join('\n')}\n`;
}

function main(argv) {
  const args = argv.slice(2);
  const runDir = args.find(a => !a.startsWith('--'));
  const outIndex = args.indexOf('--out');
  const out = outIndex >= 0 ? args[outIndex + 1] : DEFAULT_OUT;

  if (!runDir) {
    console.error('usage: node tests/report.js <run-dir> [--out <file>]');
    process.exit(1);
  }
  if (!fs.existsSync(runDir)) throw new Error(`no run directory at ${runDir}`);

  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, build(runDir));
  console.log(`wrote ${out}`);
}

if (require.main === module) {
  try {
    main(process.argv);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = { build, readJudged, pairTable, checkTable, DEFAULT_OUT };
