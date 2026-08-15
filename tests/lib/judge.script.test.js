'use strict';
const test = require('node:test');
const assert = require('node:assert');
const {
  buildPrompt, buildBatchPrompt, parseTotals, parseBatchTotals, pinnedModel,
  judgeRecordName, runWithConcurrency, afterSlot, blindPair, unblindTotals, asControl,
  positionSplit
} = require('../judge');

test('the position split reports each text from each slot', () => {
  // Two markings of one pair, the after text in a different slot each time and
  // scoring the same both times. A judge that reads position would show a gap.
  const marks = [
    { afterSlot: 'b', a: 4, b: 13, before: 4, after: 13, denominator: 16 },
    { afterSlot: 'a', a: 13, b: 4, before: 4, after: 13, denominator: 16 }
  ];
  const split = positionSplit(marks);
  assert.strictEqual(split.inA.calls, 1);
  assert.strictEqual(split.inB.calls, 1);
  assert.strictEqual(split.inA.after, split.inB.after, 'no gap when the slot changed nothing');
});

test('the position split shows a gap when the slot changed the score', () => {
  // The after text scores 13 from slot B and 8 from slot A, on the same pair.
  const marks = [
    { afterSlot: 'b', a: 4, b: 13, before: 4, after: 13, denominator: 16 },
    { afterSlot: 'a', a: 8, b: 4, before: 4, after: 8, denominator: 16 }
  ];
  const split = positionSplit(marks);
  assert.ok(split.inB.after > split.inA.after, 'slot B scored the after text higher');
  assert.strictEqual(Math.round(split.inB.after - split.inA.after), 31);
});

test('the position split reports nothing from an empty side', () => {
  const split = positionSplit([{ afterSlot: 'b', a: 4, b: 13, before: 4, after: 13, denominator: 16 }]);
  assert.strictEqual(split.inA.calls, 0);
  assert.strictEqual(split.inA.after, null);
});

test('the prompt carries the checks, both texts, and the template head', () => {
  const prompt = buildPrompt('CHECKLIST HERE', 'FIRST HERE', 'SECOND HERE');
  assert.ok(prompt.includes('CHECKLIST HERE'));
  assert.ok(prompt.includes('FIRST HERE'));
  assert.ok(prompt.includes('SECOND HERE'));
  assert.match(prompt, /TOTALS A/);
});

test('the prompt keeps the checks, text A, and text B in order', () => {
  const prompt = buildPrompt('CHECKLIST', 'FIRSTTEXT', 'SECONDTEXT');
  assert.ok(prompt.indexOf('CHECKLIST') < prompt.indexOf('FIRSTTEXT'));
  assert.ok(prompt.indexOf('FIRSTTEXT') < prompt.indexOf('SECONDTEXT'));
});

test('the prompt never tells the judge which text the skill produced', () => {
  // A judge told which text is the revision marks the other one against an
  // expectation. The template above the checks is the whole of what the judge
  // reads about the two texts, so nothing in it may name them.
  const prompt = buildPrompt('CHECKLIST', 'ONE', 'TWO');
  const head = prompt.slice(0, prompt.indexOf('===== CHECKS ====='));
  assert.ok(!/\bbefore\b|\bafter\b/i.test(head), `the head names a text: ${head}`);
  assert.ok(!/skill|revis|improv|rewrit/i.test(head), `the head names the treatment: ${head}`);
  assert.ok(!/BEGIN BEFORE|BEGIN AFTER/.test(prompt));
  assert.match(prompt, /===== BEGIN TEXT A =====/);
  assert.match(prompt, /===== BEGIN TEXT B =====/);
});

test('the prompt carries none of the scorer vocabulary', () => {
  const prompt = buildPrompt('CHECKLIST', 'B', 'A');
  assert.ok(!/per 1,000|exact total|approximate tier/i.test(prompt),
    'a judge shown the script answer agrees with the script');
});

test('the after text takes each slot equally often', () => {
  const slots = [];
  for (let round = 1; round <= 3; round += 1) {
    for (let index = 0; index < 6; index += 1) slots.push(afterSlot(index, round));
  }
  assert.strictEqual(slots.filter(s => s === 'a').length, 9);
  assert.strictEqual(slots.filter(s => s === 'b').length, 9);
});

