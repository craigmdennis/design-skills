---
name: documentation-prose
description: Use when writing or editing documentation of any kind — skill files, README files, specs, plans, architecture notes, code comments, API reference, contributing guides, changelogs, runbooks, pull request titles and bodies, and decision documents such as memos, proposals, status updates, and strategy documents written for a team. Applies third-person impersonal voice, the register of specifications and reference manuals. Governs documentation only; it does not govern conversational replies or prose published under an author's own name.
---

# Documentation prose

## Scope

This skill governs documentation: skill files, README files, specifications,
implementation plans, architecture notes, code comments, API reference,
contributing guides, changelogs, runbooks, pull request titles and bodies, and
decision documents.

A pull request body is documentation, and the register applies to it in full. It
also has a shape of its own. See "Change documents" below.

A decision document is a narrative that a team reads to make or record a
decision: a memo, a proposal, a status update, a strategy document, or an
incident review. The
register applies to it in full, and it also has a shape of its own. See
"Decision documents" below.

It does not govern two other genres:

- **Conversational replies.** Explanations, status updates, summaries, reviews,
  and questions back to a reader address the reader directly, in second person.
  See the `conversation-prose` skill where it is installed.
- **Prose published under a person's own name.** Blog posts, case studies,
  resume copy, and application answers follow that author's own voice rules.
  See the `published-prose` skill where it is installed. A strategy document is
  documentation, wherever it is published.

Both companion skills are optional. This one is complete on its own.

## The checks

**Run all thirty on the draft before saving.**

Each check is a procedure, not a list of words to search for. A word list finds
only the words on it. Where a check gives example words, they illustrate the
class. Apply the procedure.

Every check applies to every sentence and to every clause, including headings,
table cells, and code comments.

**1. Personal name.** Search for every personal name, and every possessive
referring to a person. Replace with the functional role, or delete the sentence.
One exception: in a strategy document, a first name can name the owner of an
action.
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
"utilize", "help" instead of "facilitate". Replace jargon with the common word,
and delete a word that adds no meaning.

**14. Cross-reference a reader may not have.** Search for every reference to
another file. A shared document stands alone, so a pointer to a personal
instruction file gets removed, or replaced with the content it names.

**15. Quoted material is exempt.** Verbatim quotations, before-and-after pairs,
banned phrases a rule prints, code samples, and command output are reference.
No other check applies inside them.

Checks 16 to 18 apply to a change document: a pull request body, a changelog
entry, or a release note. Any other document passes all three.

**16. A state that exists only inside the branch.** An approach tried and
reverted, a defect introduced and fixed, a diagnostic method. Keep the mechanism
a reviewer needs and remove the incident.

**17. A mechanism named by route or folder.** Every mechanism the change touches
gets a term, defined once and reused.

**18. A missing out-of-scope part.** Where the change leaves a related mechanism
unchanged, the document says so and gives the reason.

Checks 19 and 20 apply to every document.

**19. A condition placed after its instruction.** A condition that limits a step
goes before the step.

**20. A politeness word or a difficulty word in a step.** Delete *please*,
*simply*, *just*, *easy*, and *quickly*. Change the opening word of any sentence
that repeats the one before it.

Checks 21 to 26 apply to every document.

**21. A number without its context.** Every number states its baseline, its
period, and its cause. A percentage also gives the absolute values.

**22. A vague quantity.** Replace *huge*, *significant*, *many*, and every word
like them with the amount, the period, and the population measured.

**23. Precision the reader does not need.** Round a number to the precision that
can change a decision. Most percentages take no decimal places.

**24. A fact that changes nothing.** Delete a number or a fact that has no
effect on the decision or the task the document supports.

**25. A figure without a sentence.** Every chart, screenshot, and diagram has a
sentence that states what it shows and the conclusion it supports.

**26. An answer that does not start with the answer.** In an FAQ, a question
and answer section, or a reply to a review question, the first sentence is a
core answer. The five core answers are below.

