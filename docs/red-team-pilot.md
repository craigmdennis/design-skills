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