test('the slot assignment is the same on every run of one directory', () => {
  assert.strictEqual(afterSlot(2, 1), afterSlot(2, 1));
  assert.notStrictEqual(afterSlot(2, 1), afterSlot(2, 2), 'it varies by round');
  assert.notStrictEqual(afterSlot(2, 1), afterSlot(3, 1), 'it varies by pair');
});

test('blinding puts the after text in the slot it was assigned', () => {
  assert.deepStrictEqual(blindPair('BEF', 'AFT', 'b'), { a: 'BEF', b: 'AFT' });
  assert.deepStrictEqual(blindPair('BEF', 'AFT', 'a'), { a: 'AFT', b: 'BEF' });
});

test('unblinding recovers the before and after scores from either slot', () => {
  const marks = { a: 4, b: 13, denominator: 16 };
  assert.deepStrictEqual(unblindTotals(marks, 'b'), { before: 4, after: 13, denominator: 16 });
  assert.deepStrictEqual(unblindTotals(marks, 'a'), { before: 13, after: 4, denominator: 16 });
});

test('unblinding a reply that carried no totals line stays null', () => {
  assert.strictEqual(unblindTotals(null, 'b'), null);
});

test('a text scored the same in either slot round-trips to the same figures', () => {
  // Blind, mark, unblind. The marks follow the text, so whichever slot the
  // after text took, the after figure is the one the after text earned.
  for (const slot of ['a', 'b']) {
    const shown = blindPair('BEF', 'AFT', slot);
    const marks = { a: shown.a === 'AFT' ? 13 : 4, b: shown.b === 'AFT' ? 13 : 4, denominator: 16 };
    assert.deepStrictEqual(unblindTotals(marks, slot), { before: 4, after: 13, denominator: 16 });
  }
});

test('the control judges each before text against a copy of itself', () => {
  const pairs = asControl([
    { id: '01', before: 'B1', after: 'A1' },
    { id: '02', before: 'B2', after: 'A2' }
  ]);
  assert.deepStrictEqual(pairs, [
    { id: '01', before: 'B1', after: 'B1' },
    { id: '02', before: 'B2', after: 'B2' }
  ]);
  assert.ok(pairs.every(p => p.before === p.after), 'no after text reaches a control call');
});

test('parseTotals reads the totals line', () => {
  assert.deepStrictEqual(
    parseTotals('| 1 animacy | PASS | PASS | |\n\nTOTALS A 4/16 B 13/16'),
    { a: 4, b: 13, denominator: 16 }
  );
});

test('parseTotals tolerates spacing around the slash', () => {
  assert.deepStrictEqual(
    parseTotals('TOTALS  A  4 / 16  B  13 / 16'),
    { a: 4, b: 13, denominator: 16 }
  );
});

test('parseTotals returns null when the reply carries no totals line', () => {
  assert.strictEqual(parseTotals('| 1 animacy | PASS | PASS | |'), null);
});

test('the batch prompt carries every pair, marked and numbered', () => {
  const pairs = [
    { id: '01', a: 'B1', b: 'A1' },
    { id: '02', a: 'B2', b: 'A2' }
  ];
  const prompt = buildBatchPrompt('CHECKLIST', pairs);
  assert.match(prompt, /BEGIN PAIR 01/);
  assert.match(prompt, /BEGIN PAIR 02/);
  assert.ok(prompt.includes('B1') && prompt.includes('A1'));
  assert.ok(prompt.includes('B2') && prompt.includes('A2'));
});

test('the batch prompt names no text before or after', () => {
  const prompt = buildBatchPrompt('CHECKLIST', [{ id: '01', a: 'ONE', b: 'TWO' }]);
  assert.ok(!/----- BEFORE -----|----- AFTER -----/.test(prompt));
  assert.match(prompt, /----- TEXT A -----/);
  assert.match(prompt, /----- TEXT B -----/);
});

test('the batch prompt sends the checklist once', () => {
  const pairs = [
    { id: '01', a: 'B1', b: 'A1' },
    { id: '02', a: 'B2', b: 'A2' }
  ];
  const prompt = buildBatchPrompt('UNIQUECHECKLIST', pairs);
  assert.strictEqual(prompt.split('UNIQUECHECKLIST').length - 1, 1);
});

