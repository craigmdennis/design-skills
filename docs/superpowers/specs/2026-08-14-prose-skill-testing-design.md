# Design: a reproducible before and after test for the prose skills

## Purpose

The repository publishes three writing skills and makes no measurable claim about
any of them. This adds one: a fixed corpus of prompts, a committed reference run,
a deterministic scorer, and a judging prompt. Anyone can rerun the whole thing and
compare their numbers to the published ones.

The claim the test supports is narrow and stated as such: **a skill removes the
failures it names.** The test does not measure whether the writing is better.

## Scope

In scope: `conversation-prose` and `documentation-prose`. Both are complete as
installed, so a run needs nothing that belongs to one person.

Out of scope for the first version: `published-prose`. That skill reads a
`voice-profile.md` written at install time from an interview, so a public run
would either need one person's preferences or a placeholder profile that measures
only part of the skill. Adding it later needs a committed neutral profile and a
footnote about what the number covers.

## File layout

```
tests/
  corpus/
    conversation-prose/01-explain-a-build-failure.md ... 06-*.md
    documentation-prose/01-readme-for-a-cli.md ... 06-*.md
  runs/
    2026-08-14/
      conversation-prose/01.before.md
      conversation-prose/01.after.md
      ...
      meta.json
  fixtures/
    <name>.md
    <name>.expected.json
  run.js
  score.js
  judge.md
  README.md
```

All scripts are dependency-free CommonJS, runnable with a bare `node` call, which
is the convention the field-notes hook scripts already follow. No `package.json`
is added at the repository root.

## The corpus

Twelve prompt files, six per skill. Each file is self-contained: it carries every
fact the answer needs, so no run reads a repository, calls a tool, or reaches the
network. A prompt that needs tool output is not reproducible.

Each file has two parts, separated by a line containing `---`: a scenario, then
one instruction.

**conversation-prose**

| File | Produces |
|---|---|
| `01-explain-a-build-failure.md` | An explanation of a failure, from supplied log text |
| `02-status-update-mid-task.md` | A progress report on a part-finished task |
| `03-answer-a-why-question.md` | An answer to a question about a past decision |
| `04-review-a-diff.md` | Code review comments on a supplied diff |
| `05-summarise-a-decision.md` | A summary of a decision and its alternatives |
| `06-propose-next-steps.md` | A plan of what to do next, with trade-offs |

Prompt 03 is the one that tests check 14, so its scenario states a decision and
asks only why it was made. A reply that proposes a change has failed the check.

**documentation-prose**

| File | Produces |
|---|---|
| `01-readme-for-a-cli.md` | A README for a supplied command-line tool |
| `02-runbook-for-a-deploy.md` | A runbook from a supplied deploy procedure |
| `03-spec-for-an-endpoint.md` | A specification for a supplied HTTP endpoint |
| `04-changelog-entry.md` | A changelog entry from a supplied set of changes |
| `05-code-comment-block.md` | Comments for a supplied function |
| `06-contributing-guide.md` | A contributing guide from supplied repository facts |

Each documentation scenario names a person and a date, because the failure those
prompts test for is a document that records who decided what and when.

## How a run is produced

`node tests/run.js <skill> [--out <dir>]`

For each prompt file in that skill's corpus:

1. **The before call.** The prompt is sent to the Claude CLI with no skill
   loaded. The output is written to `<run>/<skill>/<nn>.before.md`.
2. **The after call.** A second call sends three parts in one prompt: the skill
   body verbatim, the before text, and one fixed rewrite instruction. The output
   is written to `<run>/<skill>/<nn>.after.md`.

The after call sends the skill body inside the prompt instead of relying on skill
discovery. A run that depends on whether a skill happened to load is not
reproducible, and the failure is silent.

The fixed rewrite instruction is stored in `tests/run.js` as a single constant and
printed by `--show-instruction`, so a reader can see exactly what the model was
told without reading the source.

### Isolation

A `claude -p` call inherits the caller's `~/.claude` directory, which can contain
a `CLAUDE.md` routing line, a SessionStart hook that injects a skill, and the
installed skills themselves. A before call made in that environment is already
using the skill under test, and the measured difference collapses.

The runner therefore creates a throwaway configuration directory for every call:
empty settings, no `CLAUDE.md`, no hooks, no skills. Both calls use it, so the
before call is clean and the after call receives the skill only through its
prompt.

