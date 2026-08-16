# Changelog

One entry per user-visible change, in the same commit as the version bump.
Versions follow semver against the skill's *contract* — its triggers, inputs,
outputs, and guarantees. Patch = wording, minor = new capability, major = the
contract changes.

## 2026-08-16

### The three prose skills become a plugin, and `prompts/` is removed

`plugins/prose/` holds three skills, renamed to drop the `-prose` suffix the
plugin name now carries: `conversation`, `documentation`, and `published`,
invoked as `prose:conversation` and so on. Install with
`claude plugin install prose@design-skills`. The three files under `prompts/`
are deleted, and with them the paste route, the hand-edit of
`~/.claude/settings.json`, and the routing lines in `~/.claude/CLAUDE.md`.

Two hooks replace the settings edit. `SessionStart` injects
`conversation/SKILL.md`, about 6,700 tokens once per session.
`UserPromptSubmit` injects `conversation/checks.md`, about 650 tokens per turn.
Both prefer a copy at `~/.claude/skills/<skill>/` over the plugin's own, so an
edited copy still takes priority and the same text is never injected twice.

`published` no longer depends on an interview at install time, which a plugin
install cannot run. Its first instruction reads
`~/.claude/skills/published/voice-profile.md`. Where no profile contains the
line `status: complete`, the skill offers two paths: the twelve-question
interview, now in `interview.md` beside the skill and read only on that branch,
or writing without a profile and asking for each preference as it applies. The
profile is written outside the plugin directory, so an update does not replace
it.

The harness resolves a skill in two places, in the same order the hook script
uses: an installed copy at `~/.claude/skills/<skill>/` first, the plugin's own
second. A clone with nothing installed now measures the shipped skill instead
of refusing to run, and `meta.json` records which of the two produced each
figure. The check list is compared against
`plugins/prose/skills/<skill>/checks.md`, and a figure measured against a
different list still fails a test and is still named in the report.

Unchanged: the four other plugins, the corpus, the baseline, and the published
figures, because the check lists are the same lists those figures were measured
against. The two committed run directories under `tests/runs/` keep the
pre-rename directory names, being dated records of what was measured.
`published` still has no `checks.md` and no per-turn injection; the two hooks
inject `conversation` only.

## 2026-08-15

### A measured before and after, regenerable by anyone

`tests/` holds a harness that answers thirteen fixed prompts twice, once with no
skill loaded and once with the skill applied as a rewrite pass, and scores both.
`node tests/all.js` runs the corpus, the score, the judge, and the report against
one directory. `--plan` prints the call count and a cost estimate taken from what
earlier runs recorded.

Two scores. Eighteen detectors counted by script, of which thirteen are exact and
produce the headline figure and five are approximate and are printed apart. A
second score is marked by a Claude instance against the skill's own checks, three
rounds, reported as a range.

The measured result: `conversation-prose` 13.9 to 5.4 violations per 1,000 words,
`documentation-prose` 24.6 to 3.9. Checks passed rose from 61.5-65.6% to 99.0%
and from 69.8-71.4% to 95.2-96.8%.

The judge is blinded. The two texts arrive as TEXT A and TEXT B, and nothing in
the prompt says which one a skill produced. Labelling them raised the measured
improvement from 32-36 points to 38. Which slot the after text takes flips
between rounds, so the same text is marked from both positions and the gap is
reported; it measured 1.0 point of 96. A control judges each before text against
a copy of itself.

The before texts are committed under `tests/baseline/`, with a hash of every
corpus prompt, so the figures reproduce from fixed inputs and anyone can drop
their own prose in and measure it. The reference run behind the published figures
is committed too.

### documentation-prose — a compact checks file

The prompt now installs two files: the skill body and a one-page `checks.md`
carrying eighteen numbered checks, for injection on every turn through the
`UserPromptSubmit` hook. `conversation-prose` already worked this way. Checks 16
to 18 apply to change documents only, and the file states that any other document
passes all three, so the denominator stays fixed.

## 2026-08-14

### conversation-prose — four STE rules added, two declined, one claim corrected

A fifteenth check: noun clusters take three words at most. A stack of four or
more marks none of the relations between the words, so the reader has to guess
them. It is the rule an agent breaks most often in this genre and it was absent.

Three more rules of the standard, in the register section. Rule 8.1 bans the
semicolon outright and permits every other mark, including the em dash. Words
are not dropped to shorten a sentence: the subject, the verb, and the article
stay. A sequence of three or more steps takes a vertical list, which check 13
now allows for.

Two rules are declined, with the reason recorded. The present perfect is
permitted here, because "the job has completed" and "the job completed" are
different statements and a reply reports status constantly. The six-sentence
paragraph cap is a rule for a manual.

Two corrections. The standard is now named by edition (Issue 9, January 2025:
53 rules in 9 sections). The em-dash ban belongs to `published-prose` as a voice
preference, and the skill says so, because the standard permits the mark.

