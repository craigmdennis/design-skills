# Skill-training loop, twelve prompts, five rounds

**Method:** skill training, generation mode. **Date:** 2026-08-17. **Model:** fable 5, extra-high effort. **Size:** 281 agents, ~10.1M tokens.

This file records one run and does not change. A later run adds a file.

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