Checks 27 to 30 apply to a decision document. Any other document passes all
four.

**27. A list in place of an argument.** Paragraphs carry the reasoning. A list
holds only steps or parallel items. A bet in a strategy document is a block of
bold labels, each followed by a sentence or a paragraph.

**28. Length past the limit.** One page where the content allows. Six pages, or
about 3,000 words, at most, with supporting detail in an appendix.

**29. A question the reader will ask, left unanswered.** Read the draft against
the six question types below and answer each one that applies.

**30. A setback left unstated.** State what went wrong, what has been done, what
remains, and the change to the process. Name no person.

The sections below explain the checks and give the worked examples.

## The standard

Documentation is written in **third-person impersonal**, the register of
specifications and reference manuals. ISO/IEC Directives Part 2 requires it for
International Standards, for one reason: a document states what is required, and
it does not describe one person's preferences.

A reader arriving at documentation has no access to the conversation that
produced it. Every sentence must stand without that context. Assume the reader
is new to the topic, and state the background a newcomer needs before the
detail.

Two further standards supply what the register does not.

**ASD-STE100 (Simplified Technical English)** supplies sentence construction:
one idea per sentence, active voice with the subject first, one word for one
meaning, no figurative language, and no semicolon. Checks 7 and 9 to 13 state
those rules. Rule 8.1 bans the semicolon and permits every other standard
punctuation mark, the em dash included. The standard is a controlled language
for aerospace maintenance manuals, and its dictionary is licensed and absent
here, so its vocabulary rules apply as a direction toward the plainest
available word.

**Google's developer documentation style guide** supplies the mechanics. It is
published under CC BY 4.0 at <https://developers.google.com/style>.

1. Sentence case in every heading, label, and list item. Capitalise the first
   word and any proper noun, and nothing else.
2. Present tense for what the program does. The future tense is reserved for an
   event that follows a delay the reader notices.
3. The imperative for a step, with the condition before it. Check 19 states
   this.
4. No politeness word and no difficulty word in a step. Check 20 states this.
5. Code font for a code term, spelled as the program spells it: `--force`,
   `read.ts`, `state_redirects`.
6. No abbreviation that the reader may not know. Where one is needed, expand
   it at first use, and use the short form after that.

One rule of the guide is declined. Google requires second person, and check 6
removes it. A skill file, a specification, and a plan are read by people who
took no part in the conversation that produced them, and the impersonal
register holds. The imperative *you* inside an instruction stays, which is
where the two standards agree.

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
decided what. State the rule. The one exception is the owner of an action in a
strategy document. See "Strategy documents" below.

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

Documentation is prose, so these apply on top of the register. Each one is an
ASD-STE100 rule, restated for a document:

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

Mannered prose substitutes metaphor and flourish for direct statement: *"a dial
worth turning"* for *"a parameter worth varying"*, *"this point earns its keep"*
for *"this point still matters"*. The writer chose the phrase to be admired for
it, and readers notice. The reader does more work so the writer can perform. The
sentence is also less precise: a metaphor adds connotations the writer did not
choose and cannot control. Say what you mean. When a literal phrase is
available, use it.

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

## Numbers and figures

Checks 21 to 25 apply to every number and every figure, in every document.

### A number carries its context

A number alone gives the reader nothing to compare it with. State the baseline,
the period, and the cause. Where the number is a percentage, give the absolute
values beside it.

| Before | After |
|---|---|
| "Spend fell 50%." | "Spend fell 50%, from $1M to $500K a year. Retiring the legacy billing service saved $350K. Moving the batch jobs to smaller instances saved $150K." |
| "Engagement increased hugely." | "From 2 to 28 January, the onboarding guide increased weekly use of saved views by 23%. The increase came from 1,760 existing users and 257 first-time users." |

### Precision the reader does not need

