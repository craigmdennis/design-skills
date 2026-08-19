# How the writing skills are measured

Four methods, each answering a different question. Every run has its own file
under `docs/runs/`, named for its date and method. A file never changes after
it is written, and a later run adds a file.

## The methods

**Rewrite of fixed text.** A fresh Claude instance answers a corpus prompt with
no skill loaded, then rewrites its own answer with the skill and a fixed
instruction. Both sides are scored by string-match detectors and by a blinded
model judge. This measures whether the skill removes the failures it names.
`node tests/all.js <skill>` runs it.

**Red team, generation mode.** A writer with the skill loaded answers a prompt,
a red team applies the checks to the answer, verifiers vote on each finding,
and the writer revises until a round confirms nothing. This measures how many
rounds prose needs to reach zero, and which checks it fails on the way.

**Skill training.** The same loop, with one change: the writer's draft is never
repaired, and an editor amends the skill after each round. This measures
whether editing the skill changes what the next writer produces. The run of
2026-08-17 diverged and its result is negative.

**A/B against a frozen judge.** Several arms answer the same prompts, some with
the committed skill and some with a candidate edit, and every arm is judged
against the committed rubric read from git. This measures whether one candidate
edit lowers the finding count by more than the gap between two identical arms.
`node tests/skill-ab.js` runs it.

## Current run for each method

| Method | Current run | Headline |
|---|---|---|
| Rewrite | [2026-08-17, nine pairs](runs/2026-08-17-rewrite-nine-pair.md) | 15.0 to 7.2 violations per 1,000 words, −52%; judge 59–63% to 96–98% |
| Red team | [2026-08-17, nine prompts](runs/2026-08-17-redteam-nine-prompt.md) | All nine reached zero confirmed findings within four rounds |
| Skill training | [2026-08-17, twelve prompts](runs/2026-08-17-skill-training.md) | Diverged: 6 confirmed findings to 22 over five rounds |
| A/B | [2026-08-19, baseline](runs/2026-08-19-ab-baseline.md) | Two identical arms scored 11 each; noise floor 0 |

Superseded runs stay in `docs/runs/` and keep their figures.
[The pilot of 2026-08-17](runs/2026-08-17-redteam-pilot.md) preceded the
nine-prompt red team on three prompts.

## What none of these measure

1. **A long session.** Every writer in every run had just read the skill. The
   failures recorded in real sessions appear after hours of accumulated
   context, and no method reproduces that state.
2. **`published-prose`.** That skill reads a voice profile written at install
   time, so a shared corpus would measure either a profile that does not
   generalise or one part of the skill.
3. **Whether the writing is better.** Every detector and every judge scores the
   skills against their own definition of failure.
