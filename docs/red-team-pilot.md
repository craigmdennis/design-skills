# Red-team runs: generation mode

Two runs on 2026-08-17: a pilot on the three pinned prompts, then a full run on
all nine conversation-prose prompts with majority-vote verification. The full
run is documented at the end of this file.

# Red-team pilot: generation mode, pinned prompts

A pilot run on 2026-08-17 measured what the rewrite harness does not: prose
generated with `conversation-prose` already loaded. The three pinned corpus
prompts (07, 08, 09) were used, because each one records a real failure from a
session transcript.

## Method

One loop per prompt, the three loops concurrent, with a cap of ten rounds:

1. A writer agent reads the full skill and the corpus prompt, then writes the
   reply as a fresh answer. The pinning preamble in the prompt is excluded.
2. A red-team agent runs the eight exact detectors over the draft by script,
   then applies the sixteen procedural checks to every sentence. A finding
   requires a verbatim quote and a check number; anything unquoted is
   discarded.
3. A verifier agent attempts to refute each finding against the named check's
   own procedure. Findings that survive are confirmed.
4. The writer revises against the confirmed findings and the exact hits, and
   the loop repeats.

A loop exits when a round produces zero exact hits and zero confirmed
findings.

## Results

Model: fable 5, extra-high effort. 16 agents, ~712k subagent tokens, 16
minutes wall clock.

| Prompt | Rounds | Round-by-round |
|---|---|---|
| 07 | 1 | First draft passed: zero exact, zero claims |
| 08 | 3 | R1: 2 exact hits (two-word verb, self-evaluation), 2 claims refuted. R2: 2 claims confirmed (check 12 clipping "register", check 16 referent "the voice skill"). R3: 1 claim refuted, exit |
| 09 | 2 | R1: 1 claim confirmed (check 16 referent "the phrase"). R2: zero, exit |

Across the pilot the red team claimed six procedural findings and the verifier
confirmed three. The exit condition is therefore "zero findings a verifier
confirms", and the count of raw claims does not reach zero.

### Final texts

Prompt 07:

> The byte-hash check found a bug in the reader. The check found no corruption
> in the legacy corpus. The reader resolved images by directory listing. The
> frontmatter declares each image by name. One directory contains four images,
> and the reader imported the wrong image from that directory. The reader is
> fixed and 62 tests pass.

Prompt 08:

> "Figure" is short for "figure of speech". I have used "figure" across this
> session without defining it, and it appears repeatedly in the two skill files
> I am editing.
>
> "Figure" names five things, and ASD-STE100 bans all five:
>
> - metaphor, such as "the seam between two runtimes"
> - idiom
> - figurative phrasal verb — the class you just found
> - personification, such as "the parser is happy"
> - dead metaphor, such as "churn", "lever", or "surface" as a verb
>
> "Figure" also has an academic tone of voice, which the `my-voice` skill bans
> when the topic is writing. "Metaphors and idioms" would replace "figure"
> throughout both skill files.

Prompt 09:

> The section came from research on learning styles. The research is sound:
> Pashler, McDaniel, Rohrer and Bjork 2008 is real, and the meshing hypothesis
> has failed its own test repeatedly. The section contained no source and no
> confidence level. The top-risk ranking and the heading came from me. I wrote
> the section without checking whether the criticism applied to what you had
> actually said.
>
> Your transcript shows four things:
>
> 1. You hedged "learning styles" each time you used it.
> 2. Every example you gave was about accessibility and the two conditions you
>    have.
> 3. You proposed the idea as research to run.
> 4. You had already said a pedagogy specialist would be the better person to
>    develop the idea.
>
> Your transcript supports the rest of the evaluation.

## Limits

1. Verifier verdicts are unstable across instances. The round-1 verifier for
   prompt 08 refuted the "academic register" finding; the round-2 verifier
   confirmed the identical quote. The disagreement deferred the fix by one
   round. A majority vote over three verifiers per finding would stabilise the
   verdict at one to two extra calls per finding.
2. The confirmed failure classes in the pilot were checks 12 and 16, a banned
   clipping and ambiguous referents. The failures recorded in live long
   sessions are checks 1, 2, and 8: animacy, metaphor, and signposting. A
   fresh writer that has just read the skill avoids the classes a long session
   produces, so the pilot does not reproduce the long-session state the pinned
   before texts came from.
3. Three prompts give a direction. Scaling to all nine conversation-prose
   prompts at the pilot's rate is roughly 50 agents and 2M tokens.

# Full run: nine prompts, majority-vote verification