Round to the precision that can change a decision. Extra digits make a number
harder to remember and change nothing.

| Before | After |
|---|---|
| "Usage grew 32.47% this quarter." | "Usage grew 32% this quarter." |

### A fact that changes nothing

An exact number about a small thing is still trivia. A 50% saving on a $200
subscription changes no decision, so delete the sentence.

### A figure needs a sentence

A chart or a screenshot shows data. It does not state the conclusion. Put the
conclusion in a sentence beside the figure. Where the sentence makes the point
without the figure, link to the figure or move it to an appendix.

## Answering a question

Start with the core answer. Where the reader needs context, add it after the
core answer. Every answer starts with one of five core answers:

1. **Yes or no.** "No. The migration cannot run during business hours."
2. **A number.** "98%."
3. **A date.** "The rollout completes on 1 October."
4. **A numbered list.** "Two causes delayed the release: 1) three engineers
   worked on an outage for six days, and 2) the specification omitted the export
   requirement."
5. **Not yet known, with the follow-up.** "Not yet known. The load test on 14
   March gives the answer."

The five core answers are adapted from the Precision Questioning and Answering
method.

## Decision documents

A team reads a decision document to make a decision or to record one. A memo, a
proposal, a status update, a strategy document, and an incident review are
decision documents. The
register and checks 1 to 26 apply in full, and checks 27 to 30 add the rules
below.

### Paragraphs carry the argument

A list states claims with no connection between them. A decision depends on the
connection, so write the argument in paragraphs. A list holds steps, or items
that are parallel and independent, such as the options under comparison.

### Length

One page, about 500 words, where the content allows. A strategy or a major
decision can take up to six pages, about 3,000 words. Supporting data, method,
and raw figures go in an appendix, outside the limit.

### The parts, in order

1. **The decision asked for**, and the reason it is needed now.
2. **The context** a reader new to the topic needs.
3. **The analysis**: the evidence, the causes, and the options.
4. **The recommendation or the action**: what happens, when, the role
   accountable for it, and the result expected.
5. **For a setback**: what went wrong, what has been done, what remains, and the
   change to the process.
6. **Appendices**: the supporting detail.

Part 1 answers the first question a reviewer asks: whether the topic is the
best use of time now.

### Answer the questions before a reviewer asks them

Before saving, read the draft as a reviewer and answer each question type that
applies. The question types are adapted from the Precision Questioning and
Answering method.

| Question type | A reviewer asks | Check the draft for |
|---|---|---|
| Clarification | What does this mean? | An ambiguous term, a vague quantity, a term two readers can define differently, and a number with no unit, baseline, or trend |
| Assumptions | What does the document take for granted? | That the thing exists, that there is exactly one, that it is possible, that it has value, that the reader shares the view, that the grouping is correct, that two things are alike, and that the situation stays the same over time |
| Evidence | How is this known? | The source and its credibility, the sample, the collection method, the analysis method, and outliers |
| Causes | Why did this happen? | The trigger, the mechanism, the sequence of effects, and the root cause |
| Effects | What are the consequences? | Who is affected, over what period, the best, worst, and likely cases, unintended effects, leading and lagging indicators, and risk |
| Actions | What happens next? | What the action delivers, when, the role accountable, the dependencies, and the step that prevents a recurrence |

### State a setback

A decision document about a setback states the mistake directly. Make the
system, the process, or the decision the subject of the sentence, and name no
person. Then state what has been done, what remains, and the change to the
process that prevents a recurrence.

| Before | After |
|---|---|
| "Unfortunately, some issues arose during the release." | "The release skipped the database migration, and checkout failed for 40 minutes." |
| "[Name] forgot to run the migration." | "The release checklist had no migration step. The checklist now has one, and the deploy script stops when a migration is pending." |
| "Lessons were learned." | "Every release now runs its migration in staging first." |

