---
name: field-notes
description: Use when the user wants to keep field notes on a project — a live decision log for a future blog post, case study, or retrospective. Invoke at the start of a new project or when asked to add field notes to an existing repo.
---

# Field Notes

## Overview

Adds live decision capture to a project by updating CLAUDE.md with an instruction, creating a gitignored `.field-notes/` folder, and adding `.field-notes/` to `.gitignore`. The `.field-notes/` folder holds the notes log, draft writeups, and any images — none of it gets committed to the project repo. The dot-prefix keeps it out of the way and guarantees it never collides with the project's own content directories (`blog/`, `notes/`, `docs/`).

The presence of `.field-notes/notes.md` is what marks a project as tracked — the plugin's capture hooks key off that file. A `.field-notes-ignore` file in the project root permanently opts a project out.

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

Once a project is tracked, this skill's setup is one-off but its intent is ongoing: capture the user's reasoning *in the moment*, because reconstructing it later from commits gets the *what* but loses the *why*. The Step 3 CLAUDE.md instruction is what carries this into every future session — it tells the assistant to treat a non-obvious decision, a rejected approach, a change of direction, a sharp question, or a reaction to what a tool did as a logworthy moment in the same turn, and to keep the Framing block (problem, goal, workaround, outcome) current as the bookends.

The rule of thumb: if the user has already said *why* in the conversation, log it in their words; if they haven't, ask one short question to draw it out, then log it. Prompt only at real decision points, and back off immediately if the user doesn't want to capture a given moment. The goal is the user's voice and reasoning at the time, which is exactly what a later writeup can't manufacture.

## What to do

### Step 1: Add `.field-notes/` to .gitignore

Read `.gitignore`. If `.field-notes/` is not already listed, add it.

### Step 2: Create the .field-notes/ folder and notes file

Create `.field-notes/notes.md` if it does not already exist:

```markdown
# Field notes

Raw notes captured during Claude Code sessions. Input for a later writing pass that turns them into a post.

## Framing

The writeup's opening and ending. Fill the first three at the start; fill Outcome once it ships.

- **Problem / who feels it:**
- **Goal (the outcome I want in the world):**
- **Current workaround:**
- **Outcome (what it's like now it's shipped):**

---

<!-- Dated decision log. Each entry is about the user's thinking, decisions, questions, and their experience of the tools — not the assistant's own debugging. Format: **YYYY-MM-DD — Short title**\nOne to three sentences. -->
```

### Step 3: Add section to CLAUDE.md

If CLAUDE.md does not exist, create it. If it exists, append the section. Check first — do not add it twice.

Add this section exactly:

```markdown
## Field notes

This project keeps field notes for a future writeup (blog post, case study, or retro). Throughout sessions, maintain `.field-notes/notes.md`: a **Framing** block (the bookends) plus a dated decision log.

Keep the Framing block current — it's the writeup's opening and ending, and the part commit history can never reconstruct:
- **Problem / who feels it** and the **goal** (the outcome the user wants in the world) — capture these the moment they surface, usually early. A decision log with no why has no opening.
- **Current workaround** — what the user does today, before this exists.
- **Outcome** — fill in once it ships: whether it works end to end, and what it's like now versus before. Don't leave it blank at the finish; if the user hasn't said, ask.

Log the user's thinking — not the assistant's process. Dated entries are about the user's decisions, questions, changes, and their experience of the tools, written from their perspective:
- The user's key decisions and the reasoning behind them (especially where they rejected the obvious approach)
- Questions the user asked, and what was at stake in them
- Moments the user changed direction mid-build, and why
- Trade-offs and constraints the user weighed; anything that changed how they think about the problem
- The user's experience of the tools — what they asked for and what actually happened, especially where the result surprised them, and moments they realised they could solve it themselves

Capture the user's side of the tooling, not the assistant's. "I asked for X and it did Y I didn't expect" is the user's story and belongs. Your own tool errors, debugging detours, and bugs you fixed do not — if one mattered, capture the user's decision or question it triggered, not your struggle with it.

Capture the thinking live — don't just reconstruct it afterwards. When the user makes a non-obvious decision, rejects an approach, changes direction, asks a sharp question, or reacts to what a tool did, treat it as a logworthy moment in the same turn. If they already explained their reasoning in the conversation, record it in their own words. If the reasoning is unstated, ask one short question to draw it out (what tipped the decision, what they were weighing, what worried them) and log their answer. Keep it low-friction: prompt only at genuine decision points, never mid-flow for trivia, and drop it the moment they'd rather not.

Format each entry as:

```
**YYYY-MM-DD — Short title**
One to three sentences. Raw observations only — a later writing pass turns them into prose.
```

Draft writeups and images go in `.field-notes/`. This folder is gitignored — nothing in it is committed to the repo.
```

### Step 4: Populate .field-notes/notes.md for existing repos

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

### Step 5: Commit only the tracked files

Stage the two tracked files and propose the commit — only run it if the user has already authorized commits (in this session or their instructions); otherwise ask first:

```bash
git add .gitignore CLAUDE.md
git commit -m "docs: add field notes capture"
```

Do not `git add .field-notes/` — it is intentionally untracked.

## What NOT to do

Do not:
- Commit anything inside `.field-notes/` — it is gitignored by design
- Create scripts, CLI tools, or npm commands
- Add hooks to settings.json — the plugin already registers its own capture hooks
- Add dependencies
- Create more than the two tracked files (`.gitignore`, `CLAUDE.md`)
- Log your own debugging, tool errors, or problems you encountered — the notes are the user's story, told from their perspective

Finished writeups belong in the user's blog or portfolio site, not in the project repo. The `.field-notes/` folder is a local working area only.

## Idempotent

- If `.field-notes/` is already in `.gitignore`, skip Step 1
- If `.field-notes/notes.md` already exists, skip Step 2
- If CLAUDE.md already has a `## Field notes` section, skip Step 3
- If all three are already set up but `.field-notes/notes.md` is empty or only contains the template placeholder, still run Step 4 to populate it
- If all three are set up and notes already have content, report that field notes are already configured and stop
