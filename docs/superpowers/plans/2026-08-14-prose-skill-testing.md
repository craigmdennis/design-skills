# Prose skill testing harness — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a corpus, a deterministic scorer, a runner, and a judging prompt that together produce a repeatable before-and-after number for `conversation-prose` and `documentation-prose`.

**Architecture:** Twelve self-contained prompt files produce a "before" text from a Claude instance with no skill loaded. A second call rewrites that text with the skill body supplied in the prompt. A dependency-free Node scorer counts rule violations on both sides, reports them per 1,000 words, and separates exact detectors from approximate ones. A judging prompt produces a second, model-graded number reported as a range.

**Tech Stack:** Node 18 or later, CommonJS, no dependencies. The built-in `node --test` runner. The Claude CLI for producing runs.

**Spec:** `docs/superpowers/specs/2026-08-14-prose-skill-testing-design.md`

## Global Constraints

- All scripts are dependency-free CommonJS, `require()`-based, runnable with a bare `node` call. No `package.json` is added at the repository root. This matches the convention stated in `CLAUDE.md` for the field-notes hook scripts.
- Node 18 or later, for the built-in test runner. Tests run with `node --test "tests/**/*.test.js"`. The quotes are required: Node expands the pattern itself. A directory argument such as `node --test tests/lib/` fails on Node 26 with `Cannot find module`, so do not shorten the command to one.
- Test files are named `<name>.test.js` and live beside the file they test.
- Every document this plan creates is documentation, so it follows `documentation-prose`: third-person impersonal, no personal names, no dates recording who decided what, no metaphor, one word for one meaning, noun clusters of three words at most.
- Corpus files are the exception. They contain personal names and decision dates deliberately, because those are the failures `documentation-prose` removes and the test needs them present in the input.
- No emoji anywhere, including commit messages.
- Scripts exit 0 unless input is missing or malformed.
- The scorer never counts material inside fenced code blocks, inline code spans, or block quotations.

---

### Task 1: The corpus

**Files:**
- Create: `tests/corpus/conversation-prose/01-explain-a-build-failure.md`
- Create: `tests/corpus/conversation-prose/02-status-update-mid-task.md`
- Create: `tests/corpus/conversation-prose/03-answer-a-why-question.md`
- Create: `tests/corpus/conversation-prose/04-review-a-diff.md`
- Create: `tests/corpus/conversation-prose/05-summarise-a-decision.md`
- Create: `tests/corpus/conversation-prose/06-propose-next-steps.md`
- Create: `tests/corpus/documentation-prose/01-readme-for-a-cli.md`
- Create: `tests/corpus/documentation-prose/02-runbook-for-a-deploy.md`
- Create: `tests/corpus/documentation-prose/03-spec-for-an-endpoint.md`
- Create: `tests/corpus/documentation-prose/04-changelog-entry.md`
- Create: `tests/corpus/documentation-prose/05-code-comment-block.md`
- Create: `tests/corpus/documentation-prose/06-contributing-guide.md`
- Test: `tests/lib/corpus.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: a corpus directory read by `run.js` in Task 8. Every file contains a scenario, a line containing exactly `---`, and one instruction line.

- [ ] **Step 1: Write the failing test**

Create `tests/lib/corpus.test.js`:

```js
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const CORPUS = path.join(__dirname, '..', 'corpus');
const SKILLS = ['conversation-prose', 'documentation-prose'];