**To verify during implementation:** the exact mechanism the current CLI offers
for pointing at a different configuration directory. If no such mechanism exists,
the fallback is a generated minimal settings file passed on the command line,
combined with a check that fails the run when a hook or a routing line is
detected. A run that cannot prove its own isolation must fail loudly instead of
producing a flattering number.

### Run metadata

`meta.json` records the model identifier, the date, the CLI version, the corpus
commit, and the rewrite instruction's hash. A number without those is not
checkable.

## The scorer

`node tests/score.js <run-dir> [--json] [--self-test]`

### What is read and what is skipped

Fenced code blocks, inline code spans, and block quotations are removed before any
detector runs. Both skills exempt quoted material, because a rule that bans a
phrase has to print that phrase to be usable. A scorer that counts quoted examples
punishes the skill for documenting itself.

### Tier 1: exact detectors

These produce the headline number. Each is a string match or a count, with no
judgement and no false positives.

**conversation-prose**

| Detector | Rule |
|---|---|
| Semicolon | STE Rule 8.1 |
| Sentence over 25 words | STE sentence cap |
| `there is / are / was / were` | Check 10 |
| `rather than` | Banned list |
| Figurative `hold` forms | Banned list, with fixed compounds excluded |
| Figurative two-word verbs | Check 3, from the list the skill prints |
| Self-evaluation words | Check 7, from the list the skill prints |
| Permission-narration phrases | Check 5, from the list the skill prints |

The `hold` detector excludes `placeholder`, `stakeholder`, `shareholder`,
`household`, `threshold`, `stronghold`, and `holder`, which the skill puts out of
scope.

The sentence cap uses 25 words, the descriptive limit. Distinguishing an
instruction from a description needs judgement, so the stricter 20-word limit is
not applied by the scorer.

**documentation-prose**

| Detector | Rule |
|---|---|
| First person (`I`, `my`, `we`, `our`) | Never first person |
| Possessive `your` | Delete the possessive |
| `the user's`, `their` | Delete the possessive |
| A date within 60 characters of `decided`, `set by`, `confirmed`, `agreed` | Never record who decided what |
| `when the user`, `if the user`, `when you` as a clause opener | Delete the agent |
| Semicolon | STE Rule 8.1 |
| Sentence over 25 words | STE sentence cap |
| `there is / are / was / were` | Active voice, subject first |

The imperative `you` stays permitted, so the detector matches `your` and the
listed clause openers, and never a bare `you`.

### Tier 2: approximate detectors

Counted, printed, and excluded from the headline. Each needs part-of-speech
knowledge that a dependency-free script does not have.

- **Noun clusters of four or more.** A run of four or more adjacent words that
  contains no punctuation and no word from a fixed function-word list held in the
  script (articles, prepositions, conjunctions, pronouns, auxiliaries), sitting
  before a verb or a sentence end. Over-counts.
- **Fronted-clause openings.** A sentence opening on a listed subordinator plus a
  comma, or on an `-ing` word plus a comma. Does not verify that the subject
  switches, so it over-counts.
- **Cleft openings.** `What ... is/was`, `It is/was ... that`.
- **Animacy.** A non-pronoun subject followed by a verb from the living-actor list
  the skill prints. Over-counts and under-counts.
- **Em dashes.** Informational only, and never a violation. ASD-STE100 permits the
  mark; only `published-prose` bans it, as a voice preference.

### Normalisation and output

Counts are reported raw and per 1,000 words. The headline delta uses the per-1,000
figure, because a rewrite that only shortens the text would otherwise score as a
rewrite that corrects it.

```
tests/runs/2026-08-14   conversation-prose

  detector                      before    after
  semicolon                         11        0
  sentence over 25 words             8        4
  there is / are                     5        1
  rather than                        3        0
  figurative hold                    2        0
  two-word verbs                     7        2
  self-evaluation                    4        1
  permission narration               2        1
  ------------------------------------------------
  exact total                       42        9
  words                          1,180      940
  per 1,000 words                 35.6      9.6
  delta                                      -73%

  approximate, excluded from the total
  noun cluster 4+                    6        1
  fronted clause opening             9        4
  cleft opening                      3        0
  animacy                            4        1
  em dash (informational)           11       10
```

`--json` prints the same data for other tools. The exit code is 0 unless a run
directory is malformed or a file is missing.