Check 16 still applies to a change document. A defect introduced and fixed
inside one branch never reached a reader, so a pull request body omits it. A
setback reported in a decision document affected a team or a customer, and the
document states it.

### Strategy documents

A strategy document commits a team to a direction and to a set of bets. The
rules above apply, with these additions.

- **The thesis is the opening heading.** Write it as a complete claim in
  sentence case: "Churn cannot fall until churn is measured." The heading is the
  executive summary, so omit a summary section and any sentence such as "this
  document outlines".
- **A reframe states the diagnosis.** Where the argument rejects a wrong
  diagnosis, state both diagnoses once: "The retention problem is not a support
  problem. It is a measurement problem." Use the reframe for the diagnosis only,
  and never for emphasis.
- **A hypothesis is a causal if-then claim with a number.** "If account managers
  see the health score, churn in the low-score segment falls 10% in two
  quarters." The evidence for the hypothesis follows it.
- **Each bet is a block of bold labels.** Each label is followed by a sentence or
  a short paragraph, in this order:
  1. **Hypothesis**
  2. **Evidence**
  3. **What [team] delivers**, with the owner of each deliverable
  4. **Effect on the company**
  5. **Measuring success**, with a numeric target
  6. **Milestones**, as calendar markers: `**April:** [Milestone]`
- **A decision is justified by its consequence.** Tie each decision to its effect
  on a customer or on the business. Delete a reason such as "cleaner" or "more
  elegant", or replace it with the consequence.
- **An equation heading states a comparison.** "Effectiveness > Experience". Use
  one only where the claim is exact in that form.
- **An owner is a first name or a role.** "Quality index: [First name]". The
  exception in check 1 covers this use only.
- **A dependency names the team and the work.** "Dependencies: Support
  (facilitation), Product (process changes)."
- **A customer quote is verbatim, in italics, and attributed by role or
  segment.** *"This call should have been transferred to us"* (a customer in the
  legal vertical). Do not paraphrase a quote. Check 15 exempts the quote from the
  other checks.
- **A table holds a comparison**: goal to role, segment to objective to
  evidence. Use a list or a paragraph where nothing is compared.
- **The last section states what becomes possible.** Name the questions the team
  can answer, or the work that can start, once the strategy is in place. Make no
  claim about wider significance.

## Quoted examples are exempt

Quoted material is reference. Do not rewrite it.

This includes verbatim quotations, before-and-after example pairs, banned
phrases named by a rule, code samples, and command output. A rule that bans
"earned its keep" has to print those words to be usable.

Where a quotation contains a personal name and the name is not the point,
replace it with a bracketed placeholder such as `[Name]`. Where the name is the
point, such as an example showing why a quotation cannot be published, keep the
placeholder and say why it is there.

## The two checks from Google's style guide

**19. A condition placed after its instruction.** Read every sentence that
states a step. If a condition limits that step, the condition goes first. The
reader tests the condition and then acts, and no step is read twice.

- *"Run the migration if the backup finished"* → *"If the backup finished, run
  the migration."*
- *"Pass `--force` when the baseline came from another model"* → *"When the
  baseline came from another model, pass `--force`."*

The rule covers a clause naming a version, a permission, an operating system,
or a step that must already be done. A condition governing a whole procedure
takes its own sentence before the first step. Taken from Google's developer
documentation style guide.

**20. A politeness word or a difficulty word in a step.** Delete *please* from
an instruction. Delete *simply*, *just*, *easy*, and *quickly* where they
describe a step: each one states how hard the reader will find the work, which
the writer cannot know. Read the first word of each sentence in a paragraph,
and rewrite the second of any two that match. Taken from Google's developer
documentation style guide.

## The compact checks file

`checks.md` beside this file states the same thirty checks in one line each.
It is short enough to inject on every turn, where this file is long enough that
a session loads it once. Edit both together, and confirm the two agree.

## Editing this file

Every edit to this file runs the thirty checks over the whole file, including
the text the edit did not touch.
