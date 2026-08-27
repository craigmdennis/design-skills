# field-notes

Keep field notes on a project. Commit history can reconstruct *what* you built — this plugin captures the *why* while it's still fresh: the decisions, the rejected approaches, the questions, and how the tools behaved. Raw material for a future blog post, case study, or retro.

It has two halves:

1. **A skill** (`/field-notes:track-project`) that sets a project up: an untracked `.field-notes/` working folder with a `notes.md` decision log. The skill touches nothing git tracks — no `.gitignore` edit, no `AGENTS.md` or `CLAUDE.md` section, no commit.
2. **Four hooks** that run automatically once a project is tracked, and do nothing at all until then:

| Hook | Event | What it does |
|------|-------|--------------|
| `inject-instructions` | SessionStart | Injects the capture instructions into context, and adds `.field-notes/` to the repo's local `.git/info/exclude` so git never sees the folder. Warns if notes were committed at some point. |
| `capture-feedback` | UserPromptSubmit | Appends your prompts verbatim to `.field-notes/feedback-raw.md` — the raw record of where you corrected or redirected Claude. |
| `prompt-rationale` | UserPromptSubmit | Once per session, after ~5 turns, nudges Claude to ask you the "why" behind recent decisions and log it. |
| `capture-insights` | Stop | Collects Claude's `★ Insight` callouts into `.field-notes/insights-raw.md` (only produces anything in the `explanatory` output style). |

Nothing the plugin creates is committed to your repo. The notes live in `.field-notes/`, hidden from git through the repo's local exclude file instead of `.gitignore`; the capture instructions reach the agent through the SessionStart hook instead of a committed instructions file. The dot-prefix means your project's own content (`blog/`, `notes/`, `docs/`) is never touched, and nothing leaves your machine.

## Install

```
/plugin marketplace add craigmdennis/design-skills
/plugin install field-notes@design-skills
```

Then say "keep field notes on this project" in any repo you want tracked. Nothing starts on its own — the hooks stay dormant until you've asked for a project to be tracked.

### Skill-only install (no hooks)

```
npx skills add craigmdennis/design-skills
```

The [skills CLI](https://skills.sh) installs skills from this repo (pick `track-project`) into Claude Code or any agent that supports skills (Codex, Cursor, Amp, and others) — hooks are a Claude Code plugin concept it doesn't handle. Without hooks there is no injection path for the capture instructions, so the skill offers one fallback as an explicit opt-in: a `## Field notes` section in the project's agent-instructions file, which git will track. You also lose the automatic parts — the verbatim prompt log, insight capture, and the rationale nudge. For the full setup, install the plugin.

## Privacy — read this

Once a project is tracked, **`capture-feedback` writes every prompt you type in that project to `.field-notes/feedback-raw.md` on disk, verbatim.** The file is local and hidden from git, but it exists — if you paste a secret into a prompt, it will be in that file. Disable prompt capture entirely with:

```json
{ "env": { "FIELD_NOTES_CAPTURE_FEEDBACK": "0" } }
```

in your `~/.claude/settings.json`. Untracked projects are never touched: every hook is a no-op unless `.field-notes/notes.md` exists in the project.

## Configuration

Set these in the `env` block of `~/.claude/settings.json` (or your shell):

| Variable | Default | Effect |
|----------|---------|--------|
| `FIELD_NOTES_CAPTURE_FEEDBACK` | on | `0` = never write prompts to `feedback-raw.md` |
| `FIELD_NOTES_RATIONALE_TURNS` | `5` | Turns before the once-per-session rationale nudge; `0` disables it |

## Uninstall

```
/plugin uninstall field-notes@design-skills
```

Hooks are removed with the plugin. Any `.field-notes/` folders it created stay where they are — they're yours. The `.field-notes/` lines the SessionStart hook wrote to `.git/info/exclude` also stay; they're one line per repo and harmless, or delete them by hand.

## Requirements

- Claude Code with plugin support
- `node` on your PATH (the hooks are dependency-free Node scripts)
