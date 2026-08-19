#!/usr/bin/env node
'use strict';
//
// skill-ab: does editing the skill lower a frozen judge's finding count?
//
// Four arms answer the same six prompts. Two carry the committed skill and
// give the noise floor. Two carry a candidate edit. Every arm is judged
// against the committed `checks.md`, so the rubric holds still while the
// skill under test changes, which the earlier training loop could not do.
//
// The target class is check 16, ambiguous referents: the largest confirmed
// class in that loop, and one no string match can find.
//
// Calls go straight to the Messages API with no tool loop. The detectors run
// here rather than inside a model call.
//
//   node tests/skill-ab.js --canary   price check only, two calls
//   node tests/skill-ab.js            canary, then the four arms

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { runDetectors } = require('./lib/detectors');

const HERE = __dirname;
const REPO = path.join(HERE, '..');
const CORPUS = path.join(HERE, 'corpus', 'skill-ab');
const SKILL_DIR = 'plugins/writing/skills/conversation-prose';

// Published rates, $ per million tokens, from the claude-api skill.
// Cache multipliers are the standard 1.25x write and 0.1x read. These calls
// set no cache_control, so both cache figures should stay at zero.
const PRICES = {
  'claude-opus-5': { input: 5, output: 25 },
  'claude-fable-5': { input: 10, output: 50 },
};

// The cost model the canary tests. A projection above these by more than
// TOLERANCE stops the run before the arms spend anything.
// Measured by the canary on 2026-08-19, claude-opus-5, effort high:
// a writer call sends the whole skill (12,366 in) and returns a short reply
// (1,622 out); a red call reads checks.md alone (1,676 in, 1,020 out).
const EXPECTED = { writer: 0.102, red: 0.034, editor: 0.15 };
const TOLERANCE = 0.10;