### Testing the scorer

`node tests/score.js --self-test` reads every pair in `tests/fixtures/`: a
markdown file containing known violations, and a JSON file stating the expected
count for each detector. A mismatch prints the detector, the expected count, the
actual count, and exits non-zero.

Fixtures are written before the detectors they test. Each fixture also contains at
least one near-miss the detector must not count: a fenced code block containing a
semicolon, `placeholder` for the `hold` detector, a quoted example of a banned
phrase.

## The judge

`tests/judge.md` contains the skill's checks and one instruction: for each check,
mark each of two texts as pass or fail, and quote the sentence that failed. The
output is a fixed table, so the totals can be read by eye.

The judge is run three times per skill. The README reports the range across those
three runs, with the model and the date. A single figure implies a stability the
method does not have.

The judging prompt does not receive the deterministic scores. A judge shown the
script's answer agrees with the script.

### The judge is blinded

The two texts reach the judge as TEXT A and TEXT B. Nothing in the prompt states
which one a skill produced, and the template above the checks names neither text
and does not mention a rewrite. A judge told which text is the revision marks the
other one against an expectation, and the before figure is the half of the
comparison the whole improvement number rests on.

Which slot the after text takes is `(pair index + round) % 2`. The assignment is
therefore the same on every judging of one run directory, needs no stored seed,
and puts the after text in each slot exactly half the time across three rounds.
`judge.js` maps the slot scores back to before and after after the reply arrives.

### Two calibrations, and what each one can show

**The control** (`--control`) judges each before text against a copy of itself.
Both texts pass and fail the same checks, so a gap between the two scores is
error. It is a cheap sanity check on the instrument and nothing more: a judge
given two identical texts can answer by copying one column into the other, so a
zero gap here does not establish that position leaves a real comparison alone.

**The position split** is the stronger measure and costs nothing extra. Because
the slot assignment flips between rounds, the same after text is marked from slot
A in one round and from slot B in another. `judge.js` keeps every marking with
the slot it came from and reports what each text scored from each position. A gap
there is position bias measured on texts that differ, which is the case that
matters. Randomised slots cancel that bias out of the reported totals; they do
not remove it, so the size of it is printed beside the totals and recorded in the
judged record.

## What goes in the README

A short section under the prompts table:

- The claim, in one sentence, with its limit attached.
- A table: skill, exact violations per 1,000 words before and after, the delta,
  and the judged checks-passed range.
- The model, the date, and the commit of the reference run.
- The two commands that regenerate it.
- One sentence on circularity.

Draft of the circularity sentence: *The detectors are taken from the skills' own
rules, so this measures whether a skill removes the failures it names. It does not
measure whether the writing is better, and no automatic test can.*

## Limits, recorded in `tests/README.md`

1. **Circularity.** Stated above and in the main README.
2. **One model, one date.** The committed run pins the number to a model that will
   change. `meta.json` records which one, and a stale number stays checkable
   because the inputs are committed.
3. **Approximate detectors are excluded from the headline.** They are printed so a
   reader can see what the script cannot decide.
4. **Rewrite mode only.** The test measures a rewrite pass over fixed text. It does
   not measure the skill's effect on prose written with the skill already loaded,
   which is how `conversation-prose` is normally used.
5. **Twelve prompts.** Enough for a direction, too few for a confidence interval.
6. **Judge variance.** Reported as a range for that reason.
7. **The judge is not calibrated against a person.** Blinding, the control, and
   the position split establish that the judge agrees with itself and does not
   read position. None of them establish that it agrees with a reader marking the
   same checks by hand. Marking three pairs by hand and comparing is the step
   that would, and it has not been done.

## Open items to settle during implementation

- The mechanism for pointing the CLI at a throwaway configuration directory, and
  the failure path if none exists.
- The token cost of one full run, printed by `run.js` on completion so a reader
  knows what regenerating costs.
- Whether `runs/` grows unmanageably. First version commits one reference run and
  gitignores every other dated directory.

## Sequence

1. Corpus files, twelve of them.
2. Fixtures and the expected-count files.
3. `score.js`, detector by detector, each one after its fixture.
4. `run.js`, with the isolation check.
5. The reference run, and `meta.json`.
6. `judge.md`, and three judged runs.
7. `tests/README.md`, then the README section.
