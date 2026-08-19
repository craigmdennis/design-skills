# Red team over nine prompts, majority-vote verification

**Method:** red team, generation mode. **Date:** 2026-08-17. **Model:** fable 5, extra-high effort. **Size:** 52 agents, ~2.3M tokens.

This file records one run and does not change. A later run adds a file.

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