function loadEnv() {
  const file = path.join(REPO, '.env.test');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

// The frozen judge reads the committed file, never the working tree, so an
// uncommitted edit cannot move the rubric mid-run.
function committed(file) {
  return execFileSync('git', ['show', `HEAD:${SKILL_DIR}/${file}`], {
    cwd: REPO, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024,
  });
}

function priceOf(model) {
  const p = PRICES[model];
  if (!p) throw new Error(`no published price for ${model}. Add it to PRICES.`);
  return p;
}

function costOf(usage, model) {
  const p = priceOf(model);
  const cacheWrite = (usage.cache_creation_input_tokens || 0) * p.input * 1.25;
  const cacheRead = (usage.cache_read_input_tokens || 0) * p.input * 0.1;
  return ((usage.input_tokens || 0) * p.input
    + (usage.output_tokens || 0) * p.output
    + cacheWrite + cacheRead) / 1e6;
}

const tally = { calls: 0, costUSD: 0, byRole: {} };

async function call(role, prompt, maxTokens, model) {
  const body = {
    model,
    max_tokens: maxTokens,
    output_config: { effort: 'high' },
    messages: [{ role: 'user', content: prompt }],
  };
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${role}: HTTP ${res.status} ${(await res.text()).slice(0, 300)}`);
  const payload = await res.json();
  if (payload.stop_reason === 'refusal') throw new Error(`${role}: refused`);

  const text = (payload.content || [])
    .filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
  const cost = costOf(payload.usage || {}, model);
  tally.calls += 1;
  tally.costUSD += cost;
  const seen = tally.byRole[role] || { calls: 0, costUSD: 0 };
  seen.calls += 1;
  seen.costUSD += cost;
  tally.byRole[role] = seen;
  return { text, cost, usage: payload.usage || {} };
}

function writerPrompt(skillBody, checksBody, scenario) {
  return [
    '===== SKILL =====', skillBody, '', checksBody, '===== END SKILL =====', '',
    'Write the reply you would send to the developer, following every rule in',
    'the skill above. Use only the facts the scenario gives. Do not add',
    'information. Run all sixteen checks on your draft before returning it.',
    'Output only the reply text, with no preamble and no commentary.',
    '', '===== SCENARIO =====', scenario,
  ].join('\n');
}

// One class only. A narrow question keeps the judge's over-claiming down and
// makes two arms comparable.
function redPrompt(frozenChecks, reply) {
  return [
    '===== CHECK 16, THE ONLY RULE THAT APPLIES HERE =====',
    frozenChecks,
    '===== END =====',
    '',
    'Apply check 16 alone to the reply below. Ignore every other check.',
    'For each pronoun and each definite noun phrase, ask what it refers to. A',
    'finding needs two candidate referents in the preceding text of this reply.',
    'A technical name in backticks is clean. A phrase whose referent is fixed by',
    'the facts is clean.',
    '',
    'Output JSON only, no prose, in this shape:',
    '{"findings":[{"quote":"verbatim text from the reply","reason":"the two candidates"}]}',
    'An empty findings array is a valid answer.',
    '',
    '===== THE REPLY =====', reply,
  ].join('\n');
}

function parseFindings(text) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return { findings: [], unparsed: true };
  try {
    const o = JSON.parse(m[0]);
    return { findings: Array.isArray(o.findings) ? o.findings : [] };
  } catch {
    return { findings: [], unparsed: true };
  }
}

const EXACT = ['semicolon', 'long-sentence', 'there-is', 'rather-than', 'hold',
  'two-word-verb', 'self-evaluation', 'permission-narration', 'worth-speech-act'];

function exactTotal(text) {
  const counts = runDetectors(text, 'conversation-prose').counts;
  return EXACT.reduce((n, k) => n + (counts[k] || 0), 0);
}

function readCorpus() {
  return fs.readdirSync(CORPUS).filter(f => f.endsWith('.md')).sort()
    .map(f => ({ id: f.slice(0, 2), title: f.slice(3, -3), body: fs.readFileSync(path.join(CORPUS, f), 'utf8') }));
}

async function runArm(name, skillBody, checksBody, frozenChecks, prompts, model) {
  const rows = [];
  for (const p of prompts) {
    const w = await call('writer', writerPrompt(skillBody, checksBody, p.body), 8000, model);
    const r = await call('red', redPrompt(frozenChecks, w.text), 16000, model);
    const parsed = parseFindings(r.text);
    rows.push({
      id: p.id, title: p.title, reply: w.text,
      findings: parsed.findings, unparsed: !!parsed.unparsed,
      exact: exactTotal(w.text), words: w.text.split(/\s+/).filter(Boolean).length,
    });
    process.stdout.write(`  ${name} ${p.id} ${p.title}: ${parsed.findings.length} findings, ${rows[rows.length - 1].exact} exact\n`);
  }
  const total = rows.reduce((n, r) => n + r.findings.length, 0);
  console.log(`  ${name} total: ${total} findings over ${prompts.length} replies`);
  return { name, rows, total };
}

async function canary(prompts, model, plannedCalls) {
  console.log('=== canary ===');
  const skill = committed('SKILL.md');
  const checks = committed('checks.md');
  const w = await call('writer', writerPrompt(skill, checks, prompts[0].body), 8000, model);
  const r = await call('red', redPrompt(checks, w.text), 16000, model);

  const projected = plannedCalls.writer * w.cost + plannedCalls.red * r.cost + EXPECTED.editor;
  const budget = plannedCalls.writer * EXPECTED.writer + plannedCalls.red * EXPECTED.red + EXPECTED.editor;
  const drift = (projected - budget) / budget;

  console.log(`  writer call: $${w.cost.toFixed(4)} (expected $${EXPECTED.writer.toFixed(2)}), ${w.usage.input_tokens} in, ${w.usage.output_tokens} out`);
  console.log(`  red call:    $${r.cost.toFixed(4)} (expected $${EXPECTED.red.toFixed(2)}), ${r.usage.input_tokens} in, ${r.usage.output_tokens} out`);
  console.log(`  projected run: $${projected.toFixed(2)} against a budget of $${budget.toFixed(2)} (${(drift * 100).toFixed(1)}%)`);

  if (drift > TOLERANCE) {
    throw new Error(
      `the canary projects $${projected.toFixed(2)}, ${(drift * 100).toFixed(1)}% above the ` +
      `$${budget.toFixed(2)} budget, and the ceiling is ${(TOLERANCE * 100).toFixed(0)}%. ` +
      'Nothing else ran. Raise EXPECTED in this file to accept the new cost, or lower the corpus.'
    );
  }
  if (drift < -TOLERANCE) {
    console.log(`  under budget by ${(-drift * 100).toFixed(1)}%, which stops nothing. Continuing.`);
  }
  return { skill, checks, canaryReply: w.text };
}

async function main() {
  loadEnv();
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('no ANTHROPIC_API_KEY. Put it in .env.test or the environment.');
    process.exit(1);
  }
  const model = process.env.PROSE_TEST_MODEL || 'claude-opus-5';
  priceOf(model);

  const prompts = readCorpus();
  const canaryOnly = process.argv.includes('--canary');
  const planned = { writer: canaryOnly ? 1 : 24, red: canaryOnly ? 1 : 24 };

  console.log(`model: ${model}`);
  console.log(`prompts: ${prompts.length} in tests/corpus/skill-ab`);
  console.log(`planned: ${planned.writer} writer calls, ${planned.red} red calls, 1 editor call\n`);

  const { skill, checks } = await canary(prompts, model, planned);
  console.log(`  canary spend: $${tally.costUSD.toFixed(4)} over ${tally.calls} calls\n`);

  if (canaryOnly) {
    console.log('--canary: the arms did not run.');
    return;
  }

  console.log('=== baselines, committed skill, frozen judge ===');
  const a = await runArm('A', skill, checks, checks, prompts, model);
  const b = await runArm('B', skill, checks, checks, prompts, model);
  const floor = Math.abs(a.total - b.total);
  console.log(`\nnoise floor: |${a.total} - ${b.total}| = ${floor}\n`);

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outDir = path.join(HERE, 'runs', `skill-ab-${stamp}`);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'result.json'), JSON.stringify({
    model, floor, arms: [a, b], tally,
  }, null, 2));
  console.log(`wrote ${outDir}`);
  console.log(`spend: $${tally.costUSD.toFixed(2)} over ${tally.calls} calls`);
  console.log('\nThe two baselines are done. The candidate arms need the editor step, which runs next.');
}

main().catch(err => {
  console.error(err.message);
  console.error(`spend before the stop: $${tally.costUSD.toFixed(2)} over ${tally.calls} calls`);
  process.exit(1);
});
