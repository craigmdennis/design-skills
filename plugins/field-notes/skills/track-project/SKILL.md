---
name: track-project
description: Use when the user wants to keep field notes on a project — a live decision log for a future blog post, case study, or retrospective. Invoke at the start of a new project or when asked to add field notes to an existing repo.
---

# Field Notes

## Overview

Adds live decision capture to a project by creating an untracked `.field-notes/` folder that holds the notes log, draft writeups, and any images. The skill creates no tracked files: on Claude Code the plugin's SessionStart hook injects the capture instructions into context each session and adds `.field-notes/` to the repo's local exclude file (`.git/info/exclude`), so the project's `.gitignore` and agent-instructions file stay untouched. The dot-prefix keeps the folder out of the way and guarantees it never collides with the project's own content directories (`blog/`, `notes/`, `docs/`).

The presence of `.field-notes/notes.md` is what marks a project as tracked — the capture hooks and the instruction injection key off that file, and do nothing in any project that lacks it. Tracking only ever starts because someone asked for it; nothing offers it unprompted.

## Focus: whose story the notes tell

The notes are the **user's** story — their thinking, their decisions, the questions they asked, the direction they steered. Write every entry from the user's perspective and about the user's work.

**Do** capture:
- the problem and the **goal** — what the user wanted to be true in the world, and who felt the pain (this is the writeup's opening)
- decisions the user made and *why* — especially where they rejected the obvious approach
- questions the user raised, and what was at stake in them
- where the user changed direction mid-build, and the reasoning
- constraints, trade-offs, and realisations the user cared about
- the user's experience of the tools — what they asked for, what actually happened, and what surprised them (good or bad)
- the **outcome** — whether it worked, and what it's like now versus before (this is the writeup's ending)

**Do not** capture the *assistant's* own experience: tool errors, debugging detours, bugs you hit and fixed, environment quirks, or "problems I ran into." Those are not the user's story. The distinction is perspective: "I asked for X and got an unexpected Y" is the user's experience and belongs; "I hit a build error and fixed it" is yours and does not. When a problem genuinely matters, record the *decision or question it forced for the user*, not your struggle with it.

## Capture thinking live, not just from history

Once a project is tracked, this skill's setup is one-off but its intent is ongoing: capture the user's reasoning *in the moment*, because reconstructing it later from commits gets the *what* but loses the *why*. The injected instructions (the plugin's `scripts/instructions.md`, printed into context by the SessionStart hook) carry this into every future session — they tell the assistant to treat a non-obvious decision, a rejected approach, a change of direction, a sharp question, or a reaction to what a tool did as a logworthy moment in the same turn, and to keep the Framing block (problem, goal, workaround, outcome) current as the bookends.

The rule of thumb: if the user has already said *why* in the conversation, log it in their words; if they haven't, ask one short question to draw it out, then log it. Prompt only at real decision points, and back off immediately if the user doesn't want to capture a given moment. The goal is the user's voice and reasoning at the time, which is exactly what a later writeup can't manufacture.

## What to do

### Step 1: Create the .field-notes/ folder and notes file

Create `.field-notes/notes.md` if it does not already exist:

```markdown
# Field notes

Raw notes captured during agent sessions. Input for a later writing pass that turns them into a post.

## Framing

The writeup's opening and ending. Fill the first three at the start; fill Outcome once it ships.

- **Problem / who feels it:**
- **Goal (the outcome I want in the world):**
- **Current workaround:**
- **Outcome (what it's like now it's shipped):**

---

<!-- Dated decision log. Each entry is about the user's thinking, decisions, questions, and their experience of the tools — not the assistant's own debugging. Format: **YYYY-MM-DD — Short title**\nOne to three sentences. -->
```

### Step 2: Hide the folder from git

If the project is a git repo and git does not already ignore `.field-notes`, add it to the repo's local exclude file:

```bash
git check-ignore -q .field-notes || echo ".field-notes/" >> "$(git rev-parse --git-common-dir)/info/exclude"
```

The exclude file is local-only, so this changes nothing git tracks. Do not edit the project's `.gitignore`. The SessionStart hook repeats this check every session, so a repo tracked before this protection existed heals itself.

If `git ls-files .field-notes` prints anything, git already tracks notes from an earlier setup, and ignore rules do not apply to tracked files — tell the user and offer `git rm -r --cached .field-notes`.

### Step 3: Populate .field-notes/notes.md for existing repos

If the repo already has commits beyond the initial setup (i.e. this isn't a blank project), populate `.field-notes/notes.md` with entries drawn from the current repo state. To do this:

- Read `git log --oneline` to understand what has been built and in what order
- Read the README for a summary of the project's purpose
- Read any spec or plan files in `docs/` if present
- Read the main source files to understand what was actually implemented

First fill the **Framing** block from the README and source: the problem, the goal, and the current workaround. The Outcome line usually can't be reconstructed from code — leave it for the user, or ask one short question.

Reconstruct the *user's* decisions from that history — frame each entry as a choice the user made or a constraint that shaped their thinking, not as something the codebase or the assistant hit:
- What the project does and the key constraint that shaped how the user approached it
- Notable decisions visible in the commit history or source — a non-obvious approach the user took, an alternative they rejected
- Where the design changed direction, and the reasoning the commits imply

Each entry: one to three sentences, raw and specific, written from the user's perspective. No prose, no summaries. Note that git history shows *what* changed but not the user's in-the-moment questions — lean on decisions and direction, and don't invent struggles. Do not log issues the assistant encountered.

Skip this step if the repo has no meaningful commits yet (only setup/init commits).

## Agents without hooks

On Claude Code the plugin injects the capture instructions every session, so no repo file has to carry them. A skill-only install (`npx skills add`) on an agent with no hook system has no injection path; the only alternative is a `## Field notes` section in the project's agent-instructions file (`AGENTS.md` or `CLAUDE.md`), and git will track that file. Offer it as an explicit opt-in: tell the user the section ends up committed to the repo, and only after their yes copy the contents of the plugin's `scripts/instructions.md` into the file. Never write it by default.

## What NOT to do

Do not:
- Commit anything — the skill creates no tracked files
- Edit `.gitignore`, `AGENTS.md`, or `CLAUDE.md` (the one exception is the opt-in above, after the user has agreed)
- Create scripts, CLI tools, or npm commands
- Add hooks or other automation config — on Claude Code the plugin registers its own capture hooks
- Add dependencies
- Log your own debugging, tool errors, or problems you encountered — the notes are the user's story, told from their perspective

Finished writeups belong in the user's blog or portfolio site, not in the project repo. The `.field-notes/` folder is a local working area only.

## Idempotent

- If `.field-notes/notes.md` already exists, skip Step 1
- Step 2 is safe to repeat — it appends only when git does not already ignore the folder
- If `.field-notes/notes.md` exists but is empty or only contains the template placeholder, still run Step 3 to populate it
- If notes already have content, report that field notes are already configured and stop
