#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const {
  makeCleanConfigDir, removeConfigDir, cleanEnv, assertAuthAvailable, CLAUDE_BIN
} = require('./lib/isolation');
const { loadEnvFile } = require('./lib/env');

const SKILLS = ['conversation-prose', 'documentation-prose'];
const SKILL_HOME = path.join(os.homedir(), '.claude', 'skills');
const TEMPLATE = path.join(__dirname, 'judge.md');
// Judging marks two texts against a checklist, which is a different job from
// writing the prose under measurement. PROSE_JUDGE_MODEL pins it separately, so
// the corpus can stay on a capable model while the marking runs on a cheap one.
// Both sides of every comparison still use one model, because one judging call
// reads both texts.
function pinnedModel() {
  return process.env.PROSE_JUDGE_MODEL
    || process.env.PROSE_TEST_MODEL
    || process.env.ANTHROPIC_MODEL
    || '';
}

// Which slot the after-text takes. A judge told which text the skill produced
// marks the other one against an expectation, so neither text is labelled and
// the after-text takes each slot about half the time. The assignment comes from
// the pair index and the round, so it is the same on every run of one directory
// and no call needs a random number.
function afterSlot(index, round) {
  return (index + round) % 2 === 1 ? 'b' : 'a';
}

// The two texts in the order the prompt will carry them.
function blindPair(before, after, slot) {
  return slot === 'b' ? { a: before, b: after } : { a: after, b: before };
}

// Slot scores back to before and after.
function unblindTotals(totals, slot) {
  if (!totals) return null;
  return slot === 'b'
    ? { before: totals.a, after: totals.b, denominator: totals.denominator }
    : { before: totals.b, after: totals.a, denominator: totals.denominator };
}

// The judge never receives the deterministic scores. A judge shown the script's
// answer agrees with the script, and the second number stops being independent
// of the first.
function buildPrompt(checks, textA, textB) {
  const template = fs.readFileSync(TEMPLATE, 'utf8');
  const head = template.slice(0, template.indexOf('===== CHECKS ====='));
  return [
    head.trim(),
    '',
    '===== CHECKS =====',
    '',
    checks,
    '',
    '===== BEGIN TEXT A =====',
    '',
    textA,
    '',
    '===== BEGIN TEXT B =====',
    '',
    textB
  ].join('\n');
}

// conversation-prose ships a one-page checks file for its per-turn hook.
// documentation-prose has no such file, so its own text is the checklist.
function readChecks(skill) {
  const compact = path.join(SKILL_HOME, skill, 'checks.md');
  if (fs.existsSync(compact)) return fs.readFileSync(compact, 'utf8');

  const full = path.join(SKILL_HOME, skill, 'SKILL.md');
  if (fs.existsSync(full)) return fs.readFileSync(full, 'utf8');

  throw new Error(
    `no checks for ${skill}. Expected ${compact} or ${full}. Install the skill ` +
    `first by pasting prompts/${skill}.md into a session.`
  );
}

// One call judges every pair of a skill, so the checklist is sent once instead
// of once per pair. The reply carries one totals line per pair, each naming its
// pair, so a reply that judges five pairs out of six is visible rather than
// silently short.
// Each pair carries its own A and B, assigned separately, so one batch holds
// after-texts in both slots and the judge has no run of one label to settle
// into.
function buildBatchPrompt(checks, pairs) {
  const template = fs.readFileSync(TEMPLATE, 'utf8');
  const head = template.slice(0, template.indexOf('===== CHECKS ====='));
  const parts = [
    head.trim(),
    '',
    `There are ${pairs.length} pairs below, each marked BEGIN PAIR with its ` +
      'number. Judge every pair on its own against the same checks. Output one ' +
      'table for each pair, and under each table its totals line in exactly ' +
      'this shape, naming the pair:',
    '',
    'TOTALS pair 01 A 4/16 B 13/16',
    '',
    '===== CHECKS =====',
    '',
    checks
  ];
  for (const pair of pairs) {
    parts.push(
      '',
      `===== BEGIN PAIR ${pair.id} =====`,
      '',
      '----- TEXT A -----',
      '',
      pair.a,
      '',
      '----- TEXT B -----',
      '',
      pair.b
    );
  }
  return parts.join('\n');
}

// Returns a map of pair id to { a, b, denominator }.
function parseBatchTotals(reply) {
  const found = {};
  const pattern = /TOTALS\s+pair\s+(\S+)\s+A\s+(\d+)\s*\/\s*(\d+)\s+B\s+(\d+)\s*\/\s*(\d+)/gi;
  for (const match of reply.matchAll(pattern)) {
    found[match[1]] = {
      a: Number(match[2]),
      b: Number(match[4]),
      denominator: Number(match[5])
    };
  }
  return found;
}

