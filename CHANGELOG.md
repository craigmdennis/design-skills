# Changelog

One entry per user-visible change, in the same commit as the version bump.
Versions follow semver against the skill's *contract* — its triggers, inputs,
outputs, and guarantees. Patch = wording, minor = new capability, major = the
contract changes.

## 2026-07-28

### strengthen-case-study 2.0.0 — interview, don't rewrite

Major, because three guarantees changed.

**No placeholder output.** Previously a fact that couldn't be verified became a
greppable `{{TODO}}` or `{{NEEDS IMAGE}}` marker in your draft. Now every gap is
a question asked in the interview and answered before the edit happens. If a
question goes unanswered, the original sentence stays or the claim is cut — and
you're told which. Nothing with braces in it reaches your prose.

**It walks you through what it's doing.** A new **Walk them through it**
section, plus framing built into each step that produces something you have to
react to. Before anything lands you get what it is, why it's useful and what's
wanted back — and in plain words, because the skill's own vocabulary
("structure map", "ownership audit", "the probe rubric") is for the agent, not
for you. It also orients you once at the start: what the run looks like, that
the questions are the bulk of it, that you can skip or stop at any point, and
that nothing gets published. Found by demoing it: it fetched the case study and
went straight into showing a structure map with no explanation of what that was
or what to do with it.

**Content only — the format is never the subject.** All references to
frontmatter, MDX, components and markup are gone. The skill works on what the
piece says: what's claimed, what's missing, what order it comes in, whose work
it describes. It leaves formatting as it found it, follows the patterns already
on the page when it adds a sentence, and doesn't discuss, ask about, or raise as
a limitation how the piece is stored or built. Found by demoing it: given a URL
it explained at length which parts of the underlying source it couldn't see,
which is a conversation about tooling, not about the writing.

**Prefers Markdown over rendered HTML.** Given a URL, it now looks for a
Markdown version of the page first — appending `.md`, checking `/llms.txt`,
asking via `Accept: text/markdown`, or rewriting a known host — validates the
response isn't a soft 404, and asks whether to use it as the source rather than
switching on its own. Rendered HTML flattens the section structure, image
conventions and formatting the later steps read and are meant to match, and a
corrected draft in your own markup pastes straight back.

**One question at a time, guaranteed.** Exactly one question per message, then
it waits. No lists, no "and also", no optional extras, and no preamble
announcing what's coming next. Batching looks efficient and isn't: people
answer the easy questions and skip the hard one, which is precisely where the
undersold ownership hides. The six recovery questions and the reader-questions
rubric are now explicitly a bank to draw from, not a script to send.

**The author has to be there.** The skill no longer runs unattended. Without you
available to answer, it produces the map, the gap list, the ownership audit and
a written question list, then stops rather than editing against assumptions.
That handoff is the only place a list of questions is permitted, and it exists
because there's no interview to have.

**The output is your words, not a rewrite.** The interview is now the point: it
captures how you actually talk about your work, and the edit places, trims and
corrects that rather than generating polished prose over the top. Adds a
cut-before-you-add trimming pass and a voice check ("if a paragraph sounds
better than anything else in the piece, that's a warning").

A new **Editing their answers** section draws the line precisely. Your answers
may be cut, reordered, restructured into the shape a section needs, and repaired
where a cut broke the grammar. They may not be reworded, upgraded, merged with
another answer, or added to. The test is traceability: every content word in the
finished sentence has to come from something you actually said — function words
are the editor's, everything else is yours. The six shapes an answer can be
restructured into (a collaboration, the role statement, an outcome, a
constraint, a caption, a process section) are now listed in one place, so
"restructure" has a defined endpoint rather than being an open licence.

Also in this release: an **ownership audit** — six patterns for the ways
designers undersell themselves (a role stated as a job title, deliverable-only
sentences, vague collaboration, agentless constructions, stage-name process
sections, "we" on decisions the author made) plus six recovery questions and a
read-back test. And the skill is now **input-agnostic**: it works on the content
of a case study whether that arrives as a file, a URL, a doc, or pasted text,
and assumes no frontmatter, no Markdown, no repo, and no build step.

## 2026-07-08

### strengthen-case-study 1.0.0 — new plugin

Strengthen an existing portfolio case study through an evidence-first
interview: real proof, clear arcs, team and craft evidence, and zero
fabricated facts. Ported from a personal skill and generalised — works on any
case study format (Markdown, MDX, docs, pasted drafts), verifies claims
against the author's own sources, and never publishes. The reader-questions
rubric is adapted from Brian Lovin's
["How to give a great product design portfolio presentation"](https://brianlovin.com/writing/how-to-give-a-great-product-design-portfolio-presentation-G24VB2c).

## Earlier

- **field-notes 0.1.0** — live decision capture: a skill plus Claude Code
  hooks that log the why behind your decisions for a future writeup. 0.x:
  hook behaviour is still settling.
- **design-goal-setting 1.0.0** — interview-driven goal-setting and
  performance-review prep.
- **design-impact-report 1.0.0** — turn one initiative you owned into a
  short, shareable impact report.
