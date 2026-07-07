# Design skills

Installable agent skills from [Visible by Design](https://visiblebydesign.craigmdennis.com),
a field guide for designers turning invisible work into visible impact.

- **[design-goal-setting](plugins/design-goal-setting/)** — interview-driven goal-setting and
  performance-review prep. Maps your evidence to a behavioural bar and picks the moves
  that close the gaps.
- **[design-impact-report](plugins/design-impact-report/)** — turns one initiative you owned
  into a short, shareable impact report.
- **[field-notes](plugins/field-notes/)** — keeps a live decision log on a project: the *why*
  behind your choices, captured while it's fresh, as raw material for a future blog post,
  case study, or retro.

## Install

There are two routes. Both install the same skills; they differ in where they work and
whether anything runs automatically.

### Any agent — skills only

```
npx skills add craigmdennis/design-skills
```

The [skills CLI](https://skills.sh) finds every skill in this repo and installs the ones you
pick into Claude Code, Codex, Cursor, Amp, or any other agent it supports. Nothing runs in
the background — you invoke a skill when you want it, by asking your agent to "set my
goals", "write up my impact", or "keep field notes on this project".

### Claude Code — plugins

```
/plugin marketplace add craigmdennis/design-skills
/plugin install design-goal-setting@design-skills
/plugin install design-impact-report@design-skills
/plugin install field-notes@design-skills
```

For **design-goal-setting** and **design-impact-report** the two routes are equivalent —
they're pure skills either way.

**field-notes** is the one where the plugin route adds something: it also registers capture
hooks that run on Claude Code events — offering tracking on new projects, logging your
prompts, and nudging for the "why" behind decisions once a session — so capture happens
without you thinking about it. Installed skill-only, field-notes still works; you just
invoke it and the agent maintains the log, with none of the automatic capture. Start
skill-only, upgrade to the plugin later — they key off the same files, so nothing is lost
switching. Details (including the privacy switches) in the
[field-notes README](plugins/field-notes/).

## What's inside

Each skill interviews you one question at a time, then fills a bundled template — or, for
field-notes, sets up a gitignored `.field-notes/` decision log the agent maintains every
session. Nothing leaves your machine.

Written by [Craig Dennis](https://craigmdennis.com).