// Returns { a, b, denominator } or null when the reply carries no totals line
// in the shape the template asks for.
function parseTotals(reply) {
  const match = reply.match(/TOTALS\s+A\s+(\d+)\s*\/\s*(\d+)\s+B\s+(\d+)\s*\/\s*(\d+)/i);
  if (!match) return null;
  return {
    a: Number(match[1]),
    b: Number(match[3]),
    denominator: Number(match[4])
  };
}

// No tools and an empty working directory, for the same reason the runner uses
// them: a call made inside this repository can read the skills and the corpus.
const NO_TOOLS = ['Bash', 'Read', 'Glob', 'Grep', 'Edit', 'Write', 'WebFetch', 'WebSearch',
  'NotebookEdit', 'Task', 'TodoWrite'];

// Output tokens set the duration of a judging call, and batching does not
// reduce them: six tables in one reply take about as long as six replies. Calls
// overlap instead, which is the only lever that shortens the wall clock.
function callJudge(prompt, env, cwd) {
  const args = [
    '--bare', '-p', prompt, '--output-format', 'json',
    '--disallowedTools', ...NO_TOOLS,
    '--disable-slash-commands'
  ];
  const model = pinnedModel();
  if (model) args.push('--model', model);

  return new Promise((resolve, reject) => {
    const child = spawn(CLAUDE_BIN, args, { env, cwd });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', d => { stdout += d; });
    child.stderr.on('data', d => { stderr += d; });
    child.on('error', reject);
    child.on('close', code => {
      if (code !== 0) {
        reject(new Error(`the judge call failed: ${stderr || code}`));
        return;
      }
      let payload;
      try {
        payload = JSON.parse(stdout);
      } catch (error) {
        reject(new Error(`the judge call returned output that is not JSON: ${stdout.slice(0, 200)}`));
        return;
      }
      if (payload.is_error) {
        reject(new Error(`the judge call reported an error: ${payload.result}`));
        return;
      }
      resolve({
        text: String(payload.result || '').trim(),
        costUSD: payload.total_cost_usd || 0
      });
    });
  });
}

