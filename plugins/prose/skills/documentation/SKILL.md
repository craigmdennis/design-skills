---
name: documentation
description: Use when writing or editing documentation of any kind — skill files, README files, specs, plans, architecture notes, code comments, API reference, contributing guides, changelogs, runbooks, and pull request titles and bodies. Applies third-person impersonal voice, the register of specifications and reference manuals. Governs documentation only; it does not govern conversational replies or prose published under an author's own name.
---

# Documentation prose

## Scope

This skill governs documentation: skill files, README files, specifications,
implementation plans, architecture notes, code comments, API reference,
contributing guides, changelogs, runbooks, and pull request titles and bodies.

A pull request body is documentation, and the register applies to it in full. It
also has a shape of its own. See "Change documents" below.

It does not govern two other genres:

- **Conversational replies.** Explanations, status updates, summaries, reviews,
  and questions back to a reader follow ASD-STE100. See the `conversation`
  skill where it is installed.
- **Prose published under a person's own name.** Blog posts, case studies,
  resume copy, and application answers follow that author's own voice rules. See
  the `published` skill where it is installed.

Both companion skills are optional. This one is complete on its own.

## The checks

**Run all eighteen on the draft before saving.**

Each check is a procedure, not a list of words to search for. A word list finds
only the words on it. Where a check gives example words, they illustrate the
class. Apply the procedure.

Every check applies to every sentence and to every clause, including headings,
table cells, and code comments.

**1. Personal name.** Search for every personal name, and every possessive
referring to a person. Replace with the functional role, or delete the sentence.
A name inside a quoted example becomes `[Name]`.

**2. Decision date.** Search for every date. If it records who decided something
or when something was agreed, delete it. Version control holds that history with
an author and a timestamp.

**3. Agent in a subordinate clause.** Read each subordinate clause. If it names
the person acting, use the agentless passive. The main clause stays imperative.

**4. Possessive determiner.** Search for *the user's, their, his, her, my, our*.
Delete the determiner. Where the noun then works as a general one, drop the
article too.

**5. Heading naming an owner.** Read every heading and label. It states what the
section covers, and never whose it is.

**6. First and second person.** Search for *I, we, my, our, your* referring to
the document's owner. Delete them. The imperative *you* is standard in
instructions and stays.

**7. Figurative language.** For each content word, ask whether it names what
physically happened. Metaphor, idiom, analogy, and personification all go,
including figurative phrasal verbs, which read as ordinary English.

**8. Replacement that kept the image.** For every phrase replaced under check 7,
ask whether the new wording carries the original picture. Apply the replacement
method below.

**9. Synonym for variety.** For each concept that appears twice, check that both
instances use the same word. Reuse the first term.

**10. One term per role.** Pick one term for each role in the document and
repeat it. Varying it makes a reader ask whether two roles are meant.

**11. One idea per sentence.** Around 20 words in an instruction. Use the number
to notice a sentence carrying two ideas, and split it.

**12. Active voice, subject first.** The main clause is active with its subject
first. The agentless passive appears only in a subordinate clause, where check 3
puts it.

**13. Plainest accurate word.** Use the short common word. "Use" instead of
"utilize", "help" instead of "facilitate".

**14. Cross-reference a reader may not have.** Search for every reference to
another file. A shared document stands alone, so a pointer to a personal
instruction file gets removed, or replaced with the content it names.

**15. Quoted material is exempt.** Verbatim quotations, before-and-after pairs,
banned phrases a rule prints, code samples, and command output are reference.
Checks 1 to 14 do not apply inside them.

Checks 16 to 18 apply to a change document: a pull request body, a changelog
entry, or a release note. Any other document passes all three.

**16. A state that exists only inside the branch.** An approach tried and
reverted, a defect introduced and fixed, a diagnostic method. Keep the mechanism
a reviewer needs and remove the incident.

**17. A mechanism named by route or folder.** Every mechanism the change touches
gets a term, defined once and reused.

**18. A missing out-of-scope part.** Where the change leaves a related mechanism
unchanged, the document says so and gives the reason.

The sections below explain the checks and give the worked examples.

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

## Change documents

A pull request body, a changelog entry, and a release note all describe a
change. Each one has a defined shape, given below.

### Every sentence describes the merged state

A change document describes the code as it will exist after the change is
merged. A reader treats each described state as real and reachable, so each
sentence must name something they can observe: in the merged code, in the
branch it replaces, or in the tracker.

| Sentence describes | Include |
|---|---|
| The behaviour after merge | Yes |
| The behaviour before, on the target branch | Yes, where the change replaces it |
| A mechanism that explains a line of code | Yes |
| An approach tried and reverted inside the branch | No |
| A defect introduced and fixed inside the branch | No |
| The method used to diagnose something | No |
| Confirmation that a related mechanism did not change | State it as unchanged |

State the mechanism a reviewer needs, and leave out the incident that revealed
it. "sharp converts a transparent alpha channel to black" explains the call to
`flatten`. "11 cards rendered as a black rectangle" describes a build that no
reader can produce from the merged code.

A warning about an approach that fails belongs in a code comment at the
declaration it applies to, where it reaches whoever is about to repeat the
mistake. A change document is read once.

### Name every mechanism involved

Where a change involves two mechanisms, the document names each one, defines
each term once, and reuses those terms throughout.

Refer to a mechanism by a term, not by a route or a folder. A body that
describes "extending the `/x/` generator" in one paragraph and "the crop in
`Base`" in another reads as one mechanism to anyone who has not opened both
files.

| Before | After |
|---|---|
| "extends the `/x/` generator" | "**The generated card.** Company pages under `/x/` serve a card rendered at build time." |
| "previously passed the hero image to `Base`" | "**The hero crop.** Every other page passes an image to `Base`, which crops it." |
| "the `/x/` cards are unchanged" | "the company cards are unchanged" |

### The parts, in order

1. **The mechanisms involved.** Each mechanism the change affects, each with a
   term defined once, and a statement of which one the change alters.
2. **What the change does**, in the merged state.
3. **The behaviour a reviewer checks**: resolution order, conditions, edge
   cases, and the reason for each.
4. **Verification**: outcomes a reviewer can reproduce.
5. **The files**, each with the path and what it now contains.
6. **What is out of scope**, and the reason.

Parts 1 and 6 are the ones most often left out, and they are the two that stop
a reviewer misreading an unchanged mechanism as an oversight.

## Quoted examples are exempt

Quoted material is reference. Do not rewrite it.

This includes verbatim quotations, before-and-after example pairs, banned
phrases named by a rule, code samples, and command output. A rule that bans
"earned its keep" has to print those words to be usable.

Where a quotation contains a personal name and the name is not the point,
replace it with a bracketed placeholder such as `[Name]`. Where the name is the
point, such as an example showing why a quotation cannot be published, keep the
placeholder and say why it is there.

## The compact checks file

`checks.md` beside this file states the same eighteen checks in one line each.
It is short enough to inject on every turn, where this file is long enough that
a session loads it once. Edit both together, and confirm the two agree.

## Editing this file

Every edit to this file runs the eighteen checks over the whole file, including
the text the edit did not touch.