test('the batch prompt asks for a totals line naming each pair', () => {
  const prompt = buildBatchPrompt('CHECKLIST', [{ id: '01', a: 'B', b: 'A' }]);
  assert.match(prompt, /TOTALS pair 01 A \d+\/\d+ B \d+\/\d+/);
});

test('parseBatchTotals reads one row per pair', () => {
  const reply = [
    'TOTALS pair 01 A 4/16 B 13/16',
    'TOTALS pair 02 A 6/16 B 15/16'
  ].join('\n\n');
  assert.deepStrictEqual(parseBatchTotals(reply), {
    '01': { a: 4, b: 13, denominator: 16 },
    '02': { a: 6, b: 15, denominator: 16 }
  });
});

test('parseBatchTotals reports only the pairs the reply judged', () => {
  const found = parseBatchTotals('TOTALS pair 01 A 4/16 B 13/16');
  assert.deepStrictEqual(Object.keys(found), ['01']);
});

test('the judging model can be pinned apart from the corpus model', () => {
  const saved = {
    judge: process.env.PROSE_JUDGE_MODEL,
    corpus: process.env.PROSE_TEST_MODEL,
    anthropic: process.env.ANTHROPIC_MODEL
  };
  try {
    delete process.env.PROSE_JUDGE_MODEL;
    delete process.env.ANTHROPIC_MODEL;
    process.env.PROSE_TEST_MODEL = 'corpus-model';
    assert.strictEqual(pinnedModel(), 'corpus-model', 'it falls back to the corpus model');

    process.env.PROSE_JUDGE_MODEL = 'judge-model';
    assert.strictEqual(pinnedModel(), 'judge-model', 'the judging model wins when set');
  } finally {
    for (const [name, value] of [
      ['PROSE_JUDGE_MODEL', saved.judge],
      ['PROSE_TEST_MODEL', saved.corpus],
      ['ANTHROPIC_MODEL', saved.anthropic]
    ]) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});

test('runWithConcurrency keeps results in the order the tasks were given', async () => {
  const order = [];
  const tasks = [30, 10, 20, 5].map((delay, i) => async () => {
    await new Promise(r => setTimeout(r, delay));
    order.push(i);
    return i;
  });
  const results = await runWithConcurrency(tasks, 4);
  assert.deepStrictEqual(results, [0, 1, 2, 3], 'results follow the task order');
  assert.notDeepStrictEqual(order, [0, 1, 2, 3], 'they finished out of order');
});

test('runWithConcurrency runs no more than the limit at once', async () => {
  let live = 0;
  let peak = 0;
  const tasks = Array.from({ length: 9 }, () => async () => {
    live += 1;
    peak = Math.max(peak, live);
    await new Promise(r => setTimeout(r, 5));
    live -= 1;
  });
  await runWithConcurrency(tasks, 3);
  assert.ok(peak <= 3, `peak was ${peak}`);
  assert.ok(peak > 1, 'the calls should have overlapped');
});

test('runWithConcurrency handles a limit above the task count', async () => {
  const results = await runWithConcurrency([async () => 'only'], 8);
  assert.deepStrictEqual(results, ['only']);
});

test('a judged record is named for its model and its mode', () => {
  // A figure from one model and mode is not comparable with a figure from
  // another, so neither can overwrite the other.
  assert.strictEqual(judgeRecordName(false, 'claude-opus-5'), 'judge.per-pair.claude-opus-5.json');
  assert.strictEqual(judgeRecordName(true, 'claude-opus-5'), 'judge.batch.claude-opus-5.json');
  assert.notStrictEqual(
    judgeRecordName(true, 'claude-haiku-4-5'),
    judgeRecordName(true, 'claude-opus-5')
  );
  assert.strictEqual(judgeRecordName(true, ''), 'judge.batch.default.json');
});

test('a control record never overwrites the run it calibrates', () => {
  assert.strictEqual(
    judgeRecordName(false, 'claude-opus-5', true),
    'judge.control.per-pair.claude-opus-5.json'
  );
  assert.notStrictEqual(
    judgeRecordName(false, 'claude-opus-5', true),
    judgeRecordName(false, 'claude-opus-5', false)
  );
});

test('a model name with path characters cannot escape the run directory', () => {
  const name = judgeRecordName(false, '../../etc/passwd');
  assert.ok(!name.includes('/'), name);
  assert.match(name, /^judge\.per-pair\.[A-Za-z0-9._-]+\.json$/);
});
