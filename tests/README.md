# Testing the prose skills

This measures one thing: whether a skill removes the failures it names. It does
not measure whether the writing is better, and no automatic test can.

## How a run is produced

Twelve prompts are stored in `corpus/`, six for each skill. Each one contains
every fact its answer needs, so no run reads a repository, calls a tool, or
reaches the network.

`node run.js <skill>` sends each prompt to a Claude instance with no skill
loaded, which produces the "before" text. It then sends the skill body, a fixed
rewrite instruction, and that text back, which produces the "after" text. One
variable changes between the two sides.

The runner points the CLI at a temporary configuration directory with no
instruction file, no hooks, and no installed skills, then sends a probe prompt
that asks the instance to list everything present in its context and to reply
with the single word `NONE` if nothing is loaded. The run stops unless the
reply is exactly that word, with an optional trailing full stop or exclamation
mark. Requiring the exact reply, rather than checking whether the reply merely
contains it, catches a contaminant no pattern names: a reply that names an
untracked skill and adds `NONE` elsewhere still stops the run. The run also
stops when the reply names one of the three prose skills, an injection point,
or the instruction file, regardless of what else the reply says, instead of
producing a result that overstates what the skill did.

This is a deliberate limit, not an oversight: a reply that reports an empty
context in different words, such as "There are none", also stops the run and
needs a rerun. A clean run stopped in error costs a rerun. A contaminated run
that passes costs a wrong number nobody would question. The check is built to
take the first cost rather than risk the second.

A run needs a credential in the environment, in `CLAUDE_CODE_OAUTH_TOKEN` or
`ANTHROPIC_API_KEY`. `claude setup-token` produces the first against a
subscription. Nothing is copied out of the real configuration directory: the
account login is stored in the platform keychain, which a file copy does not
include, and an isolated configuration directory cannot see it. A run with no
credential exits with a non-zero status before creating anything.

`node run.js <skill> --dry-run` makes no model call. It needs no credential and
runs no isolation probe. It reads each corpus file in turn, creates the output
directory, writes the metadata file, and deletes the temporary configuration
directory. It proves nothing about isolation, which the live probe covers.

`node run.js --show-instruction` prints the rewrite instruction.

## How a run is scored

`node score.js <run-dir>` counts rule violations on both sides and reports them
per 1,000 words. Without that normalisation, a rewrite that only shortens the
text would score as a rewrite that corrects it.

Detectors are divided into two tiers. **Exact** detectors are string matches
with no judgement, and only these produce the reported total. **Approximate**
detectors need part-of-speech knowledge that a dependency-free script does not
have, so they are printed and excluded from the total.

The change between before and after is reported as a percentage. When the
before text contains violations and the after text contains none, the change
is -100%. When the before text contains no violations and the after text
contains some, the change is reported as `n/a`: reporting 0 there would hide a
rewrite that introduced violations into clean prose. When neither text
contains any violations, the change is reported as 0.

### What the exact detectors cannot see

- Literal physical holding is not distinguished from the figurative use, so the
  `hold` detector counts both.
- "clean" and "nice" are excluded from the self-evaluation detector, because
  both have common literal uses, such as "a clean install".
- "surfaced" is excluded from the two-word verb detector for the same reason.
- The sentence cap uses 25 words, the descriptive limit. Telling an instruction
  from a description needs judgement, so the stricter 20-word limit for
  instructions is not applied.
- Indented code blocks are counted. Only fenced code blocks, inline code spans,
  and block quotations are removed before the detectors run.
- "you" is excluded from the agent-clause detector. Whether "before you run the
  build" is a violation is contested between two rules of the skill under test:
  one rule deletes the agent from a subordinate clause, and its own examples
  put a second-person agent within that rule's scope; another rule permits the
  imperative "you" as standard in instructions. The exact tier takes only cases
  that need no judgement, so the detector matches "the user" and "the reader"
  only. It therefore misses a second-person agent inside a subordinate clause,
  and understates violations equally on both sides of the comparison.

## The judged number

`judge.md` gives a fresh instance both texts and the skill's checks, and asks
for a pass or fail on each with the failing sentence quoted. It is run three
times and reported as a range, because the result varies between runs.

The judge never receives the deterministic scores. A judge shown the exact
detectors' totals agrees with those totals.

### The judge is not told which text is which

The two texts arrive as TEXT A and TEXT B. The prompt names neither one and does
not mention a rewrite, because a judge told which text a skill produced marks the
other one against an expectation, and the before figure is the half of the
comparison the improvement number rests on.

Which slot the after text takes is `(pair index + round) % 2`, so the assignment
repeats exactly on a second judging of one run directory, needs no stored seed,
and puts the after text in each slot half the time across three rounds. The slot
scores are mapped back to before and after once the reply arrives.

### Two calibrations

```
node tests/judge.js <run-dir> --control --rounds 1
```

The control judges each before text against a copy of itself. Both texts pass and
fail the same checks, so any gap is error. It is a sanity check on the instrument
and no more: a judge given two identical texts can answer by copying one column
into the other, so a zero gap here does not show that position leaves a real
comparison alone.

The position split does show that, and every ordinary judging pass prints it at
no extra cost. The slot assignment flips between rounds, so the same after text
is marked from slot A in one round and slot B in another; `judge.js` keeps each
marking with its slot and reports what each text scored from each position.
Randomised slots cancel position bias out of the reported totals rather than
removing it, so the size of it is printed beside them and stored in the judged
record as `positionSplit`.

### Where the judged records go

One file per model and mode, so two judgements of one directory cannot overwrite
each other or be mistaken for one result:
`judge[.control].<per-pair|batch>.<model>.json`.

## Limits

1. The detectors are taken from the skills' own rules, so this is a measurement
   against the skills' own definition of failure.
2. The reference run is one model on one date, both recorded in `meta.json`.
3. The test measures a rewrite pass over fixed text. It does not measure prose
   written with the skill already loaded, which is how `conversation-prose` is
   normally used.
4. Twelve prompts is enough for a direction and too few for a confidence
   interval.
5. `published-prose` is not covered. That skill reads a voice profile written
   at install time, so a shared run would need either one profile that does not
   generalise, or a placeholder profile that measures only part of the skill.
6. The judge is not calibrated against a person. Blinding, the control, and the
   position split show that the judge agrees with itself and does not read
   position. None of them show that it agrees with a reader marking the same
   checks by hand.

## Running the tests of the harness itself

```
node --test "tests/**/*.test.js"
```

The quotes are required, because Node expands the pattern itself rather than
the shell. A directory argument in place of the pattern is not a substitute: it
is read as a module path and fails with "Cannot find module".

Fixtures in `fixtures/` pair a file of known violations with the expected count
for each detector. Every fixture also contains at least one near-miss the
detector must not count.
