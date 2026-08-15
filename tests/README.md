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
that asks the instance to list everything present in its context. If the reply
names a skill, a hook, or an instruction file, the run stops instead of
producing a result that overstates what the skill did.

A run needs a credential in the environment, in `CLAUDE_CODE_OAUTH_TOKEN` or
`ANTHROPIC_API_KEY`. `claude setup-token` produces the first against a
subscription. Nothing is copied out of the real configuration directory: the
account login lives in the platform keychain, which no file copy carries, and
an isolated configuration directory cannot see it. A run with no credential
exits with a non-zero status before creating anything.

`node run.js <skill> --dry-run` makes no model call. It needs no credential and
runs no isolation probe. It walks the corpus, exercises the file handling, and
deletes the temporary configuration directory. It proves nothing about
isolation, which the live probe covers.

`node run.js --show-instruction` prints the rewrite instruction.

## How a run is scored

`node score.js <run-dir>` counts rule violations on both sides and reports them
per 1,000 words. Without that normalisation, a rewrite that only shortens the
text would score as a rewrite that corrects it.

Detectors come in two tiers. **Exact** detectors are string matches with no
judgement, and only these produce the reported total. **Approximate** detectors
need part-of-speech knowledge that a dependency-free script does not have, so
they are printed and excluded from the total.

The change between before and after is reported as a percentage. When the
before text carries violations and the after text carries none, the change is
-100%. When the before text carries no violations and the after text carries
some, the change is reported as `n/a`: reporting 0 there would hide a rewrite
that introduced violations into clean prose. When neither text carries any
violations, the change is reported as 0.

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
times and reported as a range, because the number moves between runs.

The judge never receives the deterministic scores. A judge shown the exact
detectors' totals agrees with those totals.

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
