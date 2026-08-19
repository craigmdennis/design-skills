#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const SKILLS = ['conversation-prose', 'documentation-prose'];
const HERE = __dirname;

// One run directory for every step, so the corpus run, the score, and the
// judgement all describe the same twelve pairs. Each step passes its directory
// to the next.
function stamp() {
  return new Date().toISOString().slice(0, 19).replace(/:/g, '-');
}

// Cost per call comes from what earlier runs recorded, so the estimate tracks
// the model in use with no price table to keep current. A corpus call and a
// judging call cost different amounts, so each phase is averaged on its own.
function readHistory() {
  const runsDir = path.join(HERE, 'runs');
  const phases = { corpus: { calls: 0, costUSD: 0, runs: 0 }, judge: { calls: 0, costUSD: 0, runs: 0 } };
  if (!fs.existsSync(runsDir)) return phases;

  for (const name of fs.readdirSync(runsDir)) {
    const dir = path.join(runsDir, name);
    if (!fs.statSync(dir).isDirectory()) continue;

    // A run directory holds one meta.json and any number of judged records,
    // one per model and mode. Every one of them carries a call count and a
    // cost, which is all the per-call figure needs.
    const files = fs.readdirSync(dir)
      .filter(f => f === 'meta.json' || (f.startsWith('judge.') && f.endsWith('.json')))
      .map(f => [f === 'meta.json' ? 'corpus' : 'judge', path.join(dir, f)]);

    for (const [phase, full] of files) {
      let record;
      try {
        record = JSON.parse(fs.readFileSync(full, 'utf8'));
      } catch (error) {
        continue;
      }
      if (!record.calls || typeof record.costUSD !== 'number') continue;
      phases[phase].calls += record.calls;
      phases[phase].costUSD += record.costUSD;
      phases[phase].runs += 1;
    }
  }
  return phases;
}

function estimate(phase, calls) {
  if (phase.calls === 0) return null;
  return (phase.costUSD / phase.calls) * calls;
}

// The corpus grows, so the call count reads it instead of assuming a size.
function corpusCount(skill) {
  return fs.readdirSync(path.join(HERE, 'corpus', skill)).filter(f => f.endsWith('.md')).length;
}

function step(label, args) {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`${label} exited ${result.status}. The steps after it did not run.`);
  }
}

const USAGE = [
  'usage: node tests/all.js [conversation-prose] [documentation-prose]',
  '                        [--rounds N] [--no-judge] [--plan] [--batch]',
  '                        [--model <id>] [--judge-model <id>] [--fresh-before]',
  '                        [--concurrency N] [--control]',
  '',
  '  Runs the corpus, scores it, and judges it, all against one run directory.',
  '',
  '  --rounds N           judging rounds per skill, default 3',
  '  --no-judge           stop after the score',
  '  --plan               print the call count and the cost estimate, then stop',
  '  --batch              judge every pair of a skill in one call, which sends',
  '                       the checklist once instead of once per pair. Cheaper,',
  '                       and a model marking six pairs at once is less careful',
  '                       per pair than one marking a single pair.',
  '  --model <id>         pin the model for the corpus. Both sides of every',
  '                       comparison use it, and meta.json records it.',
  '  --judge-model <id>   pin a separate model for judging, which marks two',
  '                       texts against a checklist. A cheaper model suits that',
  '                       job than the one writing the prose under measurement.',
  '  --concurrency N      judging calls in flight at once, default 3. Output',
  '                       tokens set the duration of a judging call, so',
  '                       overlapping calls is what shortens the wall clock.',
  '  --control            judge each before text against a copy of itself. Both',
  '                       texts pass and fail the same checks, so a gap between',
  '                       the two scores is the judge favouring a position. It',
  '                       is the noise floor under every other figure, and it',
  '                       costs one judging pass to measure.',
  '  --fresh-before       generate the before texts instead of reading the',
  '                       committed baseline. The baseline carries no skill, so',
  '                       it changes only when the corpus or the model changes,',
  '                       and reading it halves the corpus calls.',
  '',
  '  Generate the baseline once with:',
  '    node tests/run.js conversation-prose --make-baseline',
  '    node tests/run.js documentation-prose --make-baseline',
  '',
  '  Naming one or both skills limits the run to those. The default is both.'
].join('\n');

