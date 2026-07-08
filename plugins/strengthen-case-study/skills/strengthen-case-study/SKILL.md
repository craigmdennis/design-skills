---
name: strengthen-case-study
description: Use when an existing portfolio case study underperforms — it reads like a PM writeup, has vague or unproven claims, thin design-craft or team/collaboration evidence, two interleaved narratives, opens at the solution with no problem-discovery or constraints story, or never closes the loop on whether the problem was solved. Triggers on "strengthen my case study", "review my portfolio piece", "make this case study land", "punch up this writeup".
---

# Strengthen case study

Take an existing case study — a Markdown/MDX file, a doc, a portfolio page draft — and make
it land as a portfolio piece: visible design craft, real proof, clear structure, team and
collaboration evidence — **without inventing a single fact**. The strongest material is
almost never new prose you write; it's evidence the author gives you in an interview, plus
a re-section that pulls competing narratives apart.

You edit one case study per run, and you never write a fact the author hasn't confirmed.

## The Iron Rule: no fabrication

A case study's credibility is its specifics — metrics, team size, research method,
who-did-what, quotes. **Never write any of these from memory or inference.** Every factual
claim is either (a) confirmed by the author in the interview, (b) verified in a source the
author points you to (notes, analytics, decks, retros, a decision log), or (c) a greppable
placeholder the author fills. There is no fourth option.

- Unknown fact → **ask the author** and check any sources they've given you. Don't reach
  for a plausible number.
- Still unknown → leave `{{TODO: <specific question>}}` or
  `{{NEEDS IMAGE: <description>}}` inline (see Guardrails for safe formatting).
- "It's probably about X" is fabrication. So is upgrading a vague memory into a confident
  sentence.

## Interview the author — loop until complete

The author rarely has every fact in one pass. Treat it as an interview, not a form:

- Ask one round of questions at a time; reflect each answer back as a ledger
  ("captured: …") so the author can correct it.
- As they answer, **ask the next round** — keep going until the gaps are closed. Expect
  "I can't answer everything in one go; ask more as I answer."
- **Keep distinct events distinct.** Two people with the same title, two research studies,
  two prototypes — do not merge them to tidy the story. Merging two people puts one
  person's work on the other's résumé.
- **Capture as you go** to a notes file the author won't publish (e.g.
  `interview-notes-<case-study>.md`, gitignored if the portfolio is a repo), so nothing
  is lost and the next run can pick up
  where this one stopped. If the project uses the `field-notes` skill, its decision log is
  a ready-made source — check it before asking questions it already answers.
- Record an **anonymisation map** (real name → role descriptor); internal teammates' real
  names never reach the published page.

## What the reader asks (probe rubric)

