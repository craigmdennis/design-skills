# Design skills

Installable agent skills from Visible by Design, a framework I'm creating to help
designers get the recognition they deserve within organisations.

- **[case-study](plugins/case-study/)** (`/case-study:strengthen`) — strengthens an existing
  portfolio case study by interviewing you about it one question at a time, then trimming
  and correcting your own words: real proof, clear arcs, an ownership audit for the parts
  you undersold, and zero fabricated facts. Every gap becomes a question rather than a
  placeholder. Works on a file, a URL, or pasted text. Its reader-questions rubric is adapted
  from Brian Lovin's ["How to give a great product design portfolio presentation"](https://brianlovin.com/writing/how-to-give-a-great-product-design-portfolio-presentation-G24VB2c).
- **[design-goals](plugins/design-goals/)** (`/design-goals:set-goals`) — interview-driven
  goal-setting and performance-review prep. Maps your evidence to a behavioural bar and
  picks the moves that close the gaps.
- **[field-notes](plugins/field-notes/)** (`/field-notes:track-project`) — keeps a live
  decision log on a project: the *why* behind your choices, captured while it's fresh, as
  raw material for a future blog post, case study, or retro.
- **[impact-report](plugins/impact-report/)** (`/impact-report:write-report`) — turns one
  initiative you owned into a short, shareable impact report.

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
goals", "write up my impact", "keep field notes on this project", or "strengthen my case
study".

### Claude Code — plugins

```
/plugin marketplace add craigmdennis/design-skills
/plugin install case-study@design-skills
/plugin install design-goals@design-skills
/plugin install field-notes@design-skills
/plugin install impact-report@design-skills
```

For **case-study**, **design-goals**, and **impact-report** the two routes are equivalent —
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

Each skill interviews you one question at a time, then fills a bundled template — or edits
your existing draft, for case-study, or sets up a gitignored `.field-notes/` decision log
the agent maintains every session, for field-notes. Nothing leaves your machine.

Written by [Craig Dennis](https://craigmdennis.com).
