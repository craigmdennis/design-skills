# Design skills

Installable Claude Code skills from [Visible by Design](https://visiblebydesign.craigmdennis.com),
a field guide for designers turning invisible work into visible impact.

- **design-goal-setting** — interview-driven goal-setting and performance-review prep.
  Maps your evidence to a behavioural bar and picks the moves that close the gaps.
- **design-impact-report** — turns one initiative you owned into a short, shareable
  impact report.
- **[field-notes](plugins/field-notes/)** — keeps a live decision log on a project: the *why*
  behind your choices, captured while it's fresh, as raw material for a future blog post,
  case study, or retro.

## Install

In Claude Code:

```
/plugin marketplace add craigmdennis/design-skills
/plugin install design-goal-setting@design-skills
/plugin install design-impact-report@design-skills
/plugin install field-notes@design-skills
```

Then run them by asking Claude to "set my goals", "write up my impact", or "keep field
notes on this project".

## Two ways to use field-notes

**Ad-hoc — just the skill.** Install skills on their own with the [skills CLI](https://skills.sh)
and invoke them when you want them, in Claude Code or any agent that supports skills:

```
npx skills add craigmdennis/design-skills
```

Nothing runs in the background; you're in charge of when it applies.

**Automatic — the full plugin (Claude Code).** Install through the marketplace (above) and
field-notes' hooks also run on Claude Code events — offering tracking on new projects,
logging your prompts, and nudging for rationale once a session — so capture happens
without you thinking about it.

Same skill either way; the plugin adds the automation around it. Start ad-hoc, upgrade to
automatic later — they key off the same files, so nothing is lost switching.

## What's inside

Each skill interviews you one question at a time, then fills a bundled template — or, for
field-notes, sets up a gitignored `.field-notes/` decision log the agent maintains every
session. Nothing leaves your machine.

Written by [Craig Dennis](https://craigmdennis.com).