// A fixed number of calls in flight. Every task is independent, so the order
// they finish in changes nothing about the totals.
async function runWithConcurrency(tasks, limit) {
  const results = new Array(tasks.length);
  let next = 0;

  async function worker() {
    while (next < tasks.length) {
      const index = next;
      next += 1;
      results[index] = await tasks[index]();
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}

// A judged figure is comparable to another only when the same model marked both
// in the same mode. A run judged twice by two models produces two numbers that
// look alike and measure different things, so each result is written under its
// own name and a mismatch is named on sight.
function judgeRecordName(batch, model, control) {
  const mode = batch ? 'batch' : 'per-pair';
  const named = (model || 'default').replace(/[^A-Za-z0-9._-]/g, '-');
  return `judge.${control ? 'control.' : ''}${mode}.${named}.json`;
}

function assertJudgeComparable(runDir, batch, control) {
  const model = pinnedModel();
  const mine = judgeRecordName(batch, model, control);
  const others = fs.readdirSync(runDir)
    .filter(f => f.startsWith('judge.') && f.endsWith('.json') && f !== mine);
  if (others.length === 0) return;

  console.log(`this run directory already holds ${others.join(', ')}.`);
  console.log(
    `Writing ${mine} beside them. A figure from one model and mode is not ` +
    'comparable with a figure from another, so compare only records that share ' +
    'both.'
  );
}

function readPairs(runDir, skill) {
  const dir = path.join(runDir, skill);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.before.md'))
    .sort()
    .map(file => {
      const id = file.replace('.before.md', '');
      return {
        id,
        before: fs.readFileSync(path.join(dir, file), 'utf8'),
        after: fs.readFileSync(path.join(dir, `${id}.after.md`), 'utf8')
      };
    });
}

// The control judges each before-text against a copy of itself. Both texts pass
// and fail the same checks, so a gap between the two scores is the instrument's
// own noise, and any gap that leans one way is the judge favouring a position.
// Every figure the real run reports sits on top of whatever this measures.
function asControl(pairs) {
  return pairs.map(pair => ({ id: pair.id, before: pair.before, after: pair.before }));
}

async function judgeRun(runDir, rounds, batch, concurrency, control) {
  assertAuthAvailable();
  const configDir = makeCleanConfigDir();
  let removed = false;
  const cleanUp = () => {
    if (removed) return;
    removed = true;
    removeConfigDir(configDir);
  };
  process.on('exit', cleanUp);
  process.on('SIGINT', () => { cleanUp(); process.exit(130); });

  const env = cleanEnv(configDir);
  const plan = [];

  try {
    for (const skill of SKILLS) {
      const read = readPairs(runDir, skill);
      if (read.length === 0) continue;
      const pairs = control ? asControl(read) : read;
      const checks = readChecks(skill);

      for (let round = 1; round <= rounds; round += 1) {
        // The slot each after-text takes, decided once per pair per round and
        // carried through the call so the reply can be read back.
        const slots = pairs.map((_, index) => afterSlot(index, round));
        const blinded = pairs.map((pair, index) => ({
          id: pair.id,
          ...blindPair(pair.before, pair.after, slots[index])
        }));

        if (batch) {
          plan.push({ skill, round, pairs, kind: 'batch', checks, blinded, slots });
        } else {
          for (const [index, pair] of pairs.entries()) {
            plan.push({
              skill, round, pairs, kind: 'pair', checks, pair,
              blinded: blinded[index], slot: slots[index]
            });
          }
        }
      }
    }

    console.log(`${plan.length} calls, ${Math.min(concurrency, plan.length)} at a time`);

    let done = 0;
    const tasks = plan.map(item => async () => {
      const prompt = item.kind === 'batch'
        ? buildBatchPrompt(item.checks, item.blinded)
        : buildPrompt(item.checks, item.blinded.a, item.blinded.b);
      const reply = await callJudge(prompt, env, configDir);
      done += 1;
      const label = item.kind === 'batch'
        ? `${item.skill} round ${item.round} all ${item.pairs.length} pairs`
        : `${item.skill} round ${item.round} pair ${item.pair.id}`;
      console.log(`  [${done}/${plan.length}] ${label}`);
      return { item, reply };
    });

    const finished = await runWithConcurrency(tasks, concurrency);

    const bySkill = new Map();
    const marks = [];
    let costUSD = 0;

    for (const { item, reply } of finished) {
      costUSD += reply.costUSD;
      if (!bySkill.has(item.skill)) bySkill.set(item.skill, { pairs: item.pairs.length, rows: new Map() });
      const skillRecord = bySkill.get(item.skill);
      if (!skillRecord.rows.has(item.round)) {
        skillRecord.rows.set(item.round, {
          round: item.round, before: 0, after: 0, a: 0, b: 0, denominator: 0, unparsed: 0
        });
      }
      const row = skillRecord.rows.get(item.round);

      // Both the slot scores and the unblinded scores are kept. Randomising the
      // slots cancels position bias out of the before and after figures, which
      // is the point of the randomisation and also means those figures cannot
      // measure it. Every marking is also kept with the slot it came from, so
      // the same run answers what the after text scored from each position.
      const add = (raw, slot, id) => {
        if (!raw) { row.unparsed += 1; return; }
        const named = unblindTotals(raw, slot);
        row.a += raw.a;
        row.b += raw.b;
        row.before += named.before;
        row.after += named.after;
        row.denominator += raw.denominator;
        marks.push({
          skill: item.skill, round: item.round, pair: id, afterSlot: slot,
          a: raw.a, b: raw.b, before: named.before, after: named.after,
          denominator: raw.denominator
        });
      };

      if (item.kind === 'batch') {
        const totals = parseBatchTotals(reply.text);
        for (const [index, pair] of item.pairs.entries()) {
          add(totals[pair.id], item.slots[index], pair.id);
        }
      } else {
        add(parseTotals(reply.text), item.slot, item.pair.id);
      }
    }

    const results = [...bySkill.entries()].map(([skill, record]) => ({
      skill,
      pairs: record.pairs,
      rows: [...record.rows.values()].sort((a, b) => a.round - b.round)
    }));

    return { results, marks, costUSD };
  } finally {
    cleanUp();
  }
}

const range = list => (Math.min(...list) === Math.max(...list)
  ? `${Math.min(...list)}`
  : `${Math.min(...list)} to ${Math.max(...list)}`);

// What each text scored from each position, as a percentage of the checks it
// was marked against. Judging two identical texts asks the judge a question it
// can answer by copying one column into the other, so that control cannot show
// position bias on texts that differ. These markings can: the same after text
// is marked from slot A in one round and from slot B in another, and a gap
// between those two figures is position alone.
function positionSplit(marks) {
  const side = slot => {
    const rows = marks.filter(m => m.afterSlot === slot);
    const total = key => rows.reduce((n, m) => n + m[key], 0);
    const outOf = rows.reduce((n, m) => n + m.denominator, 0);
    return {
      calls: rows.length,
      after: outOf ? (total('after') / outOf) * 100 : null,
      before: outOf ? (total('before') / outOf) * 100 : null
    };
  };
  return { inA: side('a'), inB: side('b') };
}

function printPositionSplit(marks) {
  const split = positionSplit(marks);
  if (!split.inA.calls || !split.inB.calls) return;

  const show = (label, value) => `${label} ${value.toFixed(1)}%`;
  console.log('\nposition check, from the same markings:');
  console.log(
    `  after text: ${show('in slot A', split.inA.after)}` +
    `   ${show('in slot B', split.inB.after)}` +
    `   gap ${(split.inB.after - split.inA.after).toFixed(1)} points`
  );
  console.log(
    `  before text: ${show('in slot B', split.inA.before)}` +
    `   ${show('in slot A', split.inB.before)}` +
    `   gap ${(split.inB.before - split.inA.before).toFixed(1)} points`
  );
  console.log(
    '  A gap near zero means the slot a text took did not change its score. ' +
    'A large gap means the two figures above rest on a judge that reads ' +
    'position, and the randomised slots cancel it out of the totals rather ' +
    'than removing it.'
  );
}

function print(runDir, judged, control) {
  // The control gave the judge the same text twice, so the two columns name the
  // slot each copy took and a gap between them is error, not a difference in
  // the writing.
  const left = control ? 'slot A' : 'before';
  const right = control ? 'slot B' : 'after';
  const pick = row => (control ? [row.a, row.b] : [row.before, row.after]);

  for (const result of judged.results) {
    console.log(`\n${runDir}   ${result.skill}   ${result.pairs} pairs`);

    for (const row of result.rows) {
      const [x, y] = pick(row);
      const note = row.unparsed ? `   (${row.unparsed} replies carried no totals line)` : '';
      console.log(
        `  round ${row.round}: ${left} ${x}/${row.denominator}` +
        `   ${right} ${y}/${row.denominator}${note}`
      );
    }

    const lefts = result.rows.map(r => pick(r)[0]);
    const rights = result.rows.map(r => pick(r)[1]);
    const denominator = result.rows[0] ? result.rows[0].denominator : 0;

    console.log(
      `  checks passed: ${left} ${range(lefts)}/${denominator}` +
      `   ${right} ${range(rights)}/${denominator}`
    );

    if (control) {
      const gaps = result.rows.map(r => r.b - r.a);
      console.log(
        `  gap (B minus A): ${range(gaps)} of ${denominator}. Zero is a judge ` +
        'with no position bias; anything else is the noise floor under every ' +
        'other figure this harness reports.'
      );
    }
  }
  if (!control) printPositionSplit(judged.marks);
  console.log(`\ncost: $${judged.costUSD.toFixed(4)}`);
}

async function main(argv) {
  loadEnvFile();
  const args = argv.slice(2);
  const runDir = args.find(a => !a.startsWith('--'));
  const roundsIndex = args.indexOf('--rounds');
  const rounds = roundsIndex >= 0 ? Number(args[roundsIndex + 1]) : 3;
  const batch = args.includes('--batch');
  const control = args.includes('--control');

  const concurrencyIndex = args.indexOf('--concurrency');
  const concurrency = concurrencyIndex >= 0 ? Number(args[concurrencyIndex + 1]) : 3;

  const modelIndex = args.indexOf('--model');
  if (modelIndex >= 0) process.env.PROSE_JUDGE_MODEL = args[modelIndex + 1];

  if (!runDir) {
    console.error(
      'usage: node tests/judge.js <run-dir> [--rounds N] [--batch] [--model <id>]\n' +
      '                          [--concurrency N] [--control]'
    );
    process.exit(1);
  }
  if (!fs.existsSync(runDir)) {
    throw new Error(`no run directory at ${runDir}`);
  }
  if (!Number.isInteger(rounds) || rounds < 1) {
    throw new Error(`--rounds takes a whole number of 1 or more, and got ${rounds}`);
  }
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new Error(`--concurrency takes a whole number of 1 or more, and got ${concurrency}`);
  }

  assertJudgeComparable(runDir, batch, control);
  if (control) {
    console.log('control: each before text is judged against a copy of itself.');
  }

  const judged = await judgeRun(runDir, rounds, batch, concurrency, control);
  if (judged.results.length === 0) {
    console.error(`no scorable pairs in ${runDir}`);
    process.exit(1);
  }
  print(runDir, judged, control);

  // calls and cost together give a per-call figure, which `all.js --plan`
  // multiplies to predict what a judging pass will cost.
  const calls = batch
    ? judged.results.length * rounds
    : judged.results.reduce((n, r) => n + r.pairs * rounds, 0);
  fs.writeFileSync(
    path.join(runDir, judgeRecordName(batch, pinnedModel(), control)),
    `${JSON.stringify({
      rounds, batch, control, blinded: true, calls, model: pinnedModel() || null,
      costUSD: Number(judged.costUSD.toFixed(4)),
      results: judged.results,
      positionSplit: control ? null : positionSplit(judged.marks),
      marks: judged.marks
    }, null, 2)}\n`
  );
}

if (require.main === module) {
  main(process.argv).catch(error => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = {
  buildPrompt, buildBatchPrompt, parseTotals, parseBatchTotals, readChecks, pinnedModel,
  judgeRecordName, runWithConcurrency, afterSlot, blindPair, unblindTotals, asControl,
  positionSplit
};
