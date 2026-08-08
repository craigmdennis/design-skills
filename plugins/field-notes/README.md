# field-notes

Keep field notes on a project. Commit history can reconstruct *what* you built — this plugin captures the *why* while it's still fresh: the decisions, the rejected approaches, the questions, and how the tools behaved. Raw material for a future blog post, case study, or retro.

It has two halves:

1. **A skill** (`/field-notes:track-project`) that sets a project up: a gitignored `.field-notes/` working folder with a `notes.md` decision log, plus an instruction in the project's agent-instructions file (`AGENTS.md` or `CLAUDE.md`) that keeps the agent logging your reasoning in every future session.
2. **Four capture hooks** that run automatically once a project is tracked:

| Hook | Event | What it does |
|------|-------|--------------|
| `detect-new-project` | SessionStart | In a brand-new git repo (≤2 commits), offers to set up field notes — once. |
| `capture-feedback` | UserPromptSubmit | Appends your prompts verbatim to `.field-notes/feedback-raw.md` — the raw record of where you corrected or redirected Claude. |
| `prompt-rationale` | UserPromptSubmit | Once per session, after ~5 turns, nudges Claude to ask you the "why" behind recent decisions and log it. |
| `capture-insights` | Stop | Collects Claude's `★ Insight` callouts into `.field-notes/insights-raw.md` (only produces anything in the `explanatory` output style). |

Everything lands in `.field-notes/`, which the skill gitignores — the dot-prefix means your project's own content (`blog/`, `notes/`, `docs/`) is never touched, nothing is committed to your repo, and nothing leaves your machine.

## Install

```
/plugin marketplace add craigmdennis/design-skills
/plugin install field-notes@design-skills
```

Then either say "keep field notes on this project" in any repo, or just start a new project — the SessionStart hook will offer it automatically.

### Skill-only install (no hooks)

```
npx skills add craigmdennis/design-skills
```

The [skills CLI](https://skills.sh) installs skills from this repo (pick `track-project`) into Claude Code or any agent that supports skills (Codex, Cursor, Amp, and others) — hooks are a Claude Code plugin concept it doesn't handle. You keep the full setup + decision-log workflow (the agent-instructions file still makes the agent log your reasoning every session), but lose the automatic parts: new-project detection, the verbatim prompt log, insight capture, and the rationale nudge. For those, install the plugin.

## Privacy — read this

Once a project is tracked, **`capture-feedback` writes every prompt you type in that project to `.field-notes/feedback-raw.md` on disk, verbatim.** The file is local and gitignored, but it exists — if you paste a secret into a prompt, it will be in that file. Disable prompt capture entirely with:

```json
{ "env": { "FIELD_NOTES_CAPTURE_FEEDBACK": "0" } }
```

in your `~/.claude/settings.json`. Untracked projects are never touched: every hook is a no-op unless `.field-notes/notes.md` exists in the project.

## Configuration

Set these in the `env` block of `~/.claude/settings.json` (or your shell):

| Variable | Default | Effect |
|----------|---------|--------|
| `FIELD_NOTES_AUTO_TRACK` | off | `1` = set up field notes on new projects automatically instead of asking first |
| `FIELD_NOTES_CAPTURE_FEEDBACK` | on | `0` = never write prompts to `feedback-raw.md` |
| `FIELD_NOTES_NEW_PROJECT_COMMITS` | `2` | Max commit count for a repo to count as "new" |
| `FIELD_NOTES_RATIONALE_TURNS` | `5` | Turns before the once-per-session rationale nudge; `0` disables it |

Opt a single project out forever: `touch .field-notes-ignore` in its root.

## Uninstall

```
/plugin uninstall field-notes@design-skills
```

Hooks are removed with the plugin. Any `.field-notes/` folders it created stay where they are — they're yours.

## Requirements

- Claude Code with plugin support
- `node` and `git` on your PATH (the hooks are dependency-free Node scripts)
