# Design skills

Installable agent skills from Visible by Design, a framework for helping designers get
the recognition they deserve within organisations.

This repository contains two kinds of thing, and they install differently:

- **Plugins**, in `plugins/`. Installed with a package manager, and updated in place.
- **Prompts**, in `prompts/`. Copied and pasted into an agent session, which then writes
  the skill into the local environment. No install step, and no connection back to this
  repository.

## Plugins

- **[case-study](plugins/case-study/)** (`/case-study:strengthen`) — strengthens an existing
  portfolio case study by interviewing you about it one question at a time, then trimming
  and correcting your own words: real proof, clear arcs, an ownership audit for the parts
  you undersold, and zero fabricated facts. Every gap becomes a question instead of a
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

### Install: any agent, skills only

```
npx skills add craigmdennis/design-skills
```

The [skills CLI](https://skills.sh) finds every skill in this repo and installs the ones you
pick into Claude Code, Codex, Cursor, Amp, or any other agent it supports. Nothing runs in
the background. Invoke a skill when you want it, by asking your agent to "set my goals",
"write up my impact", "keep field notes on this project", or "strengthen my case study".

### Install: Claude Code plugins

```
/plugin marketplace add craigmdennis/design-skills
/plugin install case-study@design-skills
/plugin install design-goals@design-skills
/plugin install field-notes@design-skills
/plugin install impact-report@design-skills
```

For **case-study**, **design-goals**, and **impact-report** the two routes are equivalent.
Both install pure skills.

**field-notes** is the one where the plugin route adds something. It also registers capture
hooks that run on Claude Code events: logging your prompts, collecting insight callouts, and
asking once a session for the "why" behind a decision. Capture then happens without you
thinking about it. The hooks only run in a project you have asked to track, and do nothing
at all in one you have not. Installed as a skill only, field-notes still works; you invoke
it and the agent maintains the log, with none of the automatic capture. Start with the skill
and install the plugin later. Both routes use the same files, so nothing is lost by
switching. Details, including the privacy switches, are in the
[field-notes README](plugins/field-notes/).

## Prompts

Three writing skills, one per genre of writing. Each one governs a genre the other two make
worse, so they are separate skills and not settings on one skill.

| Genre | Prompt | Standard |
|---|---|---|
| Replies, explanations, status updates, summaries, plans, review | [conversation-prose](prompts/conversation-prose.md) | ASD-STE100 and minimalism |
| Skill files, READMEs, specs, plans, code comments, changelogs | [documentation-prose](prompts/documentation-prose.md) | Third-person impersonal |
| Prose published under an author's own name | [published-prose](prompts/published-prose.md) | The author's own voice, interviewed at install |

### How to use one

Open the prompt file, copy everything inside the fenced block, and paste it into a Claude
Code session. The agent writes the skill to `~/.claude/skills/<name>/SKILL.md`, prints the
full path, and asks whether to add a routing line to `~/.claude/CLAUDE.md`.

Every edit outside `~/.claude/skills/` is refused by default. Answer no and the agent prints
what it would have added, so you can apply it by hand later.

Two prompts do more than write one file:

- **published-prose** asks about twelve questions before it writes anything permanent:
  spelling, punctuation, when you write "I" and when "we", which numbers may be published
  on which surface, and which words you have banned. The answers go to
  `~/.claude/skills/published-prose/voice-profile.md`, which the skill reads before it
  writes or edits. Personal preference is in that file. The skill itself carries only rules
  about failures in writing, which is what makes it shareable.
- **conversation-prose** also writes `checks.md`, a one-page version of the fourteen checks
  the skill opens with, and offers to install a `UserPromptSubmit` hook that prints that
  file into context before every reply. The prompt gives the trade-offs and installs the
  hook only if you agree. Without it the skill still applies through the routing line, but
  it loads at most once per session and its influence falls as the conversation grows. The
  skill also ships one worked entry in its banned-words section, a ban on every figurative
  use of "hold", to show what an entry needs. Delete it if it is not a ban you want, and add
  your own.

### Why a prompt instead of a plugin

A pasted prompt records nothing about where it came from. There is no repository URL, no
version, and no manifest, so no command can check for a newer copy and no update reaches
the installed file. That is the point: the skill becomes yours to edit, and nothing
overwrites the edits.

The cost is that a later correction in this repository will not reach an installed copy.
Pasting the block a second time installs the current version and overwrites the previous
one, along with any edits. Copy `voice-profile.md` and your banned-words list somewhere
safe before doing that.

## What's inside

Each skill in `plugins/` interviews you one question at a time, then fills a bundled
template. case-study edits your existing draft instead, and field-notes sets up a gitignored
`.field-notes/` decision log the agent maintains every session. Each prompt in `prompts/`
writes one skill file into your own environment. Nothing leaves your machine.

Written by [Craig Dennis](https://craigmdennis.com).
