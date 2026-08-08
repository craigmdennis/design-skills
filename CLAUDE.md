# CLAUDE.md

Claude Code plugin marketplace repo (marketplace name: `design-skills`). Each plugin lives in `plugins/<name>/` with its manifest in `.claude-plugin/plugin.json`; the marketplace manifest is `.claude-plugin/marketplace.json` at the repo root. Install specs read `<plugin>@design-skills`.

Naming: a plugin is named for its **domain** (`case-study`, `field-notes`), a skill for the **action** it performs (`strengthen`, `track-project`), so the invocation reads `plugin:skill` without stuttering. Skill names also have to stand alone, because `npx skills add` installs them into other agents with no plugin prefix — so prefer `set-goals` over `set`. A plugin's name, its directory, its `source` in `marketplace.json`, and its skill directory names are four separate places that must agree.

Hook scripts (field-notes) are dependency-free CommonJS Node — no `package.json` in the plugin dirs, so keep them `require()`-based and runnable with a bare `node` invocation. Hooks must always exit 0 and print nothing to stdout except deliberate context injections (SessionStart/UserPromptSubmit stdout reaches Claude's context).

The `installer/` directory is a separate npm package (`field-notes`) whose only job is to shell out to `claude plugin marketplace add` + `claude plugin install`. It never copies files or edits settings.json itself.

## Blog content capture

This project is tracked for a portfolio blog post. Throughout sessions, maintain `blog/notes.md`: a **Framing** block (the bookends) plus a dated decision log.

Keep the Framing block current — it's the case study's opening and ending, and the part commit history can never reconstruct:
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
One to three sentences. Raw observations only — the `portfolio-content` skill turns them into prose.
```

Blog posts, images, and drafts go in `blog/`. This folder is gitignored — nothing in it is committed to the repo.