test('each skill has six corpus files', () => {
  for (const skill of SKILLS) {
    const files = fs.readdirSync(path.join(CORPUS, skill)).filter(f => f.endsWith('.md'));
    assert.strictEqual(files.length, 6, `${skill} should have 6 corpus files`);
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test "tests/**/*.test.js"`
Expected: FAIL, with `ENOENT` on `tests/corpus`.

- [ ] **Step 3: Write the six conversation-prose corpus files**

`tests/corpus/conversation-prose/01-explain-a-build-failure.md`:

```
You are replying to a developer in a terminal session.

Facts:
- The site build failed. The failing step is `prebuild`, which runs
  `scripts/check-drafts.js`.
- That script scans `src/content/posts/*.md` for the string `TKTK` and exits 1
  when it finds one.
- It found one, in `src/content/posts/measuring-adoption.md`, line 41.
- The frontmatter of that file has `draft: false`.
- The same script passed on the previous commit.

---

Explain what happened and what I should do.
```

`tests/corpus/conversation-prose/02-status-update-mid-task.md`:

```
You are replying to a developer in a terminal session.

Facts:
- You were asked to migrate 14 API route files from express to hono.
- 9 are migrated and their tests pass.
- 3 are migrated and their tests fail, all with the same error: the hono
  context has no `req.body`, and the handler calls it.
- 2 are not started. Both use multer for file uploads, and the project has no
  hono equivalent in its dependencies.
- You have not run the full test suite, only the tests for the files you
  changed.

---

Give me a status update.
```

`tests/corpus/conversation-prose/03-answer-a-why-question.md`:

```
You are replying to a developer in a terminal session.

Facts:
- Earlier in this session you set the cache lifetime for the session store to 5
  minutes, and the developer approved it.
- The reason was the upstream identity provider, which limits token
  introspection to 100 requests each minute. The service handles about 60
  sessions each minute at peak.
- A longer lifetime lowers the request rate and delays the effect of a revoked
  token.
- The provider documentation recommends between 1 and 15 minutes.

---

Why did we pick 5 minutes for that cache lifetime?
```

`tests/corpus/conversation-prose/04-review-a-diff.md`:

```
You are replying to a developer in a terminal session.

The developer asks for a review of this change:

    function getUser(id) {
      const row = db.query("SELECT * FROM users WHERE id = " + id);
      if (row) {
        return { id: row.id, email: row.email, admin: row.is_admin == 1 };
      }
    }

Facts:
- `id` arrives from an HTTP path parameter and nothing validates it.
- `db.query` is synchronous and returns undefined when no row matches.
- Every other function in the file returns null for a missing record.

---

Review this.
```

`tests/corpus/conversation-prose/05-summarise-a-decision.md`:

```
You are replying to a developer in a terminal session.

Facts:
- The team chose to store uploaded images in R2 and to serve them through a
  Worker.
- The alternatives were a public R2 bucket on a custom domain, and a
  third-party image CDN.
- The public bucket was rejected because private galleries need authorisation
  on each request.
- The image CDN was rejected on cost. The quote was 340 dollars each month at
  the current volume, against about 12 dollars for R2 and Worker requests.
- The Worker adds about 15 milliseconds to each image request.

---

Summarise that decision for the pull request description.
```

`tests/corpus/conversation-prose/06-propose-next-steps.md`:

```
You are replying to a developer in a terminal session.

Facts:
- A suite of 1,200 tests takes 14 minutes in CI. The same suite takes 4 minutes
  locally.
- 900 of those tests share one PostgreSQL container and run one after another.
- The other 300 are unit tests and already run in parallel.
- CI runs on a 2-core machine. A 4-core machine is available at twice the cost
  each minute.
- Nobody has measured which of the 900 tests are slowest.

---

What should we do about the CI time?
```

- [ ] **Step 4: Write the six documentation-prose corpus files**

`tests/corpus/documentation-prose/01-readme-for-a-cli.md`:

```
Write documentation from the facts below.

Facts:
- The tool is called shipcheck. It installs with `npm install -g shipcheck`.
- It reads `shipcheck.json` in the current directory and exits non-zero when a
  listed check fails.
- The checks are: no uncommitted changes, no TODO in staged files, and the
  current branch is not the default branch.
- `--dry-run` changes nothing and prints what would fail.
- Priya Raman wrote it in March 2026 for her team, and the team agreed on
  2026-03-14 to run it in a pre-push hook.

---

Write the README for it.
```

`tests/corpus/documentation-prose/02-runbook-for-a-deploy.md`:

```
Write documentation from the facts below.

Facts:
- Deploys run from the main branch only.
- The procedure is: run `npm run build`, check the output is under 4 MB, run
  `wrangler deploy --env production`, then confirm that `/healthz` returns 200
  within 60 seconds.
- When the health check fails, run `wrangler rollback --env production` and
  tell the on-call engineer in the eng-oncall channel.
- No deploy happens on a Friday after 15:00 UTC. Marcus Webb set that rule on
  2026-01-09 after an incident.
- The build step needs the SENTRY_AUTH_TOKEN variable.

---

Write the deploy runbook.
```

`tests/corpus/documentation-prose/03-spec-for-an-endpoint.md`:

```
Write documentation from the facts below.

Facts:
- `POST /v1/exports` starts an export job.
- The body takes `format`, one of csv, json, or parquet, and an optional
  `since` timestamp in RFC 3339.
- It returns 202 with a body containing `job_id` and `status_url`.
- It returns 400 when `format` is absent or unrecognised, and 429 when the
  caller already has 3 running jobs.
- Jobs expire after 24 hours, and the download URL stops working then.
- Authentication is a bearer token in the Authorization header.

---

Write the API reference for this endpoint.
```

`tests/corpus/documentation-prose/04-changelog-entry.md`:

```
Write documentation from the facts below.

Facts:
- Version 2.4.0 shipped on 2026-08-01.
- The search index now updates one document at a time instead of rebuilding.
  The reindex went from about 90 seconds to about 3 seconds.
- A crash was fixed. Opening a document with no title threw a null reference
  error.
- The `--verbose` flag was removed. `--log-level debug` replaces it.
- Aisha Nkemelu proposed the incremental index and Dan Rivera reviewed it on
  2026-07-22.

---

Write the changelog entry.
```

`tests/corpus/documentation-prose/05-code-comment-block.md`:

```
Write documentation from the facts below.

Facts:
- The function is `resolveImagePath(frontmatterName, directory)`.
- It returns the absolute path of the image that a post's frontmatter names.
- An earlier version listed the directory and took the first file, which
  imported the wrong image when a directory contained more than one.
- It throws when the named file is absent, because a silent fallback caused
  that error.
- Callers pass an absolute directory path.

---

Write the comment block for this function.
```

`tests/corpus/documentation-prose/06-contributing-guide.md`:

```
Write documentation from the facts below.

Facts:
- Contributors fork the repository and open a pull request against main.
- Every pull request needs one approving review and a passing CI run.
- Commit messages follow Conventional Commits.
- Tests run with `npm test`. New behaviour needs a test.
- The maintainers are Priya Raman and Marcus Webb. Priya decided on 2026-02-20
  that a documentation-only change skips the review requirement.

---

Write the contributing guide.
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node --test "tests/**/*.test.js"`
Expected: PASS, 3 tests.

- [ ] **Step 6: Commit**

```bash
git add tests/corpus tests/lib/corpus.test.js
git commit -m "test: add the prose skill corpus, twelve prompts"
```

---

### Task 2: Text preparation

**Files:**
- Create: `tests/lib/text.js`
- Test: `tests/lib/text.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `stripQuoted(text: string) => string` — removes fenced code blocks, inline code spans, and block quotations.
  - `countWords(text: string) => number`
  - `splitSentences(text: string) => string[]`

- [ ] **Step 1: Write the failing test**

Create `tests/lib/text.test.js`:

```js
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
  assert.strictEqual(s.length, 2);
  assert.ok(!s[0].startsWith('#'));
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/lib/text.test.js`
Expected: FAIL with `Cannot find module './text'`.

- [ ] **Step 3: Write the implementation**

Create `tests/lib/text.js`:

```js
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/lib/text.test.js`
Expected: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
git add tests/lib/text.js tests/lib/text.test.js
git commit -m "feat: add text preparation for the prose scorer"
```

---

### Task 3: Exact detectors for conversation-prose

**Files:**
- Create: `tests/lib/detectors.js`
- Create: `tests/fixtures/conversation-exact.md`
- Create: `tests/fixtures/conversation-exact.expected.json`
- Test: `tests/lib/detectors.test.js`

**Interfaces:**
- Consumes: `stripQuoted`, `countWords`, `splitSentences` from `./text`.
- Produces:
  - `DETECTORS: Array<{id: string, label: string, tier: 'exact'|'approximate', skills: string[], count: (ctx) => number}>`
  - `buildContext(rawText: string) => {text: string, sentences: string[], words: number}`
  - `runDetectors(rawText: string, skill: string) => {counts: Record<string, number>, words: number}`
  - `SENTENCE_CAP: number` — 25, the descriptive limit.

- [ ] **Step 1: Write the fixture and its expected counts**

Create `tests/fixtures/conversation-exact.md`:

```
The build failed; the cause was a missing fixture. I decided to skip the
baseline test, and I went ahead with the migration because it seemed safer at
the time and there was nobody available to ask about it.

There is a placeholder in the config file. The stakeholder list is unchanged.
The rule holds for every case in the suite.

The check earned its keep. The design is elegant and the implementation is
robust. That approach turned out to be exactly right.

The report papered over the failure and the summary glossed over the cost, so
the team doubled down on the original plan and leaned into the schedule rather
than changing it.

This sentence is written to run past the descriptive limit of twenty-five words
so that the length detector has something real to count when the scorer walks
through the fixture file.

`a semicolon; inside code`

> the rule holds; I decided to keep it

    the rule holds; I decided to keep it
```

Note for the implementer: the indented block at the end is an indented code block in markdown, but `stripQuoted` removes only fenced blocks, inline spans, and block quotations. The indented block is therefore counted, and the expected counts below include it. Keeping it in the fixture records that limit.

Create `tests/fixtures/conversation-exact.expected.json`:

```json
{
  "skill": "conversation-prose",
  "counts": {
    "semicolon": 2,
    "long-sentence": 3,
    "there-is": 2,
    "rather-than": 1,
    "hold": 2,
    "two-word-verb": 4,
    "self-evaluation": 4,
    "permission-narration": 3
  }
}
```

Note for the implementer: run the detectors against the fixture once written, and correct this file to the counts the implementation produces only after checking each count by hand against the fixture text. A number changed to match a buggy detector defeats the fixture.

Two counts to check with particular care, because both were wrong in an earlier draft of this plan:

- `semicolon` is 2, not 3. The fixture holds four semicolons. The one in the inline code span and the one in the block quotation are removed by `stripQuoted`. The one in the first sentence and the one in the indented block at the end are counted, because `stripQuoted` removes fenced blocks and not indented ones.
- `rather-than` is 1. The phrase sits across a line wrap in the fixture, and it matches only because `buildContext` collapses whitespace before the string detectors run. A count of 0 here means that collapse is missing.

- [ ] **Step 2: Write the failing test**

Create `tests/lib/detectors.test.js`:

```js
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { runDetectors, DETECTORS } = require('./detectors');

const FIXTURES = path.join(__dirname, '..', 'fixtures');

function checkFixture(name) {
  const text = fs.readFileSync(path.join(FIXTURES, `${name}.md`), 'utf8');
  const expected = JSON.parse(fs.readFileSync(path.join(FIXTURES, `${name}.expected.json`), 'utf8'));
  const actual = runDetectors(text, expected.skill);
  for (const [id, want] of Object.entries(expected.counts)) {
    assert.strictEqual(actual.counts[id], want, `${name}: detector ${id}`);
  }
}

test('conversation-prose exact detectors match the fixture', () => {
  checkFixture('conversation-exact');
});

test('every detector has an id, a label, a tier, and skills', () => {
  for (const d of DETECTORS) {
    assert.ok(d.id && d.label, 'detector needs an id and a label');
    assert.ok(['exact', 'approximate'].includes(d.tier), `${d.id} has an unknown tier`);
    assert.ok(Array.isArray(d.skills) && d.skills.length > 0, `${d.id} has no skills`);
    assert.strictEqual(typeof d.count, 'function', `${d.id} has no count function`);
  }
});

test('detector ids are unique', () => {
  const ids = DETECTORS.map(d => d.id);
  assert.strictEqual(new Set(ids).size, ids.length);
});

test('code fences and block quotes are not counted', () => {
  const plain = runDetectors('Nothing here.', 'conversation-prose');
  const quoted = runDetectors('Nothing here.\n\n```\na; b; c;\n```\n\n> a; b;\n', 'conversation-prose');
  assert.strictEqual(quoted.counts.semicolon, plain.counts.semicolon);
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `node --test tests/lib/detectors.test.js`
Expected: FAIL with `Cannot find module './detectors'`.

- [ ] **Step 4: Write the implementation**

Create `tests/lib/detectors.js`:

```js
'use strict';
const { stripQuoted, countWords, splitSentences } = require('./text');

const CONVERSATION = 'conversation-prose';
const DOCUMENTATION = 'documentation-prose';
const BOTH = [CONVERSATION, DOCUMENTATION];

const SENTENCE_CAP = 25;

function matchCount(text, re) {
  const found = text.match(re);
  return found ? found.length : 0;
}

const DETECTORS = [
  {
    id: 'semicolon',
    label: 'semicolon',
    tier: 'exact',
    skills: BOTH,
    count: ctx => matchCount(ctx.text, /;/g)
  },
  {
    id: 'long-sentence',
    label: `sentence over ${SENTENCE_CAP} words`,
    tier: 'exact',
    skills: BOTH,
    count: ctx => ctx.sentences.filter(s => countWords(s) > SENTENCE_CAP).length
  },
  {
    id: 'there-is',
    label: 'there is / are / was / were',
    tier: 'exact',
    skills: BOTH,
    count: ctx => matchCount(ctx.text, /\bthere (?:is|are|was|were)\b/gi)
  },
  {
    id: 'rather-than',
    label: 'rather than',
    tier: 'exact',
    skills: [CONVERSATION],
    count: ctx => matchCount(ctx.text, /\brather than\b/gi)
  },
  {
    id: 'hold',
    label: 'hold, holds, holding, held',
    tier: 'exact',
    skills: [CONVERSATION],
    // Word boundaries already exclude placeholder, stakeholder, shareholder,
    // household, threshold, and holder. Literal physical holding is not
    // distinguished, which is recorded in tests/README.md.
    count: ctx => matchCount(ctx.text, /\b(?:hold|holds|holding|held)\b/gi)
  },
  {
    id: 'two-word-verb',
    label: 'figurative two-word verb',
    tier: 'exact',
    skills: [CONVERSATION],
    count: ctx => matchCount(ctx.text, new RegExp(
      '\\b(?:' + [
        'dressed (?:it |them |that )?up as',
        'papered over',
        'glossed over',
        'spun it as',
        'sugar-?coated',
        'walked (?:it |them |that )?back',
        'leaned into',
        'doubled down on',
        'unpacked',
        'landed on'
      ].join('|') + ')\\b', 'gi'))
  },
  {
    id: 'self-evaluation',
    label: 'evaluation of your own work',
    tier: 'exact',
    skills: [CONVERSATION],
    // "clean" and "nice" are excluded: both have common literal uses
    // ("a clean install"). That exclusion is recorded in tests/README.md.
    count: ctx => matchCount(ctx.text, /\b(?:earned its keep|paid off|shines|elegant|robust|exactly right|neat)\b/gi)
  },
  {
    id: 'permission-narration',
    label: 'permission narration',
    tier: 'exact',
    skills: [CONVERSATION],
    // "rather than asking" is excluded here because the rather-than detector
    // already counts it. Detectors never count the same string twice.
    count: ctx => matchCount(ctx.text, /\b(?:I decided|I went ahead|I took the liberty|I chose to|I'm going to ask you|I am going to ask you)\b/gi)
  }
];

function buildContext(rawText) {
  const stripped = stripQuoted(rawText);
  // Sentence splitting needs the line structure, because it removes heading and
  // list markers anchored to the start of a line. String detectors need the
  // opposite: a phrase broken across a line wrap ("rather\nthan") must still
  // match, so they run against a whitespace-collapsed copy.
  const text = stripped.replace(/\s+/g, ' ');
  return { text, sentences: splitSentences(stripped), words: countWords(text) };
}

function runDetectors(rawText, skill) {
  const ctx = buildContext(rawText);
  const counts = {};
  for (const d of DETECTORS) {
    if (d.skills.includes(skill)) counts[d.id] = d.count(ctx);
  }
  return { counts, words: ctx.words };
}

module.exports = { DETECTORS, buildContext, runDetectors, SENTENCE_CAP };
```

- [ ] **Step 5: Run the tests and correct the expected counts by hand**

Run: `node --test tests/lib/detectors.test.js`

For every mismatch, read the fixture text and count the occurrences by hand. Correct the expected file when the hand count agrees with the implementation. Correct the implementation when it does not.

Expected once settled: PASS, 4 tests.

- [ ] **Step 6: Commit**

```bash
git add tests/lib/detectors.js tests/lib/detectors.test.js tests/fixtures/conversation-exact.md tests/fixtures/conversation-exact.expected.json
git commit -m "feat: add exact detectors for conversation-prose"
```

---

### Task 4: Exact detectors for documentation-prose

**Files:**
- Modify: `tests/lib/detectors.js`
- Create: `tests/fixtures/documentation-exact.md`
- Create: `tests/fixtures/documentation-exact.expected.json`
- Modify: `tests/lib/detectors.test.js`

**Interfaces:**
- Consumes: `DETECTORS`, `runDetectors` from Task 3.
- Produces: five more entries in `DETECTORS`, with ids `first-person`, `your-possessive`, `user-possessive`, `decision-date`, `agent-clause`.

- [ ] **Step 1: Write the fixture and its expected counts**

Create `tests/fixtures/documentation-exact.md`:

```
I wrote this guide and we maintain it together. My preference is a short file.

Set your token before you run the build. The imperative you is permitted and is
not counted.

The user's configuration file is read first. Their settings override it.

Priya Raman decided on 2026-03-14 that a documentation-only change skips
review. Marcus Webb set the deploy rule on 2026-01-09 after an incident.

The search index updates one document at a time and no longer rebuilds from
nothing, which took the reindex from about ninety seconds to about three.
The release on 2026-08-01 shipped that change.

When the user asks a question, answer it. If the user passes a relative path,
the function throws.

There is a check for uncommitted changes; it runs first.
```

Create `tests/fixtures/documentation-exact.expected.json`:

```json
{
  "skill": "documentation-prose",
  "counts": {
    "first-person": 3,
    "your-possessive": 1,
    "user-possessive": 2,
    "decision-date": 2,
    "agent-clause": 2,
    "semicolon": 1,
    "there-is": 1
  }
}
```

Two counts to check with particular care:

- `decision-date` is 2, not 3. The release date on 2026-08-01 is a fact about a release and sits more than 60 characters from any decision verb, so it is not counted. The paragraph before it exists to create that distance; shortening it makes the fixture pass for the wrong reason.
- `first-person` is 3: `I` once, `we` once, `My` once. The imperative `you` in "before you run the build" is permitted and is not counted by any detector.

- [ ] **Step 2: Add the failing test case**

Add to `tests/lib/detectors.test.js`, after the first test:

```js
test('documentation-prose exact detectors match the fixture', () => {
  checkFixture('documentation-exact');
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `node --test tests/lib/detectors.test.js`
Expected: FAIL, with `undefined` for `first-person`.

- [ ] **Step 4: Write the implementation**

Add to the `DETECTORS` array in `tests/lib/detectors.js`, before the closing `]`:

```js
  ,{
    id: 'first-person',
    label: 'first person',
    tier: 'exact',
    skills: [DOCUMENTATION],
    count: ctx =>
      matchCount(ctx.text, /\b(?:I|I'm|I've|I'll|I'd)\b/g) +
      matchCount(ctx.text, /\b(?:my|mine|we|we're|we've|we'll|our|ours)\b/gi)
  },
  {
    id: 'your-possessive',
    label: 'your',
    tier: 'exact',
    skills: [DOCUMENTATION],
    // The imperative "you" is standard in instructions and stays permitted, so
    // only the possessive is counted.
    count: ctx => matchCount(ctx.text, /\byour\b/gi)
  },
  {
    id: 'user-possessive',
    label: "the user's, their",
    tier: 'exact',
    skills: [DOCUMENTATION],
    count: ctx => matchCount(ctx.text, /\b(?:the user's|their)\b/gi)
  },
  {
    id: 'decision-date',
    label: 'a date recording a decision',
    tier: 'exact',
    skills: [DOCUMENTATION],
    count: ctx => countDecisionDates(ctx.text)
  },
  {
    id: 'agent-clause',
    label: 'an agent in a subordinate clause',
    tier: 'exact',
    skills: [DOCUMENTATION],
    count: ctx => matchCount(ctx.text, /\b(?:when|if|where|after|before)\s+(?:the user|the reader|you)\b/gi)
  }
```

Add above the `DETECTORS` array:

```js
const DATE = /\b(?:\d{4}-\d{2}-\d{2}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}|\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})\b/g;
const DECISION_VERB = /\b(?:decided|decide|set by|set that|set the|confirmed|agreed|chose|approved|signed off)\b/i;
const DECISION_WINDOW = 60;

// A date is only a violation when it records who decided something. A release
// date or a version date is a fact and stays.
function countDecisionDates(text) {
  let found = 0;
  for (const match of text.matchAll(DATE)) {
    const start = Math.max(0, match.index - DECISION_WINDOW);
    const end = Math.min(text.length, match.index + match[0].length + DECISION_WINDOW);
    if (DECISION_VERB.test(text.slice(start, end))) found += 1;
  }
  return found;
}
```

- [ ] **Step 5: Run the tests and correct the expected counts by hand**

Run: `node --test tests/lib/detectors.test.js`

Read the fixture and count each detector by hand before changing either file.

Expected once settled: PASS, 5 tests.

- [ ] **Step 6: Commit**

```bash
git add tests/lib/detectors.js tests/lib/detectors.test.js tests/fixtures/documentation-exact.md tests/fixtures/documentation-exact.expected.json
git commit -m "feat: add exact detectors for documentation-prose"
```

---

### Task 5: Approximate detectors

**Files:**
- Modify: `tests/lib/detectors.js`
- Create: `tests/fixtures/approximate.md`
- Create: `tests/fixtures/approximate.expected.json`
- Modify: `tests/lib/detectors.test.js`

**Interfaces:**
- Consumes: `DETECTORS`, `matchCount` from Task 3.
- Produces: five entries with `tier: 'approximate'` and ids `noun-cluster`, `fronted-clause`, `cleft`, `animacy`, `em-dash`. Task 6 excludes every approximate entry from the headline total.

- [ ] **Step 1: Write the fixture and its expected counts**

Create `tests/fixtures/approximate.md`:

```
The design system adoption evaluation framework was rejected. The agent task
queue priority handler stayed.

Having reviewed the logs, the cause is clear. While the tests pass, the build
fails. Running the migration, the schema changed.

What this does is remove the check. It was the fixture that failed.

The profile wins. The test wants a fixture. The parser refuses the input.

The build failed — the cause was a missing fixture.
```

Create `tests/fixtures/approximate.expected.json`:

```json
{
  "skill": "conversation-prose",
  "counts": {
    "noun-cluster": 2,
    "fronted-clause": 3,
    "cleft": 2,
    "animacy": 3,
    "em-dash": 1
  }
}
```

- [ ] **Step 2: Add the failing test case**

Add to `tests/lib/detectors.test.js`:

```js
test('approximate detectors match the fixture', () => {
  checkFixture('approximate');
});

test('approximate detectors are marked as approximate', () => {
  const ids = ['noun-cluster', 'fronted-clause', 'cleft', 'animacy', 'em-dash'];
  for (const id of ids) {
    const d = DETECTORS.find(x => x.id === id);
    assert.ok(d, `${id} is missing`);
    assert.strictEqual(d.tier, 'approximate', `${id} must be approximate`);
  }
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `node --test tests/lib/detectors.test.js`
Expected: FAIL, with `undefined` for `noun-cluster`.

- [ ] **Step 4: Write the implementation**

Add above the `DETECTORS` array in `tests/lib/detectors.js`:

```js
// Every detector below needs part-of-speech knowledge that a dependency-free
// script does not have, so each one over-counts or under-counts. They are
// printed for information and excluded from the headline total.

const FUNCTION_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'of', 'for', 'in', 'on', 'at', 'to',
  'from', 'with', 'by', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'has', 'have', 'had', 'do', 'does', 'did', 'will', 'would', 'can', 'could',
  'should', 'may', 'might', 'must', 'that', 'this', 'these', 'those', 'it',
  'its', 'they', 'their', 'them', 'we', 'our', 'you', 'your', 'i', 'my', 'he',
  'she', 'his', 'her', 'not', 'no', 'if', 'when', 'while', 'than', 'then', 'so',
  'because', 'which', 'who', 'whom', 'whose', 'what', 'where', 'how', 'all',
  'any', 'each', 'every', 'some', 'more', 'most', 'other', 'into', 'over',
  'under', 'after', 'before', 'between', 'through', 'during', 'about',
  'against', 'up', 'down', 'out', 'off', 'again', 'further', 'once', 'here',
  'there', 'both', 'few', 'such', 'only', 'own', 'same', 'too', 'very'
]);

const SUBORDINATORS = /^(?:Having|While|Although|Though|When|Since|After|Before|If|Because|Once|Given|Following|Whereas|Unless|Where|As)\b[^.!?]*?,/;
const PARTICIPLE_OPENER = /^[A-Z][a-z]+ing\b[^.!?]*?,/;
const CLEFT = /^(?:What\b[^.!?]*?\b(?:is|was|are|were)\b|It(?:'s| is| was)\b[^.!?]*?\bthat\b)/;
const NOUN_SUBJECT_BEFORE_VERB = /\b(?:the|a|an|this|that|these|those)\s+(?:[a-z][\w-]*\s+){0,2}(?:wants|knows|thinks|decides|refuses|agrees|tries|promises|cares|likes|enjoys|suffers|wins|loses|beats|earns|deserves|expects|believes|remembers|forgets|waits|hopes|admits|insists)\b/gi;

function countNounClusters(sentences) {
  let found = 0;
  for (const sentence of sentences) {
    const tokens = sentence.split(/[^A-Za-z0-9'-]+/).filter(Boolean);
    let run = 0;
    for (const token of tokens) {
      if (FUNCTION_WORDS.has(token.toLowerCase())) {
        if (run >= 4) found += 1;
        run = 0;
      } else {
        run += 1;
      }
    }
    if (run >= 4) found += 1;
  }
  return found;
}
```

Add to the `DETECTORS` array:

```js
  ,{
    id: 'noun-cluster',
    label: 'noun cluster of four or more',
    tier: 'approximate',
    skills: BOTH,
    count: ctx => countNounClusters(ctx.sentences)
  },
  {
    id: 'fronted-clause',
    label: 'fronted clause opening',
    tier: 'approximate',
    skills: BOTH,
    count: ctx => ctx.sentences.filter(s => SUBORDINATORS.test(s) || PARTICIPLE_OPENER.test(s)).length
  },
  {
    id: 'cleft',
    label: 'cleft opening',
    tier: 'approximate',
    skills: BOTH,
    count: ctx => ctx.sentences.filter(s => CLEFT.test(s)).length
  },
  {
    id: 'animacy',
    label: 'a living-actor verb on a thing',
    tier: 'approximate',
    skills: BOTH,
    count: ctx => matchCount(ctx.text, NOUN_SUBJECT_BEFORE_VERB)
  },
  {
    id: 'em-dash',
    label: 'em dash (information only, never a violation)',
    tier: 'approximate',
    skills: BOTH,
    // ASD-STE100 permits the em dash. Only published-prose bans it, as a voice
    // preference, and published-prose is out of scope for this harness.
    count: ctx => matchCount(ctx.text, /—/g)
  }
```

- [ ] **Step 5: Run the tests and correct the expected counts by hand**

Run: `node --test tests/lib/detectors.test.js`

Read the fixture and count each detector by hand. `noun-cluster` in particular over-counts on ordinary prose, so confirm which runs the implementation finds before adjusting either file.

Expected once settled: PASS, 7 tests.

- [ ] **Step 6: Commit**

```bash
git add tests/lib/detectors.js tests/lib/detectors.test.js tests/fixtures/approximate.md tests/fixtures/approximate.expected.json
git commit -m "feat: add approximate detectors, excluded from the headline"
```

---

### Task 6: The scorer

**Files:**
- Create: `tests/score.js`
- Create: `tests/fixtures/run-sample/meta.json`
- Create: `tests/fixtures/run-sample/conversation-prose/01.before.md`
- Create: `tests/fixtures/run-sample/conversation-prose/01.after.md`
- Test: `tests/lib/score.test.js`

**Interfaces:**
- Consumes: `DETECTORS`, `runDetectors` from `./lib/detectors`.
- Produces:
  - `scoreRun(runDir: string) => Array<{skill, detectors: Array<{id,label,tier,before,after}>, exactBefore, exactAfter, wordsBefore, wordsAfter, perThousandBefore, perThousandAfter, delta}>`
  - A command-line entry point: `node tests/score.js <run-dir> [--json]`

- [ ] **Step 1: Write the sample run and the failing test**

Create `tests/fixtures/run-sample/meta.json`:

```json
{
  "model": "fixture",
  "date": "2026-08-14",
  "cli": "fixture",
  "corpusCommit": "fixture",
  "instructionHash": "fixture"
}
```

Create `tests/fixtures/run-sample/conversation-prose/01.before.md`:

```
The build failed; the cause was a missing fixture. I decided to skip the
baseline test. There is a second failure in the same file.
```

Create `tests/fixtures/run-sample/conversation-prose/01.after.md`:

```
The build failed. The cause was a missing fixture. I skipped the baseline test.
The same file contains a second failure.
```

Create `tests/lib/score.test.js`:

```js
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { scoreRun } = require('../score');

const SAMPLE = path.join(__dirname, '..', 'fixtures', 'run-sample');

test('scoreRun reports one result per skill in the run', () => {
  const results = scoreRun(SAMPLE);
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].skill, 'conversation-prose');
});

test('scoreRun counts the exact tier only in the total', () => {
  const [result] = scoreRun(SAMPLE);
  const exact = result.detectors.filter(d => d.tier === 'exact');
  const sumBefore = exact.reduce((n, d) => n + d.before, 0);
  assert.strictEqual(result.exactBefore, sumBefore);
});

test('the sample run improves', () => {
  const [result] = scoreRun(SAMPLE);
  assert.ok(result.exactAfter < result.exactBefore, 'after should have fewer violations');
  assert.ok(result.delta < 0, 'delta should be negative');
});

test('scoreRun normalises per 1,000 words', () => {
  const [result] = scoreRun(SAMPLE);
  const expected = (result.exactBefore / result.wordsBefore) * 1000;
  assert.ok(Math.abs(result.perThousandBefore - expected) < 0.01);
});

test('scoreRun throws on a missing run directory', () => {
  assert.throws(() => scoreRun(path.join(SAMPLE, 'nope')));
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/lib/score.test.js`
Expected: FAIL with `Cannot find module '../score'`.

- [ ] **Step 3: Write the implementation**

Create `tests/score.js`:

```js
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
    const delta = perThousandBefore
      ? ((perThousandAfter - perThousandBefore) / perThousandBefore) * 100
      : 0;

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
    console.log(`  ${pad('delta', 38)}${padLeft('', 8)}${padLeft(`${r.delta.toFixed(0)}%`, 9)}`);
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/lib/score.test.js`
Expected: PASS, 5 tests.

- [ ] **Step 5: Run the scorer against the sample by hand**

Run: `node tests/score.js tests/fixtures/run-sample`
Expected: a table showing `semicolon` 1 before and 0 after, `there-is` 1 before and 0 after, `permission-narration` 1 before and 0 after, and a negative delta.

- [ ] **Step 6: Commit**

```bash
git add tests/score.js tests/lib/score.test.js tests/fixtures/run-sample
git commit -m "feat: add the run scorer"
```

---

### Task 7: Isolation, settled empirically

**Files:**
- Create: `tests/lib/isolation.js`
- Test: `tests/lib/isolation.test.js`
- Create: `docs/superpowers/notes/2026-08-14-cli-isolation.md`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `makeCleanConfigDir() => string` — creates a throwaway configuration directory holding an empty settings file and nothing else, and returns its path.
  - `removeConfigDir(dir: string) => void` — deletes that directory. Safe to call twice and on a path that does not exist.
  - `assertAuthAvailable(env?: object) => string` — returns the name of the environment variable carrying the credential, or throws with instructions. It never returns or prints the value.
  - `cleanEnv(configDir: string) => object` — an environment object for `child_process.spawnSync`.
  - `assertIsolated(probeOutput: string) => void` — throws when the probe shows a skill, a hook, or a routing line reached the call.
  - `PROBE_PROMPT: string` — the prompt Task 8 sends before any corpus prompt.

- [ ] **Step 1: Record the mechanism, which is already settled**

The controller established this empirically against CLI 2.1.232, so no search is needed. Write `docs/superpowers/notes/2026-08-14-cli-isolation.md` recording all of it:

- `CLAUDE_CONFIG_DIR` redirects the configuration directory. A run with it set wrote its session files into the throwaway directory instead of `~/.claude`, which is the isolation the harness needs.
- An isolated configuration directory cannot see the credentials in `~/.claude/.credentials.json`, so the run fails with `Not logged in · Please run /login`.
- `--bare` skips hooks, auto-memory, and CLAUDE.md discovery, and its help states that OAuth and the keychain are never read under it. It therefore needs `ANTHROPIC_API_KEY`, which is not set on this machine.
- Copying `~/.claude/.credentials.json` into the throwaway directory does not authenticate the run either. That file was found to hold only a plugin's OAuth state, and the account login lives in the platform keychain, which no file copy carries.
- The route chosen: the credential comes from the environment, in `CLAUDE_CODE_OAUTH_TOKEN` or `ANTHROPIC_API_KEY`. `claude setup-token` produces the first against a subscription. Nothing is copied to disk, and `cleanEnv` passes the whole environment through, so the variable reaches the isolated call unchanged.

Record the CLI version from `claude --version` alongside these.

- [ ] **Step 2: Write the failing test**

Create `tests/lib/isolation.test.js`:

```js
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const {
  makeCleanConfigDir, removeConfigDir, cleanEnv, assertIsolated, assertAuthAvailable
} = require('./isolation');

test('makeCleanConfigDir creates a directory with no CLAUDE.md, hooks, or skills', () => {
  const dir = makeCleanConfigDir();
  try {
    assert.ok(fs.existsSync(dir));
    assert.ok(!fs.existsSync(`${dir}/CLAUDE.md`));
    assert.ok(!fs.existsSync(`${dir}/skills`));
    const settings = JSON.parse(fs.readFileSync(`${dir}/settings.json`, 'utf8'));
    assert.deepStrictEqual(settings.hooks, undefined);
  } finally {
    removeConfigDir(dir);
  }
});

test('nothing is copied from the real configuration directory', () => {
  const dir = makeCleanConfigDir();
  try {
    assert.deepStrictEqual(fs.readdirSync(dir).sort(), ['settings.json']);
    assert.strictEqual(fs.statSync(dir).mode & 0o777, 0o700);
  } finally {
    removeConfigDir(dir);
  }
});

test('assertAuthAvailable names the variable it found', () => {
  assert.strictEqual(assertAuthAvailable({ CLAUDE_CODE_OAUTH_TOKEN: 'x' }), 'CLAUDE_CODE_OAUTH_TOKEN');
  assert.strictEqual(assertAuthAvailable({ ANTHROPIC_API_KEY: 'x' }), 'ANTHROPIC_API_KEY');
});

test('assertAuthAvailable explains how to get a credential when none is set', () => {
  assert.throws(() => assertAuthAvailable({}), /setup-token/);
  assert.throws(() => assertAuthAvailable({}), /keychain/);
});

test('cleanEnv carries a credential through from the environment', () => {
  const dir = makeCleanConfigDir();
  try {
    const env = cleanEnv(dir);
    assert.strictEqual(env.PATH, process.env.PATH, 'the environment should pass through');
  } finally {
    removeConfigDir(dir);
  }
});

test('removeConfigDir deletes the directory', () => {
  const dir = makeCleanConfigDir();
  removeConfigDir(dir);
  assert.ok(!fs.existsSync(dir));
});

test('removeConfigDir is safe to call twice and on a missing directory', () => {
  const dir = makeCleanConfigDir();
  removeConfigDir(dir);
  assert.doesNotThrow(() => removeConfigDir(dir));
  assert.doesNotThrow(() => removeConfigDir('/no/such/prose-test-dir'));
});

test('cleanEnv points the CLI at the throwaway directory', () => {
  const dir = makeCleanConfigDir();
  try {
    const env = cleanEnv(dir);
    assert.strictEqual(env.CLAUDE_CONFIG_DIR, dir);
  } finally {
    removeConfigDir(dir);
  }
});

test('assertIsolated throws when the probe names a prose skill', () => {
  assert.throws(() => assertIsolated('Loaded skills: conversation-prose'), /not isolated/i);
  assert.throws(() => assertIsolated('A UserPromptSubmit hook injected checks.md'), /not isolated/i);
});

test('assertIsolated passes on a clean probe', () => {
  assert.doesNotThrow(() => assertIsolated('NONE'));
});
```

- [ ] **Step 3: Write the implementation**

Create `tests/lib/isolation.js`:

```js
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// Verified against CLI 2.1.232. The probe in assertIsolated is what actually
// proves isolation, so a wrong value here fails loudly instead of producing a
// flattering number.
const CONFIG_DIR_VAR = 'CLAUDE_CONFIG_DIR';

// An isolated configuration directory cannot see the login the interactive CLI
// uses, which lives in the platform keychain. `~/.claude/.credentials.json`
// does not carry the account token either; on the machine this was built for it
// held only a plugin's OAuth state. So the credential comes from the
// environment and nothing is copied to disk.
const TOKEN_VARS = ['CLAUDE_CODE_OAUTH_TOKEN', 'ANTHROPIC_API_KEY'];

const PROBE_PROMPT =
  'List by name every skill, instruction file, and injected reminder currently ' +
  'in your context. If there are none, reply with the single word NONE.';

const CONTAMINANTS = [
  /conversation-prose/i,
  /documentation-prose/i,
  /published-prose/i,
  /UserPromptSubmit/i,
  /SessionStart/i,
  /CLAUDE\.md/i
];

// The directory holds an empty settings file and nothing else. Copying anything
// from the real configuration directory would defeat the isolation this module
// exists to provide.
function makeCleanConfigDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prose-test-'));
  fs.chmodSync(dir, 0o700);
  fs.writeFileSync(path.join(dir, 'settings.json'), '{}\n');
  return dir;
}

// Every exit path deletes the directory: the end of a run, a thrown error, and
// an interrupted process. The CLI writes session transcripts into it.
function removeConfigDir(dir) {
  if (dir && fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

// Returns the name of the variable carrying the credential, never its value.
// The caller may print the name.
function assertAuthAvailable(env) {
  const source = env || process.env;
  const found = TOKEN_VARS.find(name => source[name]);
  if (!found) {
    throw new Error(
      'no credential in the environment, so the isolated run cannot ' +
      'authenticate. Run `claude setup-token` and export the result as ' +
      'CLAUDE_CODE_OAUTH_TOKEN, or export ANTHROPIC_API_KEY. The login the ' +
      'interactive CLI uses lives in the platform keychain, which an isolated ' +
      'configuration directory cannot see.'
    );
  }
  return found;
}

function cleanEnv(configDir) {
  return Object.assign({}, process.env, { [CONFIG_DIR_VAR]: configDir });
}

function assertIsolated(probeOutput) {
  for (const pattern of CONTAMINANTS) {
    if (pattern.test(probeOutput)) {
      throw new Error(
        `the run is not isolated: the probe returned ${pattern}. ` +
        'A before call that already has a skill loaded produces a false number. ' +
        'See docs/superpowers/notes/2026-08-14-cli-isolation.md'
      );
    }
  }
}

module.exports = {
  makeCleanConfigDir, removeConfigDir, cleanEnv, assertIsolated,
  assertAuthAvailable, PROBE_PROMPT
};
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/lib/isolation.test.js`
Expected: PASS, 4 tests.

- [ ] **Step 5: Prove isolation against the real CLI**

Run:

```bash
node -e '
const { spawnSync } = require("node:child_process");
const { makeCleanConfigDir, removeConfigDir, cleanEnv, PROBE_PROMPT } = require("./tests/lib/isolation");
const dir = makeCleanConfigDir();
try {
  const r = spawnSync("claude", ["-p", PROBE_PROMPT], { env: cleanEnv(dir), encoding: "utf8" });
  console.log(r.stdout || r.stderr);
} finally {
  removeConfigDir(dir);
}
'
```

Expected: output containing `NONE`, or output naming no prose skill and no hook.

This makes one real model call and costs tokens. Run it once.

The probe needs a credential in the environment. Run `claude setup-token` and export the result as `CLAUDE_CODE_OAUTH_TOKEN`, or export `ANTHROPIC_API_KEY`, before running it.

If the output says `Not logged in`, no credential reached the call. Confirm one of those two variables is set in the shell that runs the probe. Do not fall back to copying anything out of `~/.claude`; that was tried and the account token is not in any file there.

If the output names `conversation-prose`, `documentation-prose`, or a hook, the isolation is not working. Record what you saw in the note and report BLOCKED rather than continuing, because every number the harness produces after that point would be measured against a before-text that already had the skill applied.

- [ ] **Step 6: Write the note and commit**

Create `docs/superpowers/notes/2026-08-14-cli-isolation.md` recording the CLI version, the mechanism that worked, the probe output, and any mechanism that failed.

```bash
git add tests/lib/isolation.js tests/lib/isolation.test.js docs/superpowers/notes/2026-08-14-cli-isolation.md
git commit -m "feat: isolate test runs from the local agent configuration"
```

---

### Task 8: The runner

**Files:**
- Create: `tests/run.js`
- Test: `tests/lib/run.test.js`

**Interfaces:**
- Consumes: `makeCleanConfigDir`, `removeConfigDir`, `cleanEnv`, `assertIsolated`, `assertAuthAvailable`, `PROBE_PROMPT` from `./lib/isolation`.
- Produces:
  - `REWRITE_INSTRUCTION: string`
  - `buildAfterPrompt(skillBody: string, beforeText: string) => string`
  - A command-line entry point: `node tests/run.js <skill> [--out <dir>] [--show-instruction] [--dry-run]`

- [ ] **Step 1: Write the failing test**

Create `tests/lib/run.test.js`:

```js
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/lib/run.test.js`
Expected: FAIL with `Cannot find module '../run'`.

- [ ] **Step 3: Write the implementation**

Create `tests/run.js`:

```js
#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync, spawnSync } = require('node:child_process');
const {
  makeCleanConfigDir, removeConfigDir, cleanEnv, assertIsolated,
  assertAuthAvailable, PROBE_PROMPT
} = require('./lib/isolation');

const SKILLS = ['conversation-prose', 'documentation-prose'];
const CORPUS = path.join(__dirname, 'corpus');
const SKILL_HOME = path.join(os.homedir(), '.claude', 'skills');

// The rewrite instruction is one constant so a reader can see exactly what the
// model was told. `--show-instruction` prints it.
const REWRITE_INSTRUCTION = [
  'Rewrite the text below so that it follows every rule in the skill above.',
  'Change only the wording. Keep every fact, number, name, file path, and code',
  'sample exactly as it is. Do not add information. Do not remove information.',
  'Output only the rewritten text, with no preamble and no commentary.'
].join('\n');

function buildAfterPrompt(skillBody, beforeText) {
  return [
    '===== SKILL =====',
    skillBody,
    '===== END SKILL =====',
    '',
    REWRITE_INSTRUCTION,
    '',
    '===== TEXT =====',
    beforeText
  ].join('\n');
}

function callClaude(prompt, env) {
  const result = spawnSync('claude', ['-p', prompt], {
    env, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024
  });
  if (result.status !== 0) {
    throw new Error(`the claude call failed: ${result.stderr || result.status}`);
  }
  return result.stdout.trim();
}

function readSkillBody(skill) {
  const file = path.join(SKILL_HOME, skill, 'SKILL.md');
  if (!fs.existsSync(file)) {
    throw new Error(
      `no skill at ${file}. Install it first by pasting prompts/${skill}.md into a session.`
    );
  }
  return fs.readFileSync(file, 'utf8');
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function gitCommit() {
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch (error) {
    return 'unknown';
  }
}

function cliVersion(env) {
  const result = spawnSync('claude', ['--version'], { env, encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : 'unknown';
}

function main(argv) {
  const args = argv.slice(2);

  if (args.includes('--show-instruction')) {
    console.log(REWRITE_INSTRUCTION);
    return;
  }

  const skill = args.find(a => !a.startsWith('--'));
  if (!SKILLS.includes(skill)) {
    console.error(`usage: node tests/run.js <${SKILLS.join('|')}> [--out <dir>] [--dry-run]`);
    process.exit(1);
  }

  const outIndex = args.indexOf('--out');
  const runDir = outIndex >= 0 ? args[outIndex + 1] : path.join(__dirname, 'runs', today());
  const dryRun = args.includes('--dry-run');

  // Fail before creating anything if the run cannot authenticate. An isolated
  // configuration directory cannot see the keychain login the interactive CLI
  // uses, so the credential comes from the environment. A dry run makes no
  // model call, so it needs no credential and runs no probe, which keeps the
  // plumbing testable without one.
  if (!dryRun) console.log(`credential from ${assertAuthAvailable()}`);

  const started = Date.now();
  const configDir = makeCleanConfigDir();

  // Every exit path deletes the directory: the end of the run, a thrown error,
  // and an interrupted process.
  let removed = false;
  const cleanUp = () => {
    if (removed) return;
    removed = true;
    removeConfigDir(configDir);
  };
  process.on('exit', cleanUp);
  process.on('SIGINT', () => { cleanUp(); process.exit(130); });
  process.on('SIGTERM', () => { cleanUp(); process.exit(143); });

  try {
    const env = cleanEnv(configDir);

    console.log(`config directory: ${configDir}`);

    if (dryRun) {
      console.log('dry run: no credential, no isolation probe, no model calls');
    } else {
      console.log('checking isolation');
      assertIsolated(callClaude(PROBE_PROMPT, env));
      console.log('isolation confirmed');
    }

    const skillBody = readSkillBody(skill);
    const outDir = path.join(runDir, skill);
    fs.mkdirSync(outDir, { recursive: true });

    const files = fs.readdirSync(path.join(CORPUS, skill)).filter(f => f.endsWith('.md')).sort();

    for (const file of files) {
      const id = file.slice(0, 2);
      const prompt = fs.readFileSync(path.join(CORPUS, skill, file), 'utf8');
      process.stdout.write(`  ${file}  `);

      if (dryRun) {
        console.log('skipped');
        continue;
      }

      const before = callClaude(prompt, env);
      fs.writeFileSync(path.join(outDir, `${id}.before.md`), `${before}\n`);
      process.stdout.write('before ');

      const after = callClaude(buildAfterPrompt(skillBody, before), env);
      fs.writeFileSync(path.join(outDir, `${id}.after.md`), `${after}\n`);
      console.log('after');
    }

    const meta = {
      model: process.env.ANTHROPIC_MODEL || 'default',
      date: today(),
      cli: cliVersion(env),
      corpusCommit: gitCommit(),
      instructionHash: crypto.createHash('sha256').update(REWRITE_INSTRUCTION).digest('hex').slice(0, 12)
    };
    fs.writeFileSync(path.join(runDir, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`);

    const calls = files.length * 2 + 1;
    console.log(`\nwrote ${runDir}`);
    console.log(`${calls} model calls, ${Math.round((Date.now() - started) / 1000)} seconds`);
    console.log('Token cost depends on the model in use and is not reported by the CLI.');
    console.log(`score it with: node tests/score.js ${runDir}`);
  } finally {
    cleanUp();
  }
}

if (require.main === module) main(process.argv);

module.exports = { buildAfterPrompt, REWRITE_INSTRUCTION };
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/lib/run.test.js`
Expected: PASS, 3 tests.

- [ ] **Step 5: Check the dry run and the instruction**

Run: `node tests/run.js --show-instruction`
Expected: the four-line instruction, and nothing else.

Run: `node tests/run.js conversation-prose --dry-run --out /tmp/prose-dry`
Expected: the run prints the throwaway directory path, states that a dry run makes no model call, prints `skipped` for all six corpus files, writes `meta.json`, and deletes the throwaway directory on exit. No credential is needed for this, and none should be requested.

Then confirm the directory was deleted: `ls "${TMPDIR:-/tmp}" | grep prose-test` should find nothing.

Add one more check, which is the failure this guards against. With no credential in the environment, run `node tests/run.js conversation-prose --out /tmp/prose-real` without `--dry-run`. Expected: it exits non-zero with the message naming `claude setup-token`, before creating any throwaway directory and before writing any file into the run directory. A runner that creates a directory and then fails leaves state behind for no reason.

- [ ] **Step 6: Commit**

```bash
git add tests/run.js tests/lib/run.test.js
git commit -m "feat: add the before and after runner"
```

---

### Task 9: The judging prompt

**Files:**
- Create: `tests/judge.md`
- Test: `tests/lib/judge.test.js`

**Interfaces:**
- Consumes: the checks in `~/.claude/skills/conversation-prose/checks.md`.
- Produces: a prompt file used by hand or through `claude -p`, whose output is a fixed table.

- [ ] **Step 1: Write the failing test**

Create `tests/lib/judge.test.js`:

```js
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const JUDGE = fs.readFileSync(path.join(__dirname, '..', 'judge.md'), 'utf8');

test('the judge asks for a verdict on both texts', () => {
  assert.match(JUDGE, /BEFORE/);
  assert.match(JUDGE, /AFTER/);
});

test('the judge asks for a quoted sentence on every failure', () => {
  assert.match(JUDGE, /quote/i);
});

test('the judge never receives the deterministic scores', () => {
  assert.ok(!/per 1,000|exact total|detector/i.test(JUDGE),
    'a judge shown the script output agrees with the script');
});

test('the judge asks for a fixed output shape', () => {
  assert.match(JUDGE, /\| *check *\|/i);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/lib/judge.test.js`
Expected: FAIL with `ENOENT` on `judge.md`.

- [ ] **Step 3: Write the implementation**

Create `tests/judge.md`:

```markdown
# Judging prompt

Two texts follow, marked BEGIN BEFORE and BEGIN AFTER. They say the same thing
in different words. A writing skill was applied to produce the second from the
first.

The skill's checks are listed below. For each check, decide whether each text
passes or fails it. A text fails a check when at least one sentence breaks it.

Judge only what the check states. Do not judge whether the writing is better,
shorter, or more pleasant. Do not reward the second text for being the second.

Output one table and nothing else, in exactly this shape:

| check | before | after | failing sentence |
|---|---|---|---|
| 1 animacy | PASS | PASS | |
| 2 literal restatement | FAIL | PASS | the check earned its keep |

Quote the failing sentence from whichever text failed. When both fail, quote the
one from the after text. Leave the cell empty when both pass.

End with one line in exactly this shape:

TOTALS before N/15 after N/15

===== CHECKS =====

[paste the contents of ~/.claude/skills/conversation-prose/checks.md here, or
the equivalent checklist for the skill under test]

===== BEGIN BEFORE =====

[paste the before text]

===== BEGIN AFTER =====

[paste the after text]
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/lib/judge.test.js`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add tests/judge.md tests/lib/judge.test.js
git commit -m "feat: add the judging prompt"
```

---

### Task 10: The reference run

**Files:**
- Create: `tests/runs/<date>/` (produced by the runner)
- Modify: `.gitignore`

**Interfaces:**
- Consumes: `tests/run.js`, `tests/score.js`.
- Produces: one committed run directory whose numbers the README quotes.

- [ ] **Step 1: Check the full test suite passes first**

Run: `node --test "tests/**/*.test.js"`
Expected: PASS, every test.

- [ ] **Step 2: Produce the run**

Run:

```bash
node tests/run.js conversation-prose
node tests/run.js documentation-prose
```

Both calls write into the same dated directory. Expected: twelve before files and twelve after files, and a `meta.json`.

- [ ] **Step 3: Read four of the after files by hand**

Open two `conversation-prose` after files and two `documentation-prose` after files. Confirm that no fact, number, name, or file path changed between the before and the after. A rewrite that dropped a fact invalidates the run, and no detector catches it.

If a fact was dropped, tighten `REWRITE_INSTRUCTION` in `tests/run.js`, commit that change, and produce the run again.

- [ ] **Step 4: Score the run**

Run: `node tests/score.js tests/runs/<date>`

Record the two delta figures. They go in the README in Task 11.

- [ ] **Step 5: Ignore every run except the reference**

Add to `.gitignore`:

```
tests/runs/*
!tests/runs/2026-08-14/
```

Replace the date with the reference run's date.

- [ ] **Step 6: Commit**

```bash
git add -f tests/runs/<date> .gitignore
git commit -m "test: add the reference run for the prose skills"
```

---

### Task 11: Documentation

**Files:**
- Create: `tests/README.md`
- Modify: `README.md`
- Modify: `CHANGELOG.md`

**Interfaces:**
- Consumes: the delta figures from Task 10.
- Produces: the published claim.

- [ ] **Step 1: Write `tests/README.md`**

Create `tests/README.md`. Substitute the real figures from Task 10 where the placeholders sit, and delete any line that turns out to be untrue of the implementation:

```markdown
# Testing the prose skills

This measures one thing: whether a skill removes the failures it names. It does
not measure whether the writing is better, and no automatic test can.

## How a run is produced

Twelve prompts sit in `corpus/`, six for each skill. Each one carries every fact
its answer needs, so no run reads a repository, calls a tool, or reaches the
network.

`node run.js <skill>` sends each prompt to a Claude instance with no skill
loaded, which produces the "before" text. It then sends the skill body, a fixed
rewrite instruction, and that text back, which produces the "after" text. One
variable changes between the two sides.

The runner points the CLI at a throwaway configuration directory with no
instruction file, no hooks, and no installed skills, then runs a probe and stops
the run when the probe shows that anything reached the call. A run that cannot
prove its own isolation fails instead of producing a flattering number.

`node run.js --show-instruction` prints the rewrite instruction.

## How a run is scored

`node score.js <run-dir>` counts rule violations on both sides and reports them
per 1,000 words. Without that normalisation, a rewrite that only shortens the
text would score as a rewrite that corrects it.

Detectors come in two tiers. **Exact** detectors are string matches with no
judgement, and only these produce the headline number. **Approximate** detectors
need part-of-speech knowledge that a dependency-free script does not have, so
they are printed and excluded.

### What the exact detectors cannot see

- Literal physical holding is not distinguished from the figurative use, so the
  `hold` detector counts both.
- "clean" and "nice" are excluded from the self-evaluation detector, because
  both have common literal uses.
- "surfaced" is excluded from the two-word verb detector for the same reason.
- The sentence cap uses 25 words, the descriptive limit. Telling an instruction
  from a description needs judgement, so the stricter 20-word limit is not
  applied.
- Indented code blocks are counted. Only fenced blocks, inline code spans, and
  block quotations are removed.

## The judged number

`judge.md` gives a fresh instance both texts and the skill's checks, and asks for
a pass or fail on each with the failing sentence quoted. It is run three times
and reported as a range, because the number moves between runs.

The judge never receives the deterministic scores. A judge shown the script's
answer agrees with the script.

## Limits

1. The detectors are taken from the skills' own rules, so this is a measurement
   against the skills' own definition of failure.
2. The reference run is one model on one date, both recorded in `meta.json`.
3. The test measures a rewrite pass over fixed text. It does not measure prose
   written with the skill already loaded, which is how `conversation-prose` is
   normally used.
4. Twelve prompts is enough for a direction and too few for a confidence
   interval.
5. `published-prose` is not covered. That skill reads a voice profile written at
   install time, so a public run would need either one person's preferences or a
   placeholder profile that measures part of the skill.

## Running the tests of the harness itself

```
node --test "tests/**/*.test.js"
```

Fixtures in `fixtures/` pair a file of known violations with the expected count
for each detector. Every fixture also contains at least one near-miss the
detector must not count.
```

- [ ] **Step 2: Add the README section**

Add to `README.md`, after the "On ASD-STE100" section. Substitute the real figures:

```markdown
### Does any of this work

Two of the three skills are measured against a fixed corpus of twelve prompts. A
Claude instance answers each prompt with no skill loaded, a second instance
rewrites that answer with the skill, and a script counts rule violations on both
sides.

| Skill | Violations per 1,000 words, before | After | Change | Checks passed, judged |
|---|---|---|---|---|
| conversation-prose | NN.N | N.N | -NN% | N/15 to N/15 |
| documentation-prose | NN.N | N.N | -NN% | N/15 to N/15 |

Reference run: `tests/runs/<date>`, model recorded in its `meta.json`. Regenerate
it with `node tests/run.js conversation-prose` and score it with
`node tests/score.js tests/runs/<date>`.

The detectors are taken from the skills' own rules, so this measures whether a
skill removes the failures it names. It does not measure whether the writing is
better, and no automatic test can. The limits are listed in
[tests/README.md](tests/README.md).
```

- [ ] **Step 3: Add the changelog entry**

Add to `CHANGELOG.md` under a new dated heading, above the most recent entry:

```markdown
### tests — a measured claim for the prose skills

Twelve prompts, a committed reference run, a deterministic scorer, and a judging
prompt. A skill is measured by whether it removes the failures it names, which is
a narrower claim than "the writing is better" and the only one an automatic test
supports.

Exact detectors produce the published number. Approximate detectors are printed
and excluded, because they need part-of-speech knowledge a dependency-free script
does not have. Counts are reported per 1,000 words, so a rewrite that only
shortens the text does not score as one that corrects it.

The runner points the agent at a throwaway configuration directory and probes it
before every run. A run that cannot prove the "before" call had no skill, no
hook, and no instruction file stops instead of publishing a flattering number.
```

- [ ] **Step 4: Verify the whole suite and the scorer**

Run: `node --test "tests/**/*.test.js"`
Expected: PASS, every test.

Run: `node tests/score.js tests/runs/<date>`
Expected: figures matching the table written in Step 2.

- [ ] **Step 5: Commit**

```bash
git add tests/README.md README.md CHANGELOG.md
git commit -m "docs: publish the measured claim for the prose skills"
```