A hiring manager reads a case study with the same questions they'd ask in a live portfolio
review (adapted from Brian Lovin's portfolio-presentation guidance — see Reference).
Probe each in the interview; anything the piece can't answer is a gap:

- **Context** — who the customers are, how the business makes money, how the org measures
  success, where the author sat within it.
- **Problem discovery** — a piece that opens "we wanted to improve X, here's what we made"
  has skipped the part that matters most: what was wrong, how the team *knew* (data,
  research, support noise), why this problem beat the other problems on the table, and what
  success was agreed to look like **before** work started.
- **Constraints & tradeoffs** — the concrete ones (one engineer and two weeks, bad data,
  missing design-system components, a new platform, regulation), one or two hard-tradeoff
  stories, and the meta-constraint of how the org builds: scrappy MVPs or big-bang releases,
  a research team or designer-run research, a design system or bespoke components.
- **Evolution & lessons** — evidence of exploring wide before converging; ideas that did
  not work and what customer feedback changed between iterations; what surprised the author
  or worked better than expected. The strongest sections teach the reader something.
- **Outcome closure** — did the work solve the problem the opening set up: yes or no, then
  explain, mapped back to that opening context. What the author would try next given
  another shot. Non-obvious outcomes count too: components upstreamed to the design system,
  something open-sourced, a designer mentored, external recognition, a post others learned
  from.
- **Contribution honesty** — exactly what was the author's vs the team's. Undeserved credit
  is easy to spot; where the contribution was small, say so, and credit teammates' work by
  role — giving praise well is itself a leadership signal.

## The run

### 1. Map before you touch
Read the case study end to end. Produce a structure map: current headings (titles-only
read), image placements, and **where each competing narrative lives** (e.g. "designing the
experience" vs "making it reliable", interleaved). Show the author this map before editing.

### 2. Probe — sources first, then the author
For every claim the piece makes or needs — body prose **and** any summary metadata that
ships elsewhere (frontmatter, card blurbs, an "impact" one-liner) — look for the source in
whatever material the author has shared, then interview for the gaps (loop above).
Structure the gap hunt with the probe rubric: every rubric area the piece can't answer
becomes interview questions.

**A claim appearing in several places ≠ verified.** A number can be repeated across drafts
and decks until it looks confirmed. Trust dated primary sources (the analytics export, the
research report) over summaries; when sources conflict, surface it as a `{{TODO}}`. Confirm
specific metrics with the author before they go live.

**If the author isn't available** (autonomous run): don't stop and don't guess. Do the map,
the verification, and the placeholders, and emit one consolidated question list in place of
the live interview.

### 3. Typos & grammar
Fix obvious slips without changing voice. Preserve the author's spelling conventions
(British vs American) and punctuation habits. List every change so the author can revert.

### 4. Restructure into clear arcs
Group the piece into its arcs and add a single **quiet** transition sentence at the seam.
**Often this is one block move** — most sections are already in arc order; find the lone
section sitting in the wrong arc and relocate it. Preserve all prose (reorder and
re-section, don't rewrite). Show a diff.

### 5. Key-outcome callout near the top
Add a short callout near the top using whatever callout the format supports (a registered
component if the site has one, a blockquote with a bold lead in plain Markdown). Lead with
the strongest **verified** outcome. **If no outcome metric is cleared, lead with the
strongest verified fact — a ship milestone, a real reaction quote — never a metric-shaped
placeholder dressed as a result.** The "lead with impact" instinct is exactly what tempts
you toward a fabricated number; resist it. If precise figures aren't cleared to publish,
soften to relative language (e.g. "multi 7-figure ARR") rather than adding NDA or
confidentiality disclaimers; leave the precise figure as a `{{TODO}}`.

The piece must also **close the loop at the end**: the closing section answers the problem
the opening set up — solved or not, yes or no, then the explanation — rather than trailing
off after the ship. "It didn't work" plus what the team did next is a stronger ending than
a vague success.

### 6. Image annotations
For the strongest design moments, give bare images a one-to-two-sentence caption naming
the **design decision and its tradeoff**, using the format's figure/caption convention
(an italic line under the image works in plain Markdown or a doc). Mark
every missing visual with `{{NEEDS IMAGE: <what it should show>}}` in context.

**Final artifacts show real product or lifelike data — no lorem ipsum.** The shipped UI
beats a mock; when the shipped thing can't be shown (private, shut down), a high-fidelity
prototype with realistic data is the substitute. Flag any placeholder-data screenshot the
piece leans on, and write `{{NEEDS IMAGE}}` requests specifying realistic data. For a
senior author the mocks are read against what shipped — designed ≈ shipped is itself
evidence they drove decisions.

### 7. Team / role + Research + Constraints, grounded
Add a **Team & my role** section and a **Research** callout, filled from the interview
(anonymised), `{{TODO}}` for anything unconfirmed. These two are where "PM writeup" becomes
"design leadership": who owned what, what was delegated vs hands-on, the research method and
sample. Where the interview surfaced constraints and hard tradeoffs (probe rubric), work
them into the body **early** — near the problem, not buried at the end; the obstacles are
what make the wins legible. Contribution honesty applies throughout: name what was the
author's, what was the team's, and credit teammates' work by role.

### 8. Voice, placeholders, build
New prose (transitions, captions, callouts) must read as the author, not as you: match
their sentence rhythm, vocabulary, and person ("I" for the author's calls, "we" for the
team). Confirm every placeholder is formatted safely for the format (see Guardrails). If
the project has a build or dev check, run it and leave it green (don't deploy).

### 9. Output & stop
Give the author: (1) a change log, (2) a placeholder index (`file:line`, or section +
quote for a pasted draft, for every `{{TODO}}`/`{{NEEDS IMAGE}}`), (3) prioritised
visual requests mapped to sections.
**Do not publish, push, or deploy.**

## Guardrails (non-negotiable)

- **No fabrication.** See the Iron Rule. Interview + the author's sources, else `{{TODO}}`.
- **Author's voice.** Every new sentence should be indistinguishable from the author's
  existing prose. When in doubt, quote their interview answer rather than paraphrasing.
- **Anonymise internal names on the published page.** Internal teammates → role descriptors
  ("an early head of product", "a designer on my team"); keep real names only in the
  unpublished notes. **Public attribution may stay** — the named author of a public
  changelog, talk, or blog post is already public and can be cited by name.
- **Format-safe placeholders.** In MDX, bare `{{ }}` parses as a JS expression and breaks
  the build — wrap placeholders in backticks: `` `{{TODO: ...}}` ``. In plain Markdown,
  bare `{{TODO: ...}}` is fine. Either way the marker must render visibly and stay
  greppable by `{{`.
- **Existing components only.** Callouts and figures must use components or formatting the
  site or format already supports. Never invent a component tag — it will render as raw
  text or break the build.
- **Preserve prose.** Reorder and re-section; don't rewrite the author's existing sentences
  beyond the listed typo fixes.
- **Never publish.** The edited draft is the deliverable; the author reviews, then decides
  what ships.

## Common mistakes

- **Adding plausible numbers.** The fastest way to wreck a portfolio piece. Unconfirmed → `{{TODO}}`.
- **Leaving the piece opening at the solution.** "We wanted to improve X, so I designed…"
  skips problem discovery — interview for how the team knew, why this problem, and what
  success was agreed to look like, and get that into the opening.
- **Unsafe placeholders in MDX.** Bare `{{ }}` breaks the build. Backtick-wrap them.
- **Rewriting instead of re-sectioning.** The arcs problem is structural; the prose is
  usually fine. Move blocks, add one transition.
- **Merging distinct people/events** to make the story tidy. Keep them apart; ask the author.
- **A callout for everything.** Outcome callout + research callout + the strongest image
  moments — not every paragraph.

## Inputs

- The case study — a file path, URL, or pasted draft. Ask for it if not given.
- Any sources the author can share: analytics, research reports, retros, decision logs
  (including a `field-notes` log if the project keeps one).
- The author (interview) for every gap the sources can't close.

## Related skills

- `field-notes` (this marketplace) — keeps the live decision log that makes future runs of
  this skill mostly verification instead of archaeology.
- `design-impact-report` (this marketplace) — produces the verified outcome evidence that
  step 5's callout wants to lead with.

## Credits

The "What the reader asks" probe rubric is adapted from Brian Lovin,
["How to give a great product design portfolio presentation"](https://brianlovin.com/writing/how-to-give-a-great-product-design-portfolio-presentation-G24VB2c).
The context / problem-discovery / constraints / evolution / outcome / contribution framing
is his; keep this credit if you copy or adapt the rubric.
