# The three skills against Google's developer documentation style guide

Four pages of the guide were read on 2026-08-19: Highlights, Voice and tone,
Writing for a global audience, and Writing accessible documentation. This file
records where the skills agree with Google, where they diverge on purpose, and
what remains a candidate.

## Where the skills already agree

| Google | Skill |
|---|---|
| Use active voice, subject first | conversation-prose check 10, documentation-prose check 12 |
| Avoid figurative language and metaphor | conversation-prose checks 1, 2, 3 |
| Keep sentences under 26 words | The 25-word split procedure in both files |
| Use one term for one concept, always the same | conversation-prose check 9 |
| Define abbreviations on first use | The never-clip-a-term rule in check 12 |
| Numbered lists for sequences, bulleted for the rest | conversation-prose check 13 |
| Sentence case for headings | documentation-prose, "The standard" |
| Put conditions before instructions | conversation-prose check 17, documentation-prose check 19 |
| No "please" in an instruction | conversation-prose check 12, documentation-prose check 20 |
| Nothing about how hard the step is | The same two checks |
| Avoid repeated sentence openers | The same two checks |
| Limit stacked noun modifiers | conversation-prose check 15 |
| Place key information first in a paragraph | conversation-prose check 4 |
| Avoid semicolons where the meaning allows | ASD-STE100 rule 8.1, banned outright |

Two of these arrived from Google on 2026-08-17 and 2026-08-19 and are new to
the skills. The rest were already present, and Google is a second independent
source for them.

Both skills now name the guide as one of the standards they apply.
`conversation-prose` carries it under "The three standards", beside ASD-STE100
and minimalism. `documentation-prose` carries it under "The standard", beside
ISO/IEC Directives Part 2 and ASD-STE100. Each section lists the mechanics the
guide supplies, points at the checks that already enforce them, and records the
second-person divergence. No check was added or renumbered, so the
17-check and 20-check rubrics and the `checks.md` word budget are unchanged.

## Where the skills diverge on purpose

**Second person.** Google: "Use second person: you rather than we." Google
writes for a developer reading a product manual, where naming the reader is the
clearest available form. `documentation-prose` governs skill files, specs, and
plans, which are read by people who did not take part in the conversation that
produced them, and its check 6 counts `you` and `your` as violations. The
reader of this repository chose the impersonal register and that choice stands.
`conversation-prose` addresses the reader directly and matches Google there.

**Conversational and friendly.** Google's scale runs from "Dude! This API is
totally awesome!" through "This API lets you collect data about what your users
like" to "The API may enable the acquisition of information pertaining to user
preferences." The skills already sit at Google's middle mark. Their bans on
self-evaluation and signposting cut warmth that carries no information, and
they leave the plain declarative sentence Google recommends.

## Candidates, none yet measured

`checks.md` holds 683 words against a 700-word ceiling, and it is injected on
every turn, so each candidate below has to displace something or earn its
place through the A/B harness.

1. **Directional language.** Google bans *above*, *below*, and *right-hand
   side*, and gives *preceding*, *following*, and *earlier* instead. The
   skill-training run of 2026-08-17 confirmed the same failure independently as
   *the draft below*, which makes this the strongest candidate.
2. **Placement of *only*.** "Request only one token" passes; "Only request one
   token" fails. A misplaced *only* changes what a sentence limits.
3. **The optional *that* and *then*.** Google keeps both: "the rules that you
   previously defined", and "if the key is not found, then the default is
   returned". Both remove a second reading, which is check 16's purpose reached
   by another route.
4. **Phrasal verbs generally.** Google bans them beyond the figurative ones,
   exempting *set up*, *log in*, and *sign in*. Check 3 bans only the
   figurative ones, so adopting Google's line would widen the check.
5. **Positive form over negated form.** Google: "You can continue without a
   path" over "A missing path won't prevent you from continuing." Check 11
   covers a negated contrast between two options and does not cover a single
   negated statement.

## Not applicable

Alt text, colour contrast, heading hierarchy, tables, forms, keyboard
navigation, and link text govern rendered HTML documentation. The skills govern
prose in a terminal reply, a Markdown file, and a published post. The link-text
rule applies to `documentation-prose` wherever a README links out, and it is
not a prose check.
