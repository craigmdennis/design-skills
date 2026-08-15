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
worse, so they are separate skills and not settings on one skill. The background is in
["Fixing the AI writing problem"](https://craigmdennis.com/writing/fixing-the-ai-writing-problem/).

| Genre | Prompt | Standard |
|---|---|---|
| Replies, explanations, status updates, summaries, plans, review | [conversation-prose](prompts/conversation-prose.md) | ASD-STE100 (Issue 9) and minimalism |
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
- **conversation-prose** also writes `checks.md`, a one-page version of the sixteen checks
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

### On ASD-STE100

`conversation-prose` applies a subset of the ASD-STE100 writing rules (Issue 9, January
2025) and does not implement the standard. The standard's dictionary is licensed and is not
reproduced here, so nothing checks a word against the approved list. The rules that describe
sentence shape — voice, sentence length, noun clusters, punctuation, one idea per sentence —
are enforceable from their description. The rules that depend on the dictionary are a
direction of travel. STEMG maintains the standard, produces no AI tools, and endorses none.
None of this is endorsed by ASD or STEMG, and none of it is an authoring tool for regulated
technical publications.

The edition detail and the split between structural and lexical rules are adapted from the
[asd-ste100-skill](https://github.com/danyuchn/asd-ste100-skill) by Dustin Yuchen Teng, MIT
licensed. Request the standard itself from the
[official downloads page](https://www.asd-ste100.org/STE_downloads.html).

## Does any of this work?

Two of the three skills are measured. A fixed set of prompts is answered twice by a fresh
Claude instance, once with no skill loaded and once with the skill applied as a rewrite pass,
and both answers are scored. Anyone can regenerate the figures, and anyone can drop their own
prose in and measure that instead.

| skill | prompts | violations per 1,000 words, before | after | change | checks passed, before | after |
|---|---:|---:|---:|---:|---:|---:|
| conversation-prose | 6 | 13.9 | 5.4 | **−61%** | 61.5–65.6% | **99.0%** |
| documentation-prose | 7 | 24.6 | 3.9 | **−84%** | 69.8–71.4% | **95.2–96.8%** |

Claude Opus 5, 2026-08-15. The first three columns are counted by script and reproduce
exactly from the committed texts. The last two are marked by a second Claude instance across
three rounds, so they are given as a range. Full detail, per prompt and per check, is in
[the report](docs/prose-test-report.md).

### What the change looks like

`conversation-prose`, from a code review. The rewrite states the finding in the first
sentence, drops the semicolon, and stops giving a living verb to a piece of software:

> **Before** — Three things, one of which is urgent. […] `id` comes straight from the path and
> gets concatenated into the query. […] your caller happily treats it as the authenticated
> user, `admin` flag and all. […] This isn't a "harden it later" item; it's the whole function.

> **After** — The SQL injection is urgent. Two other defects follow it. […] The function takes
> `id` from the path and concatenates it into the query. […] The caller then uses that row as
> the authenticated user, including the `admin` flag. […] Fix this first. The fix replaces the
> whole function.

`documentation-prose`, from a deploy runbook. Who set a rule and when belongs in version
control, so the rule survives and the attribution goes:

> **Before** — **Friday freeze:** no deploy happens on a Friday after 15:00 UTC. Marcus Webb
> set this rule on 2026-01-09 following an incident.

> **After** — **Friday freeze:** no deploy happens on a Friday after 15:00 UTC.

### How the measurement is built

Two scores, because neither one is enough alone.

- **Counted by script.** Eighteen detectors, taken from the skills' own rules. Thirteen are
  exact and produce the headline: semicolons, sentences over 25 words, "rather than", first
  person, second person, dates recording a decision. Five are approximate and are printed
  separately, because they over-count and under-count equally on both sides of the comparison.
- **Marked by a model.** A second Claude instance receives the skill's checks and both texts,
  and marks each check pass or fail with the failing sentence quoted.

Four things keep the comparison honest.

1. **The before text sees no skill.** Corpus calls run against a throwaway configuration
   directory with `--bare`, no tools, no slash commands, and an empty working directory. An
   early version ran inside this repository with tools enabled, and one before text quoted a
   rule out of `prompts/documentation-prose.md`, which made it an after text. A canary probe
   asks the fresh instance what the skill says and requires the answer "NO SUCH SKILL".
2. **The judge is blinded.** The two texts arrive as TEXT A and TEXT B. Nothing tells the
   judge which one a skill produced. Labelling them BEGIN BEFORE and BEGIN AFTER moved the
   before score six to nine points and inflated the measured improvement from 32–36 to 38.
3. **Position is measured, not assumed.** Which slot the after text takes flips between
   rounds, so the same text is marked from both positions. The gap between those two figures
   came to 1.0 point of 96. A control that judges each before text against a copy of itself
   returned a gap of zero.
4. **The before texts are committed.** `tests/baseline/` holds them, and `meta.json` records
   the model, the date, and a hash of every corpus prompt, so a baseline generated against an
   edited prompt is refused instead of silently compared.

### Running it yourself

Node 22 or newer, and an `ANTHROPIC_API_KEY` in a gitignored `.env.test` at the repository
root. The skills under test must be installed at `~/.claude/skills/<name>/`, because the
judge reads their checks from there.

```
node tests/all.js --plan              # call count and cost estimate, runs nothing
node tests/all.js                     # corpus, score, judge, report
node tests/all.js --no-judge          # counted score only, no judged score
node tests/all.js conversation-prose  # one skill
```

Approximate cost, from the runs above:

| command | model calls | cost |
|---|---:|---|
| `node tests/all.js --no-judge` | 15 | about $0.90 |
| `node tests/all.js` | 54 | about $4.90 |
| `node tests/judge.js <run-dir> --control --rounds 1` | 13 | about $1.10 |
| `node tests/run.js <skill> --make-baseline` | 13 per skill | about $0.80 |

`--plan` predicts the cost from what earlier runs recorded, so the estimate follows the model
in use with no price table to maintain. Useful flags: `--rounds N` (judging rounds, default
3), `--concurrency N` (judging calls in flight, default 3), `--model` and `--judge-model`,
`--fresh-before` to regenerate the before texts instead of reading the baseline, and
`--batch` to judge every pair of a skill in one call. Batch costs about a fifth as much and
scores the before text more leniently, so it is a smoke test and not a published figure.

The individual steps run on their own if you want them:

```
node tests/run.js conversation-prose --out tests/runs/mine   # generate the after texts
node tests/score.js tests/runs/mine                          # counted score
node tests/judge.js tests/runs/mine --rounds 3               # judged score
node tests/report.js tests/runs/mine                         # write docs/prose-test-report.md
node --test "tests/**/*.test.js"                             # the harness's own tests
```

### Measuring your own prose

`tests/corpus/<skill>/` holds one prompt per file, and `tests/baseline/<skill>/` holds the
unskilled answer to each. To measure your own writing, put it in `tests/baseline/<skill>/`
as `08.before.md` and add the prompt that would have produced it as
`tests/corpus/<skill>/08-your-name.md`. Then:

```
node tests/run.js conversation-prose --out tests/runs/mine
node tests/all.js --no-judge
```

The corpus hash in `meta.json` will not match, so run `node tests/run.js <skill>
--make-baseline` once to re-stamp it. Prose that never went through a model works the same
way: the before text is whatever you wrote.

### What the figures do not show

The detectors are taken from the skills' own rules, so this measures whether a skill removes
the failures it names. It does not measure whether the writing is better, and no automatic
test can. The judge has not been calibrated against a person marking the same checks by hand.
Thirteen prompts is enough for a direction and too few for a confidence interval. And the
test measures a rewrite pass over fixed text, where the normal use is prose written with the
skill already loaded. `published-prose` is not measured at all, because it reads a voice
profile written at install time and a shared run would measure either a profile that
generalises to nobody or only part of the skill.

The method, the detector definitions, and the limits are in [tests/README.md](tests/README.md).

## What's inside

Each skill in `plugins/` interviews you one question at a time, then fills a bundled
template. case-study edits your existing draft instead, and field-notes sets up a gitignored
`.field-notes/` decision log the agent maintains every session. Each prompt in `prompts/`
writes one skill file into your own environment. Nothing leaves your machine.

Created by [Craig Dennis](https://craigmdennis.com).