Every rule is now marked as structural or lexical. Structural rules describe the
shape of a sentence and are enforceable from their description. Lexical rules
are defined by the licensed dictionary, which is absent, so they are a direction
of travel and compliance is never claimed.

A closing section records that this applies a subset of the rules, implements
nothing, carries no endorsement from ASD or STEMG, and is not for regulated
technical publications. Two limits are added to the meta-rule: a draft that
passes is sent unchanged, and shortening stops at one possible reading.

### published-prose — STE demoted from governing standard to three borrowed rules

The skill claimed ASD-STE100 as its governing standard, with the standard taking
priority in any disagreement. It then scoped away the sentence-length ceiling and
the subject-first rule, contradicted Rule 8.1 by requiring semicolons, and used
none of the rest. The standard is written for text that must not be misread and
excludes writing where voice and persuasion are the point, so the claim was
removed.

Three rules are borrowed and named as borrowed: one word for one meaning, no
figurative language, and noun clusters of three words at most. Everything that
existed only to reconcile the rest of the file with the standard is gone,
including the scoped-exception apparatus and the divergence notes. Instructional
passages inside a published piece still take the standard's sentence rules,
which is now stated once instead of three times.

The em dash and the semicolon are recorded as voice, because the standard
permits the first and bans the second, and this genre does the reverse.

## 2026-08-12

### prompts — three writing skills, installed by copy and paste

A new top-level `prompts/` directory, alongside `plugins/`. Each file holds a
short description and one fenced block. Pasting that block into a Claude Code
session writes a writing skill into `~/.claude/skills/`, prints the path, and
asks before touching anything else.

Three genres, three skills, because each one makes the other two worse when
applied to the wrong text. `conversation-prose` governs an agent's replies under
ASD-STE100 and minimalism. `documentation-prose` governs skill files, READMEs,
specs, and comments under third-person impersonal. `published-prose` governs
prose published under an author's own name.

`published-prose` is split in two. The skill carries rules about failures in
writing, which are shareable. An interview of about twelve questions writes
`voice-profile.md` next to it, holding spelling, punctuation, person, number
policy, and banned words, which are not.

`conversation-prose` states its rules as fourteen procedures instead of
categories with example words. An example list is read as the rule and searched
for, so anything absent from it passes; a procedure tests the sentence. It also
writes `checks.md` for injection on every turn, and offers to configure the
`UserPromptSubmit` hook that does the injecting.

These install by paste, so an installed copy has no link back to this
repository and no update reaches it. That is deliberate. The copy is the
reader's to edit.

## 2026-08-08

### field-notes 0.3.0 — nothing offers itself unprompted

Removed the `detect-new-project` SessionStart hook. It fired in any git repo
with two commits or fewer and injected a directive telling Claude to offer
field-notes tracking. Starting a new project is not consent to be pitched a
feature, and a plugin that speaks first in repos it was never invited into is
the wrong default however cheap the check is.

Tracking now only ever begins because someone asked for it — say "keep field
notes on this project", or run `/field-notes:track-project`. The three
remaining hooks are unchanged and still no-op in any project without
`.field-notes/notes.md`.

Gone with it: `FIELD_NOTES_AUTO_TRACK`, `FIELD_NOTES_NEW_PROJECT_COMMITS`, and
the `.field-notes-ignore` opt-out marker, which existed only to silence the
detector. Existing `.field-notes-ignore` files are now inert and can be
deleted. `FIELD_NOTES_CAPTURE_FEEDBACK` and `FIELD_NOTES_RATIONALE_TURNS` are
unaffected.

## 2026-07-28

### all plugins — renamed so `plugin:skill` reads properly

Major for every plugin, because how you invoke them changed. Each plugin was
named after its single skill, so every invocation stuttered:
`field-notes:field-notes`, `strengthen-case-study:strengthen-case-study`. A
plugin is now named for its domain and a skill for the action it performs.

| Was | Now |
|-----|-----|
| `strengthen-case-study:strengthen-case-study` | `case-study:strengthen` |
| `design-goal-setting:design-goal-setting` | `design-goals:set-goals` |
| `design-impact-report:design-impact-report` | `impact-report:write-report` |
| `field-notes:field-notes` | `field-notes:track-project` |

Skill names stayed domain-bearing rather than becoming bare verbs (`set-goals`,
not `set`) because `npx skills add` installs them into other agents with no
plugin prefix, where a skill called `set` says nothing and risks colliding.

**Install specs changed.** Three of the four are new — `case-study@design-skills`,
`design-goals@design-skills`, `impact-report@design-skills`. Uninstall the old
ones and install the new. `field-notes@design-skills` is unchanged, and so is
`npx field-notes`. Nothing about behaviour changed, and existing `.field-notes/`
folders keep working: `.field-notes/notes.md` is still what marks a project as
tracked.

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
