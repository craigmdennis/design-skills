# documentation-prose

A prompt that installs a writing skill for documentation: skill files, README
files, specifications, implementation plans, architecture notes, code comments,
API reference, contributing guides, changelogs, and runbooks.

The skill applies third-person impersonal, the register of specifications and
reference manuals. ISO/IEC Directives Part 2 requires it for International
Standards, for one reason: a document states what is required, and it does not
describe one person's preferences.

It does not govern conversational replies and it does not govern prose published
under an author's own name. Those are two separate genres; see
`conversation-prose.md` and `published-prose.md` in this directory.

## What the prompt does

1. Writes `~/.claude/skills/documentation-prose/SKILL.md`.
2. Prints the full path.
3. Offers a routing line for `~/.claude/CLAUDE.md`, and adds it only on
   confirmation.

There is no interview. The skill is complete as installed, because a
documentation register carries no personal preferences by design.

## Why the routing line matters

An agent writes documentation constantly without being asked to: a README on
scaffold, comments in generated code, a plan file, a changelog entry. A skill
that is only invoked by name will be missed on all of those. The routing line
tells the agent the rule applies whether or not the skill was invoked.

## Limits

The prompt embeds the skill verbatim, so a pasted copy has no connection to this
repository. No update reaches it. Re-pasting the block installs the current
version and overwrites the previous one.

## The prompt

Copy everything inside the block below and paste it into a Claude Code session.

````
You are installing a writing skill into this environment. Do exactly the
following, and nothing else.

1. Create the directory ~/.claude/skills/documentation-prose/ if it does not
   exist.

2. Write the text between BEGIN SKILL.md and END SKILL.md to
   ~/.claude/skills/documentation-prose/SKILL.md, verbatim. Do not summarise it,
   do not reformat it, do not correct it, and do not change any wording. The
   file includes before-and-after examples containing the exact wording a rule
   bans; those have to be reproduced exactly for the rules to be usable.

3. Print the full path of the file.

4. Ask whether to add these two lines to ~/.claude/CLAUDE.md, and add them only
   if I say yes:

   When writing or editing documentation of any kind, use the
   documentation-prose skill. This applies whether or not the skill was
   invoked.

5. Stop. Do not create or change any other file. Do not change settings. Do not
   install anything else.

===== BEGIN SKILL.md =====
---
name: documentation-prose
description: Use when writing or editing documentation of any kind — skill files, README files, specs, plans, architecture notes, code comments, API reference, contributing guides, changelogs, runbooks. Applies third-person impersonal voice, the register of specifications and reference manuals. Governs documentation only; it does not govern conversational replies or prose published under an author's own name.
---

# Documentation prose

## Scope

This skill governs documentation: skill files, README files, specifications,
implementation plans, architecture notes, code comments, API reference,
contributing guides, changelogs, and runbooks.

It does not govern two other genres:

- **Conversational replies.** Explanations, status updates, summaries, reviews,
  and questions back to a reader follow ASD-STE100. See the `conversation-prose`
  skill where it is installed.
- **Prose published under a person's own name.** Blog posts, case studies,
  resume copy, and application answers follow that author's own voice rules. See
  the `published-prose` skill where it is installed.

Both companion skills are optional. This one is complete on its own.

## The standard

Documentation is written in **third-person impersonal**, the register of
specifications and reference manuals. ISO/IEC Directives Part 2 requires it for
International Standards, for one reason: a document states what is required, and
it does not describe one person's preferences.

A reader arriving at documentation has no access to the conversation that
produced it. Every sentence must stand without that context.

## The three operations

Apply all three. They are mechanical, and they are the whole method.

### 1. Delete the agent

Remove the person performing the action. Use an agentless passive in the
subordinate clause and keep the main clause imperative.

| Before | After |
|---|---|
| "when the user asks a question, answer it" | "when asked a question, answer it" |
| "when [Name] pastes existing text, clean it up" | "when existing text is pasted, clean it up" |
| "you should run the migration first" | "run the migration first" |

### 2. Delete the possessive

Remove the possessive determiner. Where the noun then works as a general one,
drop the article as well.

| Before | After |
|---|---|
| "the user's prose" | "the prose" |
| "the user's thinking" | "thinking" |
| "their configuration file" | "the configuration file" |