The full run repeats the pilot's loop over all nine conversation-prose prompts
with two changes. Three verifiers judge each round's findings independently,
and a finding is confirmed when at least two of the three confirm it. The
red-team prompt names the classes earlier measurement found surviving: long
sentences, noun clusters, fronted clauses, banned-list clippings, ambiguous
referents, animacy, figurative wording, and signposting, with framing
sentences checked separately.

Model: fable 5, extra-high effort. 52 agents, ~2.3M subagent tokens, 25
minutes wall clock.

## Results

| Prompt | Rounds | Confirmed findings on the way |
|---|---|---|
| 01 | 1 | none |
| 02 | 1 | none |
| 03 | 1 | none |
| 04 | 1 | none |
| 05 | 1 | none |
| 06 | 2 | check 16 (referent), check 9 (repeated meaning), plus 2 long sentences |
| 07 | 1 | none |
| 08 | 4 | check 2 ("It covers five things"), check 16 twice, plus 2 exact hits in round 1 |
| 09 | 2 | none confirmed; 1 long sentence in round 1 |

All nine reached zero exact hits and zero confirmed findings. Confirmed
findings by check across the run: check 16 three times, check 2 once, check 9
once.

## What the run shows

1. Six of nine first drafts passed every detector and every check on the first
   round. A writer that has just read the skill produces mostly conforming
   prose, and the failures it does produce cluster in check 16: a referent
   with two readings, introduced when the writer compresses.
2. Majority voting removed the verdict instability the pilot recorded. Rounds
   with weak claims (08 round 1, 09 rounds 1 and 2) confirmed nothing, and
   every confirmed finding carried two or three votes of three.
3. Prompt 08 stays the hardest in both runs: four rounds against a pilot's
   three. Its subject is figurative language, so its reply must mention
   figurative phrases, and the red team keeps reading the mentions as uses.
4. The run leaves the long-session condition unmeasured. Every writer here had
   just read the skill; the live failures in checks 1, 2, and 8 came from a
   session hours past that point.

# Skill-training run: the loop that edits the skill

The third run inverted the feedback target. Twelve prompts covering genres the
corpus lacks (feedback to an author, an incident review, a tripled estimate, a
smooth migration, teaching a Bloom filter, a shipped bug, a contested decision,
declining an unsafe request, pushing back on a wrong premise, a security
review, a half-done migration, justifying a past choice) were answered fresh
each round under the on-disk skill. Drafts were never repaired. After each
round, one editor agent amended `SKILL.md` and `checks.md` against every
confirmed finding, and the next round's writers read the amended files.

Model: fable 5, extra-high effort. 281 agents, ~10.1M subagent tokens, 74
minutes, five rounds.

## Results

| Round | Confirmed | Answers with exact hits | Scenarios affected | Editor edits |
|---|---:|---:|---:|---:|
| 1 | 6 | 2 | 5 of 12 | 7 |
| 2 | 8 | 1 | 5 | 8 |
| 3 | 25 | 0 | 10 | 6 |
| 4 | 25 | 0 | 10 | 12 |
| 5 | 22 | 0 | 12 | 19 |

The run did not converge and reached the round cap.

## What the run shows

1. The mechanical tier converged and stayed converged. Answers carrying exact
   detector hits went 2, 1, 0, 0, 0. Three edits produced that result: a
   sentence-length procedure at the top of the checks, the same procedure in
   `checks.md`, and a rewrite of the paragraph that had told writers a long
   coordinated sentence was acceptable while the detector counted it.
2. The judgement tier diverged. Confirmed findings rose from 6 to 22, and the
   scenarios affected rose from 5 to all 12.
3. The cause is structural. The writer and the red team read the same file, so
   every pattern an editor adds to prevent a failure also gives the next red
   team a sharper instrument. Round 4 confirmed ten check-2 findings against
   `shipped`, `happy path`, `passed`, `against`, and `test coverage`. Those
   words were in round 1's prose, and no text named them.
4. The count therefore measures the checklist's resolution, not the prose.
5. The cost fell on the injected file. `SKILL.md` grew from 622 lines and 5,145
   words to 862 and 7,590. `checks.md` grew from 544 words to 1,854, with
   single lines of 2,770 characters, and it is injected on every turn.
6. The last editor pass made 19 edits after round 5's findings, and no round
   tested them.

## What was kept

The three edits behind the mechanical result, and nothing else. The full
round-5 files are preserved unmodified at `docs/trained-skill-round5-SKILL.md`
and `docs/trained-skill-round5-checks.md` for any later pass that wants to
recover a named pattern by hand.