function main(argv) {
  const args = argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(USAGE);
    return;
  }

  const roundsIndex = args.indexOf('--rounds');
  const rounds = roundsIndex >= 0 ? Number(args[roundsIndex + 1]) : 3;
  const skipJudge = args.includes('--no-judge');
  const batch = args.includes('--batch');
  const control = args.includes('--control');

  const modelIndex = args.indexOf('--model');
  const model = modelIndex >= 0 ? args[modelIndex + 1] : '';

  const judgeModelIndex = args.indexOf('--judge-model');
  const judgeModel = judgeModelIndex >= 0 ? args[judgeModelIndex + 1] : '';

  const concurrencyIndex = args.indexOf('--concurrency');
  const concurrency = concurrencyIndex >= 0 ? args[concurrencyIndex + 1] : '3';

  const freshBefore = args.includes('--fresh-before');
  const only = SKILLS.filter(s => args.includes(s));
  const skills = only.length > 0 ? only : SKILLS;

  if (!Number.isInteger(rounds) || rounds < 1) {
    throw new Error(`--rounds takes a whole number of 1 or more, and got ${rounds}`);
  }

  const runDir = path.join(HERE, 'runs', stamp());
  const corpusCalls = skills.reduce(
    (n, skill) => n + (freshBefore ? corpusCount(skill) * 2 + 1 : corpusCount(skill) + 1),
    0
  );
  const judgeCalls = skipJudge
    ? 0
    : skills.reduce((n, skill) => n + rounds * (batch ? 1 : corpusCount(skill)), 0);

  console.log(`run directory: ${runDir}`);
  console.log(`skills: ${skills.join(', ')}`);
  if (model) console.log(`model: ${model}`);
  if (judgeModel) console.log(`judging model: ${judgeModel}`);
  console.log(freshBefore
    ? 'before texts: generated as part of this run'
    : 'before texts: from the committed baseline in tests/baseline');
  if (batch) console.log('judging: one call per skill per round');
  if (control) {
    console.log('judging: control, each before text against a copy of itself');
  }
  console.log(`model calls: ${corpusCalls} for the corpus` +
    (skipJudge ? '' : `, ${judgeCalls} for ${rounds} judging rounds`) +
    `, ${corpusCalls + judgeCalls} in total`);

  const history = readHistory();
  const corpusCost = estimate(history.corpus, corpusCalls);
  const judgeCost = skipJudge ? 0 : estimate(history.judge, judgeCalls);

  if (corpusCost === null && judgeCost === null) {
    console.log('cost: no earlier run recorded one, so this run has nothing to estimate from.');
  } else {
    const parts = [];
    if (corpusCost !== null) {
      parts.push(`$${corpusCost.toFixed(2)} for the corpus (from ${history.corpus.runs} earlier run(s))`);
    } else {
      parts.push('the corpus is unmeasured');
    }
    if (!skipJudge) {
      if (judgeCost !== null) {
        parts.push(`$${judgeCost.toFixed(2)} for judging (from ${history.judge.runs} earlier run(s))`);
      } else {
        parts.push('judging is unmeasured');
      }
    }
    const known = (corpusCost || 0) + (judgeCost || 0);
    const complete = corpusCost !== null && (skipJudge || judgeCost !== null);
    console.log(`cost: about $${known.toFixed(2)}${complete ? '' : ' for the measured part'}`);
    console.log(`  ${parts.join(', ')}`);
  }

  if (args.includes('--plan')) {
    console.log('\n--plan: nothing ran and no directory was created.');
    return;
  }

  for (const skill of skills) {
    const runArgs = [path.join(HERE, 'run.js'), skill, '--out', runDir];
    if (model) runArgs.push('--model', model);
    if (freshBefore) runArgs.push('--fresh-before');
    step(`run ${skill}`, runArgs);
  }

  step('score', [path.join(HERE, 'score.js'), runDir]);

  if (!skipJudge) {
    const judgeArgs = [path.join(HERE, 'judge.js'), runDir, '--rounds', String(rounds)];
    judgeArgs.push('--concurrency', String(concurrency));
    if (batch) judgeArgs.push('--batch');
    if (control) judgeArgs.push('--control');
    if (judgeModel) judgeArgs.push('--model', judgeModel);
    else if (model) judgeArgs.push('--model', model);
    step('judge', judgeArgs);
  }

  // The report is written last, so it describes whatever this run produced. A
  // run stopped before judging still gets one, carrying the detector counts.
  step('report', [path.join(HERE, 'report.js'), runDir, '--method', 'rewrite']);

  console.log(`\nrun directory: ${runDir}`);
}

if (require.main === module) {
  try {
    main(process.argv);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = { stamp };