### 3. Describe the function instead of naming the owner

Headings and labels state what the section covers. They do not state whose it is.

| Before | After |
|---|---|
| "[Name]'s blog voice" | "Writing style guidance for prose such as blogs" |
| "My deployment notes" | "Deployment" |
| "Scope: the user's prose" | "Scope" |

## Never name a person

No personal names. No "X wants", no "confirmed by X", no dates recording who
decided what. State the rule.

The decision history belongs in version control, where it is already recorded
with an author and a timestamp. Repeating it in the document adds nothing and
dates the document the moment ownership changes.

| Before | After |
|---|---|
| "Set by [Name] on 2026-06-30 after review." | (delete the sentence; keep the rule) |
| "Two rules the user scoped rather than adopting whole." | "Two rules are scoped instead of adopted whole." |
| "This is a divergence, confirmed by [Name] 2026-08-11." | "This is a deliberate divergence." |

## Where a referent is genuinely required

Some sentences need to name a role. Use the functional role, and reuse the same
term throughout rather than varying it.

- `the author` for whoever the prose is attributed to
- `the reader` for whoever consumes the document
- `the caller`, `the operator`, `the maintainer` for a system role
- `the decision-maker`, `the reviewer` for a process role

Pick one term per role per document. Repeat it. Varying the term to avoid
repetition makes a reader wonder whether two different roles are meant.

## Also apply the prose rules

Documentation is prose, so these apply on top of the register:

- **No idiom, metaphor, analogy, or personification.** "load-bearing", "spine",
  "hinge", "slip past", "on sight", "bolt on", "flatten", "punchy" all go.
  Figurative phrasal verbs are the hardest to notice, because they read as
  ordinary English: "dressed it up as", "glossed over", "touched the problem",
  "went the same way".
- **One word carries one meaning.** Reuse the term. Do not swap in a synonym.
- **One idea per sentence.** Around 20 words in instructions.
- **Active voice in the main clause**, with the subject first. The agentless
  passive is permitted only in the subordinate clause, as operation 1 requires.
- **Plainest accurate word.** "Use" rather than "utilize", "help" rather than
  "facilitate".

## The replacement method

When non-literal wording is found, do not look for a gentler word inside the
same image. That produces a second metaphor and changes nothing.

Answer three questions instead: **who did it, what did they do, and to what.**
Then write that. The verb is almost always one of a small plain set: `is`, `has`,
`finds`, `makes`, `changes`, `stops`, `removes`, `describes`, `corrects`,
`states`, `helps`.

| Original | Substituted word (wrong) | Correct |
|---|---|---|
| "dressed it up as a win" | "called it a win" | "described the bug as a success" |
| "None of them touched the problem." | "None of them changed the wording." | "All five options change the layout. None changes the wording." |
| "That kills a habit" | "That removes a habit" | "This rule stops a behaviour." |
| "where a comparison earns its place" | "where a comparison does real work" | "where a comparison helps the reader understand" |

## Quoted examples are exempt

Quoted material is reference. Do not rewrite it.

This includes verbatim quotations, before-and-after example pairs, banned
phrases named by a rule, code samples, and command output. A rule that bans
"earned its keep" has to print those words to be usable.

Where a quotation contains a personal name and the name is not the point,
replace it with a bracketed placeholder such as `[Name]`. Where the name is the
point, such as an example showing why a quotation cannot be published, keep the
placeholder and say why it is there.

## Self-check

Before saving any documentation, scan for:

- **A personal name**, or a possessive referring to one. Delete or replace with
  the functional role.
- **A date recording who decided something.** Delete it. Version control has it.
- **An agent that can be deleted** from a subordinate clause. "when the user
  asks" becomes "when asked".
- **A heading naming an owner** instead of stating what the section covers.
- **Any metaphor, idiom, or personification**, including quiet ones and
  figurative phrasal verbs.
- **A replacement that kept the original image.** Run the replacement method
  again.
- **A synonym used to avoid repeating a word.** Reuse the first term.
- **A cross-reference to a file the reader may not have**, such as a personal
  instruction file. A shared document must stand alone.
- **First or second person** referring to the document's owner. "I decided",
  "as we agreed", "my preference". The exception is the imperative "you", which
  is standard in instructions and stays.
===== END SKILL.md =====
````
