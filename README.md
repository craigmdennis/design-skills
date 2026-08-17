# Design skills

Installable agent skills from Visible by Design, a framework for helping designers get
the recognition they deserve within organisations.

Everything here is a plugin in `plugins/`, installed with a package manager and updated in
place. Four are interview-driven skills for design work. The fifth, `writing`, holds three
prose standards and the hooks that keep one of them applied to every reply.

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
- **[writing](plugins/writing/)** (`conversation-prose`, `documentation-prose`,
  `published-prose`) — three writing standards, one per genre, plus the hooks that keep the
  conversation standard applied on every turn. See [Prose skills](#prose-skills).

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
/plugin install writing@design-skills
```

For **case-study**, **design-goals**, and **impact-report** the two routes are equivalent.
Both install pure skills.

**field-notes** and **writing** are the two where the plugin route adds something, because
both register hooks that the skills-only route cannot.

**field-notes** registers capture hooks that run on Claude Code events: logging your
prompts, collecting insight callouts, and asking once a session for the "why" behind a
decision. Capture then happens without you thinking about it. The hooks only run in a
project you have asked to track, and do nothing at all in one you have not. Installed as a
skill only, field-notes still works; you invoke it and the agent maintains the log, with
none of the automatic capture. Start with the skill and install the plugin later. Both
routes use the same files, so nothing is lost by switching. Details, including the privacy
switches, are in the [field-notes README](plugins/field-notes/).

**writing** registers the two injection hooks described under
[Prose skills](#prose-skills). Installed as skills only, all three still work when invoked
by name, and `conversation-prose` then loads at most once per session instead of on every
turn.

## Prose skills

Three writing standards, one per genre of writing. Each one governs a genre the other two
make worse, so they are separate skills and not settings on one skill. The background is in
["Fixing the AI writing problem"](https://craigmdennis.com/writing/fixing-the-ai-writing-problem/).

| Genre | Skill | Standard |
|---|---|---|
| Replies, explanations, status updates, summaries, plans, review | [conversation-prose](plugins/writing/skills/conversation-prose/) | ASD-STE100 (Issue 9) and minimalism |
| Skill files, READMEs, specs, plans, code comments, changelogs | [documentation-prose](plugins/writing/skills/documentation-prose/) | Third-person impersonal |
| Prose published under an author's own name | [published-prose](plugins/writing/skills/published-prose/) | The author's own voice, from an interview |

```
/plugin marketplace add craigmdennis/design-skills
/plugin install writing@design-skills
```

Restart the session afterwards. The two hooks below are inactive until then.

### The two hooks

`conversation-prose` governs every reply, so loading it on demand is too late. By the time
the standard is found to apply, the reply is written. A `SessionStart` hook injects the full
skill once per session, about 6,700 tokens. A `UserPromptSubmit` hook injects `checks.md`,
the sixteen checks in one line each, on every turn, about 650 tokens. The per-turn injection
is what keeps the standard applied at turn 90. A file read once at session start stops
affecting output as a session gets longer.

Both injections prefer a copy at `~/.claude/skills/<skill>/`, so an edited copy takes
priority over the plugin's and the same text is never injected twice. To stop both, disable
the plugin with `/plugin`.

`documentation-prose` and `published-prose` load on demand and cost nothing until invoked.

### The voice profile

`published-prose` reads `~/.claude/skills/published-prose/voice-profile.md` before writing
anything: spelling, punctuation, when you write "I" and when "we", which numbers may be
published on which surface, and which words you have banned. Where no profile exists, the
skill offers two paths: a twelve-question interview that writes a profile, or writing
without one and asking for each preference as it applies. A profile counts as installed only
when it contains the line `status: complete`, so an interrupted interview does not install a
partial profile.

Personal preference is in that file. The skill itself states only rules about failures in
writing, which is what makes it shareable. The profile is written outside the plugin
directory, so `claude plugin update` does not replace it.

### Editing them

The rules describe failures in writing generally. The specific bans belong to one author.
Two parts are meant to be replaced: the "Words the reader has banned" section of
`conversation-prose`, which ships one worked entry as an example (a ban on every figurative use
of "hold"), and the whole `published-prose` voice profile.

Copy the skill directory to `~/.claude/skills/<name>/` before editing. Edits made inside the
plugin are lost at the next `claude plugin update`, and a local copy takes priority over the
plugin's anyway.

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
| conversation-prose | 9 | 15.0 | 7.2 | **−52%** | 59.0–62.5% | **95.8–97.9%** |
| documentation-prose | 7 | 24.6 | 3.9 | **−84%** | 69.8–71.4% | **95.2–96.8%** |

Claude Opus 5; conversation-prose 2026-08-17, documentation-prose 2026-08-15. The first
three columns are counted by script and reproduce exactly from the committed texts. The last
two are marked by a second Claude instance across three rounds, so they are given as a
range. Full detail, per prompt and per check, is in
[the report](docs/prose-test-report.md).

Three of the nine conversation-prose prompts are **pinned**: their before texts are copied
whole from real session transcripts, at the point where the reader objected, and no model
call regenerates them. The pinned texts carry failures at the density a real session
produces, and adding them moved the measured change from −61% to −52%. The prompts before
and after that change are both in the repository, so either figure reproduces.

A separate red-team run measured generation rather than rewrite: a writer with the skill
loaded answers each prompt, a red team applies the sixteen checks with a majority vote of
three verifiers, and the writer revises until a round confirms nothing. All nine prompts
reached zero confirmed violations within four rounds, and six of nine first drafts passed
immediately. That run is documented in [docs/red-team-pilot.md](docs/red-team-pilot.md).

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
   rule out of the documentation-prose skill on disk, which made it an after text. A canary probe
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
root. The skills under test must be installed at `~/.claude/skills/<name>/`, because that is where
the harness reads them from. The copy in `plugins/writing/` is de-personalised and re-wrapped, so it
never matches byte for byte, but a test fails if the two check lists ever diverge — the check
list is what the judge marks against and what sets every denominator above. `meta.json`
records which copy produced a figure.

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
`.field-notes/` decision log the agent maintains every session. The prose skills read and
write only inside your own environment. Nothing leaves your machine.

Created by [Craig Dennis](https://craigmdennis.com).
