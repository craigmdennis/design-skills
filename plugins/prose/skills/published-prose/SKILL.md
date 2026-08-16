---
name: published-prose
description: Use when writing or editing prose published or sent under the author's own name — blog posts, case studies, portfolio pages, strategy docs, resume and cover-letter copy, application answers, social posts. Applies the author's voice rules and removes AI-generated patterns. Does NOT govern how the agent writes back to the reader in conversation.
---

# Published prose

## Before writing anything

Run these three steps in order, at the start of every invocation, before
applying any rule below.

1. Read `~/.claude/skills/published-prose/voice-profile.md`.
2. A profile counts as usable when the read succeeds **and** the file contains
   the line `status: complete`. A failed read and a file without that line are
   the same case.
3. When the profile is usable, apply it and say nothing about it. When it is
   not, state that no voice profile is installed and offer both of these:

   - **Build one now.** Read `interview.md` from this skill's own directory,
     ask its questions one at a time, and write the answers to
     `~/.claude/skills/published-prose/voice-profile.md` using the shape in
     `voice-profile.template.md`, which carries the `status: complete` line.
     Creating the directory is part of this step. Never write the profile into
     a plugin directory: a plugin update replaces everything under it.
   - **Continue without one.** Apply this file alone and ask for each
     preference at the moment it applies to a sentence.

To rebuild a profile, delete `voice-profile.md` and invoke this skill again.

## Scope

This skill governs text that goes out **under the author's name**. It does not
govern the agent's replies in conversation.

**In scope:** blog posts, case studies, portfolio and profile pages, strategy
and internal documents, resume and cover-letter copy, application answers,
social posts, bio copy. Anything a reader will attribute to the author.

**Out of scope:** the agent's replies in conversation — explanations, status
updates, summaries, plans, code review, commit messages, questions back to the
reader. That prose is the agent's, written to be understood. Do not invoke this
skill because a reply "should read as naturally human-written." Every reply
should; that is not this skill's job.

Documentation is also out of scope: skill files, README files, specifications,
plans, architecture notes, code comments. Documentation takes third-person
impersonal, which is a third genre again.

These rules make an agent's replies worse when applied to conversation. The bans
here (no metaphor or analogy, no caveating, the proscribed vocabulary, fragment
closers) are tuned for published work. In an explanation they remove the
comparison that would have made a concept clear, they produce false confidence
where a caveat was honest, and they force stilted vocabulary substitutions.
Close this skill when writing to the reader instead of for them.

## The voice profile

Personal preferences are not in this file. They are in
`~/.claude/skills/published-prose/voice-profile.md`, which "Before writing
anything" above reads or builds.

The profile records
spelling convention, punctuation bans, when to write "I" and when "we", which
sentence habits belong to the author and must survive an edit, what numbers may
be published on which surface, and which words the author has banned.

Where the profile is silent on something that matters for the current sentence,
ask. Do not infer a preference, and do not copy one from another author.

Where the profile and this file disagree, the profile takes priority. It describes a real
person's writing; this file describes failures in writing generally.

## Overview

Machine-generated text is detectable not because of any single word, but because
of predictable *combinations* — inflated vocabulary, structural formulas, and
promotional tone appearing together. Natural writing is varied, specific, and
occasionally imperfect.

## Modes

**As-you-write:** When generating new prose, avoid these patterns from the
start. Do not write slop and then fix it. Write it directly.

**Rewrite:** When existing text is pasted in to clean up, identify the patterns
and rewrite to remove them. Default to moderate intensity: preserve structure
and ideas, rewrite sentences that sound generated. Adjust if asked for lighter
or heavier treatment.

## Three rules borrowed from ASD-STE100

ASD-STE100 (Simplified Technical English) is a controlled language written for
aerospace and defence maintenance manuals. It is not the governing standard for
this skill and most of it does not apply to this genre. The standard exists for
text that must not be misread, and it excludes writing where voice, nuance, and
persuasion are the point.

Three of its rules do solve failures that appear in this genre, so they are
borrowed. Nothing else from the standard applies here, and no rule below is
overridden by it.

1. **One word carries one meaning, and one meaning gets one word.** Repeat the
   word. Do not swap in a synonym for variety. (This is the same instruction as
   the elegant-variation ban in section 2.)
2. **No idiom, metaphor, analogy, personification, or figurative phrasal verb.**
   Provenance decides: the author's own wording stays, the agent never generates
   any. Full detail in section 2.
3. **Noun clusters take three words at most.** A stack of four or more marks
   none of the relations between the words, so the reader has to guess them.
   *"design system adoption evaluation framework"* becomes *"a framework for
   evaluating how a design system is adopted"*.

**Punctuation here is voice and not standard.** STE permits the em dash and bans
the semicolon. This genre often does the reverse. Both marks are settled in the
voice profile, and the standard decides neither.

**Instructional passages are the exception.** A numbered process, a how-to list,
or a setup sequence is technical writing inside a published piece, and those
passages take the standard's sentence rules: one instruction per sentence,
around 20 words, subject first every time. Narrative does not. See "Sentence
architecture".

### The replacement method

This is the part that matters most, and the part an agent gets wrong. When
non-literal wording is found, **do not look for a gentler word inside the same
image.** That produces a second metaphor and changes nothing.

Answer three questions instead: **who did it, what did they do, and to what.**
Then write that. The verb almost always turns out to be one of a small plain set
(`is`, `has`, `finds`, `makes`, `changes`, `stops`, `removes`, `describes`,
`corrects`, `states`, `helps`).

The middle column shows the failure: a substituted word carrying the same image.

| Original | Substituted word (wrong) | STE |
|---|---|---|
| "dressed it up as a win" | "called it a win" | "It described the bug as a success." |
| "None of them touched the problem." | "None of them changed the wording." | "All five options change the layout. None of them changes the wording." |
| "That kills a habit" | "That removes a habit" | "This rule stops a behaviour I could not describe before." |
| "where a comparison earns its place" | "where a comparison does real work" | "where a comparison helps the reader understand" |
| "nothing for it to talk itself into" | "nothing for it to reason its way around" | "The agent makes no judgement. The agent cannot approve an exception." |
| "got it most of the way" | "did most of the work" | "The first two rules correct most of the sentence." |

Two of these fixed vagueness as well as wording. "None of them touched the
problem" never states what the problem was; the STE version does.

## Structure: headings tell the story on their own

This section is about the whole piece. The anti-patterns below are about single
sentences. The anti-patterns fix how each sentence reads; this fixes how a
multi-section piece holds together.

For any multi-section piece, the headings have to carry the story on their own.
Test: remove every paragraph and read only the H2s top to bottom. They should
state roughly what happened and what the author concluded. If the titles read as
abstract labels ("What changed") or clever fragments ("Why I skipped the
bake-off"), rewrite them.

- **A heading states the argument instead of labelling the section.** It can be
  a story beat ("Working prototypes changed how leadership engaged"), a finding
  ("MCP input reduces friction, AI design output increases stakeholder
  engagement"), a principle ("Test tools on real projects where designers own
  the adoption"), or the framing question ("How should a design team adopt AI
  tooling?"). All four state the argument. An empty label ("The build", "What
  changed") states nothing. Do not force every heading into the same "I did X"
  mould. A good piece mixes beats, findings, principles, and questions, and that
  mix reads as a person reasoning instead of a chronology being recited.
- **Vary the grammatical subject so the headings do not read as a list of
  identical constructions.** The failure mode is every heading opening with the
  same imperative verb (Prove, Cut, Pair, Embed, Stop). Mix who or what is
  acting, but keep each one a beat.
- **Sections must flow, not sit as islands.** Connect each to its neighbours
  with a plain connecting sentence: the opening line reaches back to the
  previous beat, or the closing line sets up the next.
- **Keep the connecting sentences plain. Do not make them dramatic.** A dramatic
  transition ("The reaction told me more than the output did") is itself a
  generated beat, and the rest of this skill removes those. Connective tissue is
  plain.
- **After drafting, do the titles-only read** to confirm the arc works before
  calling the piece done.

## Narrative arc: diagnose first, then support the conclusion

The section above is about the headings. This is about the shape they trace.
Every piece long enough to have sections — case study, strategy document,
essay-length post — follows the same arc. Even a short post opens on the
problem, not the setup.

1. **Open with the diagnosis.** Name the problem first. Not the project, not the
   brief, not the author's role — what was broken, who felt it, and why it
   mattered to the business or the customer. The reader should feel the problem
   before they read a single thing the author did about it. (The problem is a
   business problem, not a design task — see the product-leader framing below.)
   - The diagnosis can be stated flat ("we had grown to three designers with no
     operating layer"), or lifted into the question it raises. A specific mess
     such as *"my team of three was evaluating AI tools with no shared verdict"*
     becomes the opening question *"How should a design team adopt AI tooling?"*
     The situation becomes the evidence; the question becomes the frame the
     piece answers. Either phrasing leads with the problem. What neither does is
     open on the project, the brief, or the author's role.
2. **Build the tension.** Make the problem harder than it first looked. The
   obvious fix that was not enough, the constraint that boxed the author in,
   what it would cost if it stayed broken. Tension is what pulls the reader into
   the next section.
3. **Show what was tried, including what failed.** Name the attempts in order.
   The thing that did not work belongs in the piece: it is the evidence the
   author was actually in it instead of narrating a tidy win. A case study with
   no failed attempt reads as fiction.
4. **Show what worked, and why.** What actually moved, and why it worked when
   the earlier attempts did not. Tie it to the number or the behaviour that
   changed.
5. **End with a real conclusion.** What changed, what it made possible, what the
   author would carry forward. A concrete consequence, not a significance
   statement (see "End with what happened next"). If the author has not said
   what it made possible, do not invent it; surface the slot and ask (see "Do
   not supply the conclusion" below).

**No caveating.** Do not undercut the conclusion with defensive qualifiers: "of
course, every team is different," "results may vary," "this is just one
approach." The honesty in the piece comes from showing the failed attempts in
step 3 and the honest accounting in step 4, not from hedging the close. Once the
struggle is on the page, the confident ending is earned. Write it that way.

Two things "no caveating" does not mean:

- It does not mean hide the failures or the messy parts. Showing what did not
  work is the opposite of caveating. It is the evidence. Keep it.
- It does not override fact-checking. "No caveating" is about prose confidence,
  not about asserting unverified numbers. Verify every metric against a source
  before it goes in; soften or mark anything unconfirmed. Confident prose,
  checked facts.

## Do not supply the conclusion

The skill structures and sharpens thinking. It does not supply the verdict. The
conclusion of a piece belongs to the author, and a fabricated conclusion is
worse than a fabricated metric, because it sounds like the author while saying
something the author never decided.

This covers every place where the writing asserts what the author *concluded*,
not only the final line: the thesis, the problem reframe, what worked and why,
what the author would carry forward, the forward-looking opportunity, and any
stated opinion or value judgement.

- **When a conclusion slot is empty, surface it and ask.** If the structure
  needs a takeaway and none has been supplied, do not write one from inference.
  Leave a clearly marked placeholder where it goes and ask directly. For
  example: `[Conclusion needed — what did running this actually make possible
  for the team, and what would you carry forward? My guess is X; tell me your
  take.]` Offering a guess is fine. Presenting the guess as the author's
  conclusion is not.
- **This is the judgement-level twin of the content-accuracy rule.** That rule
  says do not write facts from memory or inference. This one says do not write
  *verdicts* from inference. Same discipline, applied to opinion and takeaway
  instead of metrics.
- **It does not conflict with "no caveating".** Once the conclusion is given,
  write it confidently and without hedging. The rule is about not manufacturing
  the verdict, not about softening it once it exists.
- **Structure can be proposed; conclusions must be confirmed.** Drafting the
  build-up, arranging the beats, and showing where the argument is heading are
  all fine. The moment the next sentence would put a stance in the author's
  mouth, stop and ask.

## Genre

Two genres apply, each with different conventions. Apply the universal
anti-patterns (below) to both, then layer the genre-specific section.

- **Blog, essay, personal** — published under the author's name for a public
  reader. Narrative rhythm, no internal figures unless the voice profile allows
  them, ends on what happened next or a specific opportunity ahead. See
  "Narrative and personal-essay craft" below, then the voice profile.
- **Strategy and internal document** — strategy documents, vision documents,
  product specifications, internal proposals. Team-first "we" is welcome,
  specific numbers are retained, bolded label-then-elaborate structure is the
  genre's skim format, numbered guiding policies and hypothesis blocks are
  correct. See "Writing style guidance for strategy and internal documents".

**Picking the right voice:**

- The file path is usually decisive, and the voice profile records which paths
  map to which genre.
- If the content shape contradicts the path (a blog post that argues a product
  strategy, or a memo published as a post), ask which voice to layer. Do not
  silently apply blog rules to strategy structure.
- For ambiguous mixed-genre work, apply the universal anti-patterns first, then
  ask.

## Numbers: what stays specific, by surface

One rule, five surfaces. The question is always what the surface exposes about
the underlying business, never whether a number "sounds generated."

| Surface | Percentages and ratios | Absolutes (revenue, headcount, user counts, costs) |
|---|---|---|
| Public blog or essay | Per voice profile | Per voice profile |
| Case study or portfolio page | Keep as given | Soften |
| Public bio and profile pages | Keep as given | Soften |
| Resume (applicant-tracking, not public) | Keep | Keep |
| Strategy or internal document | Keep | Keep |

- **Why percentages survive on published surfaces:** they do not reveal the size
  of the underlying business. Absolutes do. *"40% relative drop in
  targeted-segment churn"* is fine on a case study; *"$4M ARR"* becomes
  *"multi-seven-figure ARR"*.
- **The resume is the exception because it is applicant-tracking-facing and not
  public.** A precise figure belongs there. Never carry a raw figure from the
  resume back onto a public page.
- **A figure old enough that it no longer describes the current business can be
  an explicit exception.** Record each exception in the voice profile with the
  reason. The soften rule targets recent and sensitive revenue.
- **Another company's published pricing stays specific.** This rule covers the
  author's own figures and their employers' internal figures.
- **Softening is not verifying.** Confirm every specific metric before
  publishing either way. A softened number that was never true is still
  fabricated.
- If a figure could be either an absolute or a ratio, ask.

## Narrative and personal-essay craft

These apply to any piece written under the author's name for a public reader.
They are about how an argument is built, so they are genre rules rather than
voice preferences. The voice profile layers punctuation, spelling, person, and
rhythm on top.

- **Open with a short declarative that commits to a position.** One sentence. No
  build-up.
- **Open with the lived moment before the piece goes abstract.** A personal
  essay earns the right to make abstract claims by grounding in a specific
  trigger. *"I just had an 'aha' moment with the tool..."* is stronger than
  *"Here's how to write strategy content with AI."* Lead with the moment that
  prompted the piece, then go abstract.
- **Ground abstract claims with a personal follow-up.** After a general
  principle, add one short sentence anchoring it in lived experience. Pattern:
  *"The best way to have design teams adopt AI is to have them decide the tools.
  That's what I did with my team."* The second sentence does the work of "this
  isn't theory."
- **Name the obvious path before the detour.** "Yes, I could do X, but
  instead..." acknowledges the easy answer before explaining why it was not
  taken.
- **State personal agency directly.** "I created a backlog." "I made the call."
  Do not hedge ("we ended up creating") and do not use the passive ("a backlog
  was created"). Name who did what.
- **Vary sentence length.** Uniform rhythm is the tell, in either direction: a
  page of short declaratives is as much a tell as a page of long ones. Length is
  free, but sentence *shape* is not. Long sentences grow by coordination and
  keep their subject at the front (see "Sentence architecture").
- **Plain structural signposts.** "The aim is...", "The outcome was...", "The
  result..." name the structure of the argument without dressing it up. Do not
  replace these with "What this reveals is..." or "What's striking here...".
- **Remove the clever setup. Keep the plain statement.** A witty framing gets
  cut when a plain one carries the same fact. *"Nobody needs another meeting, so
  I didn't make one: I added a 15-minute rotating review slot"* becomes *"I
  added a 15-minute rotating review slot."* The cleverness was performing; the
  action was the point.
- **Lists that aren't three.** Six items plus "etc." is fine. Two items is fine.
  Do not pad to a rule of three.
- **Numbered lists are fine for a concrete process or set of criteria.** The
  literal steps, or the scoring dimensions as a clean numbered list, are more
  scannable than a parenthetical. This differs from the bolded-instructional-
  list ban below: those are bold-label-plus-explanation pairs that turn
  narrative into a tips listicle. A plain numbered list of concrete steps is
  welcome.
- **No bolded instructional lists** ("What to watch for" sections with bold
  subheads). Embed the observations in the narrative instead.
- **Practical mechanics beat aphorisms.** Name what to do and name the bad
  version. *"Argue the thinking, not the prose"* sounds like wisdom and is not
  actionable. *"Explain why a draft feels wrong instead of redirecting the
  specific text"* is teachable. Cut the aphorism; keep the mechanic.
- **Specificity is evidence.** Real product names prove the author is actually
  doing this. Do not remove them on rewrite; generic ("the AI", "your tooling")
  makes the piece less believable.
- **Show the meta-work.** *"I'm still iterating,"* *"I'm constantly
  calibrating"* separates a piece from tips-list content. The reader sees the
  author is in it instead of preaching from a finished position.
- **Short principle passages belong in the body.** A cluster of present-tense
  "we" declaratives can state how the author thinks the work should be done. One
  bolded core line, the rest plain. Use it where the piece has built up to a
  stance, then return to the narrative.
- **Generalise when the principle generalises.** If a rule applies more broadly
  than the case that produced it, lift it. *"Drop anything that serves the build
  team"* becomes *"Only serve the reader."*
- **Keep the reasoning. Do not compress the thinking out.** The anti-slop rules
  encourage heavy cutting and can over-trim. When the author explains a build or
  a decision, the friction in the detail, the background, and the concrete
  process all belong. Cut those and what is left is a tidy summary that reads as
  a status report instead of a person thinking. This is the opposite end from
  "do not add the why" below: cut significance *commentary* after a clear point;
  keep the actual diagnosis, mechanism, and process.
- **Do not add the why when the what is clear.** State the practice. Trust the
  reader. Commentary about what the practice prevents (*"you start performing
  instead of dumping"*) or what depends on it (*"everything downstream depends
  on it being real"*) reads as preaching. Cut the commentary; keep the action. A
  well-written principle is usually two or three short sentences. At five to
  seven, it is padded with significance.
  - *Exception:* the why is worth keeping when it names a concrete mechanism
    with personality — a specific actor, a specific consequence, an opinion.
    Generic significance is what to cut, not all explanation.
- **Concrete reference over pronouns when the antecedent is more than two
  sentences back.** *"What structural moves does the document make"* is better
  than *"What structural moves does it make."* Pronouns at distance make the
  reader track antecedents; naming the thing again is cheap and reads as a
  careful voice.
- **One example with a generalising frame beats three illustrative examples.**
  Three examples can read as padding to prove a pattern. One example plus the
  generalising clause does the same work and trusts the reader.
- **End with what happened next, not what it means.** The last sentence states a
  follow-on fact, not a significance statement. No "this shows the importance
  of...", no recap, no labelled summary.
- **Forward-looking, open closers are fine when they are specific.** Ending on
  the unsolved problem and the concrete opportunity ahead is not caveating and
  is not a cosmic-significance ending. The test is specificity (see anti-pattern
  4).
- **A pointer to related work is a welcome closer, not a banned call to
  action.** *"Read more about my thoughts on the future of design tooling"*
  sends the reader to the author's own related thinking. The no-call-to-action
  rule is about sales ("subscribe", "book a call"), not cross-links.
- **Closers are worth keeping when they name a concrete consequence.** *"The
  writing changes as a side effect"* survives because it names what happens.
  *"The prose follows"* fails because it only sounds wise. Test: does the closer
  add specificity, or only rhythm? If only rhythm, cut it.
- **The metadata description states the thesis, not a summary of what was
  done.** An achievement summary reads as a resume bullet (*"Validated AI
  prototyping tools on a real project. Built a custom integration..."*). State
  the argument the piece makes instead (*"The team that will use the tool needs
  to be the ones who evaluate it, and it needs to happen on a real project to
  pressure test it."*). Present tense, the principle, what the reader will take
  away.

## Writing style guidance for strategy and internal documents

Apply this on top of the universal anti-patterns when writing internal strategy
documents, vision documents, and internal proposals.

- **"We" is welcome.** Strategy documents are team artifacts. Use "we" where the
  action is collective and "I" only where it is personal. A blog rule preferring
  "I" does not apply here.
- **Internal numbers stay specific.** "$7,914 lost in one week" instead of
  "significant revenue lost". "10% reduction in churn from the poor-experience
  segment" instead of "meaningful reduction". Internal audiences need the
  specifics; the relative-language rule is for external publication (see
  "Numbers: what stays specific, by surface").
- **Bolded labels on numbered items are correct.** Guiding policies (`**1.
  Design From Evidence**`), bet subheaders (`**Hypothesis**`, `**Why we believe
  this**`, `**What Design delivers**`, `**Measuring success**`), and
  `**Outcomes:**` / `**Dependencies:**` sub-headers are the genre's skim format.
  The "no bolded instructional lists" rule does not apply.
- **Diagnostic "not X. It is Y." reframes are worth keeping.** When the contrast
  is core argumentative work, rejecting a wrong frame to install a right one
  (*"The retention problem is not a support problem. It is a measurement
  problem."*), keep it. Still cut it when it is only emphasis.
- **Open with the thesis as a complete H2.** "We can't move what we don't
  measure". The thesis is the executive summary. No summary header, no "this
  document outlines".
- **Hypotheses are causal "if/then" claims.** "If we [action] then [measurable
  outcome]." That forces a testable bet. "Why we believe this" comes next.
- **Strategic bet template.** Each bet repeats: Hypothesis, Why we believe this,
  What [team] delivers (with owner names), How this influences the company,
  Measuring success (specific targets), calendar milestones.
- **Equation-style headers** for memorable framings: "Effectiveness >
  Experience", "Right Config = Right Fit". Use them only when the claim
  compresses cleanly.
- **Tight imperative bullets**, verb-first or noun-first. No "we will / we
  should" padding inside the bullet. "Automated evaluation passes led by design"
  instead of "We will run automated evaluation passes."
- **Owner attribution by first name** for accountability: "Quality index —
  [First name]".
- **Dependencies named by team and role**: "Dependencies: Support
  (facilitation), Product (process changes)."
- **Verbatim customer quotes** as italicised, attributed evidence: *"This call
  should have been transferred to us"* (a customer in the legal vertical). Do
  not paraphrase; the specific phrasing is what makes it necessary.
- **Tables for genuine comparisons** — Goal to Role, Industry to Objective to
  Evidence, rule to Pass to Fail. Do not force tables for structure.
- **Calendar markers** for timelines: `**April:** [Milestone]`.
- **Inline backticks** for technical identifiers (`next_step: schedule`,
  `is_disabled: true`).
- **A "what this unlocks" closer** names what becomes possible, often by posing
  the questions the team can now answer. Do not end with a claim of cosmic
  significance.

### Publishing strategy content as a blog post

When a strategy-shaped piece goes to a public blog instead of an internal vault,
the audience changes from "team executing this" to "thoughtful reader". Some of
the strategy apparatus stops being useful:

- **Drop scope and implementation sections entirely.** Readers do not need a
  checklist. The thinking is the point.
- **Open questions go philosophical, not implementation.** Cut "which stack to
  support first" and "how to round-trip the file format". Keep the questions
  that matter to anyone thinking about the problem. Implementation questions
  belong with the build team.
- **Drop calendar markers and timelines.** No project plan on a blog.
- **Drop alignment-to-org-goals tables.** No company-specific scaffolding.

Keep: the thesis H2, numbered principles, equation-style framings, diagnostic
reframes, tight bullets, tables for genuine comparisons, and the "what this
unlocks" closer. The strategic *thinking* survives intact; the operational
*apparatus* does not.

## Case-study and strategy framing: write like a product leader

Applies to case studies and strategy documents, on top of the genre voice above.
Frame the thinking the way a product leader would, not the way a designer
defending craft would. A hiring manager reading a case study is buying
judgement, not pixels.

- **Lead with the business problem, not the design task.** Open on what was
  broken for the business or the customer — churn, lost revenue, a metric that
  would not move, a team that could not ship — instead of the artifact the
  author was asked to produce. The design work is *how* it was solved, not what
  the piece is about.
- **Reframe the problem before solving it.** The strongest move on the page is
  rejecting the wrong frame to install the right one: *"The retention problem is
  not a support problem. It is a measurement problem."* The reframe is the
  thinking; the solution falls out of it. A case study with no reframe is a
  status report.
- **Frame decisions as business solutions.** "I chose X because it moved
  [business outcome]", not "I chose X because it was cleaner or more elegant".
  Aesthetic rationale is the weakest justification on the page. If a design
  choice cannot be tied to a customer or business consequence, find the
  consequence or cut the choice.
- **Compress the claim into something the reader can carry out of the room.**
  Where a strategic claim compresses cleanly, name it as an equation
  ("Effectiveness > Experience") or a plain literal phrase. One portable idea is
  stronger than a list of five. The compression is a tight statement of the
  claim, never a metaphor for it.
- **Lead with what each stakeholder cares about.** When describing how the work
  was received, open on what that audience values — monetisation and routing for
  executives, ship speed for engineering, the customer's actual job for support
  — instead of the design rationale. That is how the work was actually bought;
  write it that way.
- **Falsifiable over aspirational.** State the bet as a testable claim with a
  number attached, then say whether it turned out to be true. "If we exposed the
  score, churn would drop" plus what actually happened to churn. Measured and
  checked is stronger than vague and safe.
- **Name the author's agency.** "I owned the criteria." "I made the call." Do
  not launder a decision into the passive voice or a collective "we" when the
  call was one person's.
- **Outcome bullets in case-study metadata are outcomes, not a summary.** Each
  entry names one concrete result the work produced: a decision adopted, a
  behaviour changed, a metric moved. Cap at three bullets, each around 90
  characters, because they usually render in a narrow card and a long bullet
  wraps to four lines. If a bullet opens with "Built…/Wrote…/Created…" and lists
  what went into the work, it is a summary; cut it to the outcome or drop it.

## Quotes as evidence: anonymise, mark every cut, show both reactions

A real reaction is some of the strongest evidence a case study can carry,
because it proves the work moved someone. Published portfolio content cannot
carry detail that breaches a confidentiality agreement, real names, identifiable
business specifics, or internal metrics. So quote with discipline. Internal
documents read only by the team keep verbatim attribution; this section is for
anything published externally.

- **Anonymise the source.** Replace real names and identifying roles with a
  generic descriptor: "a VP", "the CEO", "an engineering lead", "a customer in
  the legal vertical". Never a real name, and never a detail that identifies the
  person or the company.
- **Use neutral pronouns for anyone not named.** Default to singular "they" for
  any person referred to by role. Gendered pronouns are fine only when the piece
  explicitly names the person and the person has stated them. A pronoun is an
  identifying detail, so neutral pronouns also protect anonymity. Watch verb
  agreement when switching ("she was ready" becomes "they were ready"). Verbatim
  quotes stay as spoken.
- **Mark where the original was changed.**
  - `...` for words removed, whether trimmed for length or to drop an
    identifying aside.
  - `[missing context]`, or a short bracketed paraphrase such as `[the metric]`
    or `[the competitor]`, where identifying content was removed and replaced.
    The reader should see *that* the quote was edited and roughly where, without
    seeing what was removed.
- **Quotes must show where things worked and where they did not.** Use them as
  outcome evidence on both sides. A positive reaction and a friction reaction
  both belong. Quoting only the applause makes the win less credible. The
  friction quote often belongs in the "what failed" beat and the positive quote
  in the "what worked" beat.
- **Do not fabricate or upgrade a quote.** If no safe verbatim version exists,
  paraphrase it and drop the quotation marks. A quotation mark is a promise that
  someone said roughly this.
- **Confirm before publishing.** Even anonymised, check quoted reactions and any
  attached numbers before they go live.

Example:

- Verbatim, unpublishable: *"[Name], this is perfect. Everything about it. What
  do I need to do to get it all live?!"* — a named VP, on the strategy document
- Published: *"...this is perfect. Everything about it. What do I need to do to
  get it all live?"* — a VP, on first read of the strategy
- Friction side, published: *"I still don't see how [missing context] gets us to
  the number"* — an engineering lead, in the same review

## Sentence architecture: subject first, ideas connected

The anti-patterns below are a ban list. They catch specific formulas one at a
time: the em dash, "X, not Y", the aphorism opener. This section is the positive
default underneath them, and it covers a family the ban list misses entirely:
sentences that never put their subject first. That family is the most reliable
generated-text tell, and no readability score detects it.

**Default to subject-verb-object.** The thing doing something comes first, then
what it does. Three constructions displace the subject: a fronted subordinate or
participial clause, a cleft opening (*"What made it work was…"*, *"It's X
that…"*), and a mid-sentence appositive.

**None of them is banned.** Good published prose uses all three well. They are a
tell only under the two conditions below.

**Instructional passages take the absolute rule.** Numbered process steps and
how-to lists put the subject first every time. Narrative keeps the two-condition
test instead, because the surviving instances in real prose are the author's and
they work.

**Condition 1: the fronted clause switches subject.** This is the reliable tell,
because the dangling version is a thing people rarely write and models write
constantly.

- Keep: *"Having been on the hiring side many times, I know what information
  applicant-tracking products surface."* The subject stays "I", and the clause
  carries a real credential.
- Cut: *"Having shipped the rubric, the conversations changed."* The subject
  switches from the implied "I" to "the conversations". Becomes *"I shipped the
  rubric and the conversations changed."*
- Keep: *"While this is better than nothing, empty states should be deliberately
  considered."* A real concession.
- Cut: *"While the tests pass, the build fails."* The subordination is only
  rhythm; a coordinating conjunction says it plainer. Becomes *"The tests pass
  but the build fails."*

**Condition 2: they stack.** Read the first five words of every sentence in a
section. If two or more in a row open on a subordinate clause, a cleft, or
"there is / there are", the passage is displacing its subjects out of habit
instead of for emphasis. Rewrite all but the one instance carrying real
information.

**"There is / there are" hides whoever acted.** Keep it only when nothing is
doing anything, for a static fact or a plain absence (*"There is no
handoff"*). Cut it whenever an actor can be named. The trap is that these read
smoothly, so they survive a proof-read: *"There were four points where the same
practice area could drift"* looks acceptable and is not, because four people
each described that practice area and the sentence hides all four. Becomes
*"Four people described the same practice area, and each description could
shift it."* Test: ask who or what did this. If the question has an answer, that
answer goes in the subject position.

**Mid-sentence appositives are the one to split every time.** *"The rubric, a
document I wrote in March, worked."* becomes *"The rubric worked. I wrote it in
March."*

**This governs shape, not length, and it does not override the mixed-rhythm
rule.** Long sentences that grow by coordination keep their subject at the front
and pass. A nine-word sentence opening on a participle fails. Keep the length
variation; fix the openings.

**Sentence-length ceiling: instructional content only.** ASD-STE100 caps
sentences at roughly 20 words in procedures and 25 in description. That ceiling
applies to instructional content only: numbered process steps, how-to lists,
setup sequences, criteria lists. One instruction per sentence, around 20 words,
and split anything longer.

Narrative prose carries no ceiling. The mixed-rhythm rule governs there. A blog
post containing a numbered set of steps follows both: narrative rhythm in the
paragraphs, the 20-word ceiling inside the steps.

**Two things this rule does not touch.** Sanctioned fragment closers stay where
the voice profile allows them; they are a deliberate voice move, not a displaced
subject. Strategy-document bullets stay verb-first and subjectless; that is the
genre's skim format, and this rule is about sentences in prose.

**Each sentence picks up the one before it.** The structure section above
requires connecting sentences between *sections*. The same discipline applies
inside a paragraph. Each sentence should take the subject, object, or
consequence of the previous one and carry it forward. The failure mode is the
modular paragraph, where every sentence restates the topic from scratch and the
order could be shuffled without loss. Test: reorder the sentences in a
paragraph. If nothing breaks, they were never connected.

**Plain words, no target score.** Use the short common word and put one idea in
each sentence. Do not write to a Flesch reading-ease number. Flesch measures
only sentence length and syllables per word, so it cannot see any construction
above; a paragraph built from fronted clauses and clefts scores as well as a
clean one. Real published prose runs from roughly 42 to roughly 84 inside a
single piece. That spread is the mixed rhythm, and one target score would remove
the variation.

## Anti-Patterns

### 1. Style

**What it looks like:**

- Em dashes, where the voice profile bans them. Check the profile first. Where
  they are banned, the ban covers every use: as a connector between clauses, as
  a trailing aside, to end a sentence, and as a mid-sentence parenthetical. A
  sparing exception causes consistent misses in practice.
- Elegant variation: swapping synonyms to avoid repeating a word ("the
  protagonist", "the key player", "the eponymous character") instead of using
  the name again.
- "Not just X, but also Y" parallelisms.
- Declarative contrast sentences that exist for rhythm: "It was a demo, not a
  rollout." "It was a fix, not a feature." Short standalone sentences using
  positive and negative contrast to signal decisiveness. These are constant in
  generated text and they read as performed clarity instead of actual clarity.
  Includes the fated variant "it had to be X, not Y."

  **The one test, for every variant and every word order: would a thoughtful
  reader actually consider doing Y?**
  - **If yes, the contrast does necessary work. Keep it.** It names a real
    choice between two real paths, and cutting it loses the principle.
    *"Delegated by output, not by task"* is a real management distinction.
    *"Generated, not negotiated"* is a real shift in how prioritisation works.
    Rewriting *"Delegated with explicit output requirements, not tasks"* into
    *"Wrote a clear brief and stepped back"* throws away the philosophy the
    sentence existed to state.
  - **If no, Y is a strawman there for cadence. Cut it and state X.** *"It was a
    demo, not a rollout"* is rhythm. *"A fix, not a feature"* is emphasis.
    *"Curiosity, not certainty"* is aphoristic. Nobody was going to think it was
    a rollout.

  This is the only threshold. It governs the inverted, embedded, and elaborated
  variants too, which are catalogued in section 8 because a scan looking only
  for the "X, not Y" word order misses them. The single diagnostic reframe that
  installs a piece's thesis (*"The retention problem is not a support problem.
  It is a measurement problem."*) is the strongest pass of this test and always
  stays.

  **Provenance decides first, and it overrides the test above.** Ask where the
  contrast came from before asking whether it does necessary work:

  - **The author wrote it** — it is in an existing draft, notes, a resume, or
    something they said. **Keep it.** Do not run the test and do not weigh
    whether Y is a real alternative. It is the author's sentence and it stays.
  - **The agent is writing fresh prose** — **never produce an "X, not Y"
    contrast.** Not a necessary one, not a diagnostic reframe, not any variant
    or word order. State the positive claim directly. The test above only ever
    licensed keeping the author's; it never licensed writing a new one.
  - **Provenance is unclear** — ask. Do not guess, and do not default to
    cutting.

- Excessive boldface for emphasis.
- Title case in headings where sentence case fits. The voice profile decides.

**What to do instead:**

- Any banned em dash: rewrite the sentence without it. Break it into two
  sentences, put the aside in parentheses, or join two closely related clauses
  with a semicolon. Parentheses are always a safe substitute.
- Repeat words. People repeat words. It is fine.
- Say the thing directly without the "not just... but also" introduction.
- For "X, not Y" contrasts: check provenance first. The author's own wording
  stays. Never write a new one. Ask when provenance is unclear.
- Bold sparingly or not at all, within the profile's budget.

**Example:**

- Before: *"The framework is not just a tool for developers — it's a paradigm
  shift in how we think about state management"*
- After: *"The framework simplifies state management."*

- Before: *"The test suite was fast — it completed in under a second"*
- After: *"The test suite completed in under a second."*

- Before: *"I posted it to the channel. It was a demo, not a rollout."*
- After: *"I posted it to the channel to see what questions came up."*

### 2. Vocabulary

**What it looks like:**

- Inflated words where plain ones work: "utilize" for "use", "facilitate" for
  "help", "leverage" for "use".
- Words that are statistically overrepresented in generated text: "delve",
  "tapestry", "meticulous", "pivotal", "landscape", "vibrant", "intricate",
  "underscore", "foster", "showcase", "crucial", "bolster", "garner",
  "enduring", "sharpen" ("that sharpens things"), "cleanly" ("they did that
  cleanly"), "wedge" as a noun for a strategic foothold ("the pricing wedge"),
  "craft" as a possessable noun ("she had the craft", "respect the craft").
- Replacing "is" with "serves as", "stands as", "holds the distinction of
  being".
- "-ing" words used as filler analysis: "highlighting", "emphasizing",
  "showcasing", "fostering", "underscoring".
- Abstract nouns standing in for concrete things: "craft" instead of "design
  skills", "wedge" instead of "the flow used as a proving ground", "capacity"
  instead of "the team's size", "rigour" instead of "careful work". Reaching for
  one of these is almost always a way to avoid naming the specific thing.
- **"reach for" / "reaching for"** as a figurative substitute for "use", "turn
  to", or "go back to". It is a writerly tic; the plain verb is required. The
  ban covers this skill's own instructions.
- **"earned its keep" / "earns its keep"** — banned outright. Also "earns" with
  an abstract subject ("each row earns its own development conversation", "the
  section earns the reaction"). Name what actually happens: each row gets its
  own development conversation; the section got the reaction. This applies to
  the skill's own instructional prose too.
- **"named" as the verb for a decision** ("I named the competency", "I named the
  bar"). State what was done: "I called it X", "I defined the competency", "I
  wrote down the bar", "I decided X". The imperative meta-guidance elsewhere
  ("name the concrete thing", "name the author's agency") is about how to write
  and stays.
- **"got honest" / "we got honest about X"** — drop the folksy verb. "We were
  honest about X", or better, name what was actually admitted.
- **"plainly" as a prose flourish** ("she told me plainly", "stated plainly" as
  a beat). It performs the directness it claims. Cut the adverb and let the
  sentence be direct. "Plain" as an adjective is fine.
- **"genuinely" as an intensifier before an adjective** ("genuinely useful",
  "genuinely interesting"). It performs the emphasis it is claiming. If the
  thing really is useful, the detail shows it. Cut it, or name what makes it so.
  The adjective "genuine" for a real distinction is fine.
- **"absorbing the difference" / "absorb the difference"** — name who actually
  paid or carried what.
- **"runnable", and "run [X] against [Y]"** ("a rubric you can run a promotion
  against"). Name the concrete use: "a rubric I can use to argue a promotion",
  "criteria I can actually apply".
- **"held to", and intransitive "[the structure / process / bar] held"** for
  following or surviving a process. Say what happened: "I stuck to the process",
  "the structure worked", "we kept using it".
- **Idioms, analogies, and metaphors: cut them, no exceptions.** This is
  borrowed rule 2, and one word carrying one meaning is borrowed rule 1, which
  is the same rule as the elegant-variation ban above. Typical figures that
  accumulate in
  drafts: a question a meeting "turns on", a rubric you "nod along to", "putting
  the same words in front of" someone, a matrix that "stays honest", "papering
  over the gap". Each one makes the reader decode an image instead of reading
  the point. More figures to remove: door and lock ("guarding a door that was
  already locked"), travel ("the assumptions didn't travel", "porting carries
  the steps across"), "sailed past", "grew around it", "on show", "kept a weekly
  read on it". Default to literal: say what actually happened, or what the thing
  actually is. If the literal sentence is harder to write, write the harder
  sentence.

  **Provenance decides, exactly as it does for "X, not Y".**
  - **The agent writing fresh prose: never generate non-literal wording.** No
    metaphor, analogy, idiom, figurative phrasal verb, or personification, in
    any sentence, at any strength. This is absolute and has no exception for a
    single well-chosen one.
  - **The author wrote or said it: leave it.** The author's own metaphors and
    idioms survive an edit. Do not remove a phrase the author typed or dictated
    because it is non-literal.
  - **Provenance is unclear: ask.**
  - **A surface can be stricter.** Some authors require every figure removed
    from a given surface, including their own. The voice profile records which
    surfaces those are.

  **Figurative phrasal verbs are the hardest to catch,** because they read as
  ordinary English. Example: "it reported a bug in its own code and **dressed it
  up as a win**". "Dress up as" is a clothing metaphor for misrepresentation.
  Its siblings go the same way: "papered over", "glossed over", "spun it as",
  "sugar-coated", "framed it as", "walked it back", "leaned into", "doubled down
  on", "unpacked". Say what happened: *"It reported a bug in its own code and
  described it as a success."* This applies to the skill's own instructions too.
  Quoted examples keep their original wording, because they are reference
  material.
- **"actually turns on" / "the thing X turns on"** — filler that does not say
  anything. Name it: "the question I actually have to answer in a review".
- **"nod along" / "nod along to"** — say "agree with in principle", "say yes to
  without thinking", or name what was missing.
- **"naming it" / "name it" for voicing a concern** — say "raising it",
  "telling them", "saying so".
- **"out loud"** ("I named the competency out loud") — drop it; it adds nothing.
- **"point to" / "pointed to" for highlighting** — use "I called attention to",
  "I mapped it to", or "I flagged".
- **"stays honest" / "stay honest" for an abstract thing** — a rubric cannot be
  honest. Use "is only useful", "is only effective", "only works".
- **"keep [X] honest" as a sentence structure** — the same personification with
  "keep" instead of "stay". An abstract thing cannot be made honest by a tool;
  name what the tool actually checks. "I built a scorecard to check whether my
  coaching was working", not "...to keep my coaching honest".
- **"carries it" / abstract "carries [the point]"** — say "already makes the
  point", "says it".
- **"put / putting [X] in front of [someone]"** — say what literally happened:
  "we were finally working from the same definition".
- Literary or narrative-theory vocabulary applied to real people: "antagonist",
  "protagonist", "arc", "foil", "archetype", "character", "plot". Dressing real
  coaching, work, or relationships as drama is a strong tell. The fear is just a
  fear. The designer is just a designer.
- Writerly or academic register when discussing one's own writing: "prose",
  "theses", "the argument" in the formal sense, "wordsmithing", "the piece".
  Use "the writing", "the post", "the document", "the draft" for the artifact,
  and "ideas", "points", "what I want to say" for the content.

**What to do instead:**

- Use the plainest word that is accurate. "Use" not "utilize". "Help" not
  "facilitate".
- When a fancy word appears, ask whether it adds anything, or whether it only
  makes the sentence sound more important.
- "Is" is a good word. Use it.
- "reach for" becomes the plain action: "use", "go back to", "turn to", "keep
  using".
- For abstract nouns, name the concrete thing. "Craft" becomes "design skills"
  or "the work they could ship". "Wedge" becomes "the flow" or "the project used
  as a proving ground". "Capacity" becomes "team size". "Rigour" becomes
  "careful work" or "checking the numbers".
- For literary jargon, name the thing directly. "Antagonist" becomes "problem",
  "fear", "habit", or a description of the behaviour. "Their arc" becomes "what
  changed". "Protagonist" becomes the role.

**Example:**

- Before: *"This approach leverages a meticulous methodology to navigate the
  intricacies of the evolving data landscape"*
- After: *"This approach handles complex data well"*

- Before: *"They had the craft. The call-routing wedge was the proving ground."*
- After: *"They had the design skills. The call-routing work was the proving
  ground."*

- Before: *"The next two designers I'm coaching have different antagonists."*
- After: *"The next two designers I'm coaching have different problems. One is
  over-confident. The other skips framing."*

- Before: *"The rubric earned its keep, and each row earns its own development
  conversation. I named the competency, got honest about the bar, and the
  structure held."*
- After: *"The rubric worked. Each row gets its own development conversation. I
  defined the competency, was honest about where the bar actually sat, and we
  kept using it."*

### 3. Tone

**What it looks like:**

- Promotional voice: "boasts a vibrant community", "nestled in the heart of",
  "groundbreaking approach", "rich cultural heritage".
- Vague attributions: "experts argue", "observers have cited", "industry reports
  suggest", without naming anyone.
- Collaborative "we/let's" when the reader did not ask for that.
- Hedging pileups: "it's worth noting that it could potentially be considered".
- Everything framed as positive, important, and exciting.

**What to do instead:**

- Describe, do not sell. State what the thing does, not how impressive it is.
- Name specific sources or drop the attribution.
- Write in second or third person unless the context calls for "we".
- Take a position or do not. Do not hedge your way to nothing.
- It is fine for something to be merely adequate.

**Example:**

- Before: *"Nestled in the heart of the developer ecosystem, this library boasts
  a vibrant community and a groundbreaking API"*
- After: *"The library has an active community and a clean API"*

### 4. Structural Tics

**What it looks like:**

- Rule of three: defaulting to "adjective, adjective, and adjective" or
  three-item lists everywhere.
- The "despite" formula: "Despite [positives], [subject] faces challenges
  in...".
- Outline-like endings that speculate vaguely about "future prospects" or
  "future outlook". A specific, concrete opportunity in the problem space is a
  fine close; the tell is vagueness, not futurity.
- Every paragraph following the same rhythm: claim, elaboration, significance
  statement.
- Sections that end by claiming cosmic importance.

**What to do instead:**

- Lists can have two items. Or four. Or one.
- End when the point is made. Do not add a "challenges and future outlook"
  section.
- Vary paragraph structure. Some paragraphs are one sentence. Some are five.
- Not everything needs a conclusion about its broader significance.

**Example:**

- Before: *"The platform is fast, flexible, and forward-thinking. Despite its
  impressive capabilities, it faces challenges in adoption, scalability, and
  documentation. Future improvements could address these limitations and set the
  stage for broader impact."*
- After: *"The platform is fast but adoption has been slow, partly because the
  documentation is thin."*

### 5. Content Inflation

**What it looks like:**

- Formulaic emphasis before a reveal: "caught something real", "revealed
  something interesting", "surfaced a genuine problem", "found something worth
  noting". These exist to signal that what follows matters. If it matters, the
  detail itself shows that. Delete the introductory phrase.
- "that proved it", or "proving [something]", used to certify a point after the
  fact. State what the evidence showed (*"the VP asked to ship it that day"*)
  and let it stand, instead of narrating that it counted as proof. The fixed
  term "proving ground" is fine.
- Undue emphasis on significance: "marking a pivotal moment", "a testament to",
  "underscores the importance of".
- Connecting small topics to "broader trends" or "evolving landscapes".
- Padding with obvious statements to fill space.
- Superficial analysis that gestures at depth: "contributing to a richer
  understanding of the complex interplay between...".
- Treating everything as historic, transformative, or groundbreaking.

**What to do instead:**

- Say what happened. Skip what it means for the grand arc of history.
- If the significance is interesting, state it concretely. "Sales doubled" beats
  "marked a significant milestone".
- Cut sentences that could be deleted without losing information.
- Be specific. Specific details are more convincing than sweeping claims.

**Example:**

- Before: *"This update represents a significant milestone, underscoring the
  team's commitment to innovation and highlighting the importance of continuous
  improvement in an ever-changing technological landscape"*
- After: *"This update adds dark mode and fixes three bugs."*

### 6. Aphorism Voice

**What it looks like:**

- Pseudo-profound opening lines, pull-quotes, or epigraphs that compress the
  whole piece into a single "wise" sentence. Hallmarks:
  - Parallel construction with abstract nouns standing in for people: "the craft
    to lead and the fear to stay quiet", "the will to act and the patience to
    wait".
  - The "I had X, so I did Y" or "She had X but lacked Y" formula.
  - Inverted or poetic phrasing meant to sound timeless: "ways to lead before
    the fear was gone", "answers the question hadn't yet asked".
  - A whole person reduced to a pair of abstract qualities. They have a name and
    a job, not a character sheet.
- These show up most often as blockquote epigraphs at the top of a piece. They
  feel like they are saying something. They are saying nothing.

**What to do instead:**

- Default to no epigraph. The first H2 should do the work.
- If an opener is worth keeping, write a plain declarative sentence about a real
  thing that happened. "She had the craft. What she didn't have was a
  willingness to be wrong in public" beats any parallel-construction aphorism.
- Suspect any sentence that seems to want italics. Italics usually mean the
  sentence cannot stand on its own.

**Example:**

- Before: *"I had a designer with the craft to lead and the fear to stay quiet,
  so I gave her ways to lead before the fear was gone."*
- After: *(cut entirely; let the first section open the piece)* — or, if an
  opener is needed: *"She had the craft. What she didn't have was a willingness
  to be wrong in public."*

### 7. Underselling and criticising the audience

Two failures that show up most in pitch and portfolio content, where the reader
is a hiring manager or a target company.

**a) False-modesty concessions that undersell a real strength.**

The "I don't X, but Y" construction concedes something the author actually has.
It reads as humble and it hands away a credential. If the author can do X, say
so and lead with it.

- Before: *"I'm not a researcher, but I do talk to users."*
- After: *"I run my own research."* Then the specifics.
- Rule: never write that the author lacks a skill they have. Check the voice
  profile and ask before conceding anything. Lead with the strength, not the
  disclaimer.

**b) Criticising the audience or subject.**

In content aimed at a specific company, framing their product or their whole
domain as a failure reads as criticism, even when the intended meaning is
"current limitation". Do not make the reader the target of the criticism.
Reframe a limitation as a shared, interesting problem, and stay positive about
what they do well.

- Before: *"[Product] won on speed and lost on design-system fidelity. Engineers
  screenshotted the prototypes instead of using the design files."* On that
  product's own pitch page, this reads as criticism of the product.
- After: *"AI gets you to a result fast; making that result feel designed,
  consistent, and on-brand is the harder, more valuable half."* Same insight,
  framed as the problem worth solving.
- Also: do not link a competitor-comparison piece on a company's own page. Pick
  a constructive destination.

### 8. Manufactured contrast and rule-stating formulas

A family of clever-sounding contrast templates that define a thing by what it is
not, usually with a dismissive payoff. They read as crafted wisdom instead of a
person explaining a point.

**These run through section 1's test, not a separate rule.** Ask the same
question: would a thoughtful reader actually consider doing Y? They are
catalogued here for two reasons. They almost never pass, because the payoff is a
clever or dismissive label ("a vibe", "decoration") instead of a real
alternative. And a reviewer scanning for the "X, not Y" word order misses them,
because the negation is inverted, embedded, or elaborated.

**What it looks like:**

- **"it had to be X, not Y."** The section 1 contrast with a fated "it had to
  be" attached. The "it had to be" is doing no work either way; drop it, then
  test the contrast underneath.
- **Inverted negation orders: "Not X, but Y" / "Not the X, but the Y" / "isn't
  X. It's Y" / "wasn't X. It was Y."** The same contrast with the negation
  leading. A reviewer scanning for "X, not Y" misses these because the word
  order is reversed. *"Not the polished win, but a dated record of catching
  myself coaching badly."* *"The cost isn't a bruised feeling. It's people not
  getting better."* Run the test, then state the positive thing directly and cut
  the negated half if Y was never a real option. Watch for the embedded version
  too ("the proof it was coaching and not just a strong hire").
- **"An X without a Y isn't an A, it's a B."** *"A behavioural description
  without a cadence isn't a criterion, it's a vibe."* Negate, then relabel with
  a zinger.
- **"Something you can X is not something you can Y."** *"A rubric you can nod
  along to is not a rubric you can run a promotion against."* Parallel "you
  can…" clauses pivoting on a contrast.
- **"An X that does A is [P]; an X that does B is [Q]."** *"A matrix that
  changes in response to an actual promotion is being maintained; a matrix that
  only changes in a planning meeting is decoration."* Two parallel definitions,
  the second a dismissive label.
- **"the only X that matters."** Manufactured significance by elimination.
- **"X was [higher / bigger] than they had been treating it, and now we both had
  to Y."** The forced-consequence beat.
- **"I didn't leave it there."** A miniature cliffhanger that announces momentum
  instead of continuing.

**Why they are tells:** each performs its conclusion through sentence shape
(parallelism, negation, a short dismissive label) instead of stating it. The
shape does the convincing, and that is the move that reads as generated.

**What to do instead:**

- State the point directly and let it carry. *"A behavioural description without
  a cadence isn't a criterion, it's a vibe"* becomes *"A behavioural description
  on its own is too vague to base a promotion on; it needs a cadence for when
  each level gets reviewed."*
- For "the only X that matters": name the X and why it was the one being
  watched, without the elimination frame. *"Time-to-first-value was the metric I
  watched, because it predicted retention better than the rest."*
- For "and now we had to…" and "I didn't leave it there": just continue. Drop
  the announced momentum and write the next plain sentence.

**Distinguish from the diagnostic reframe, which stays.** The strategy and
case-study section endorses *"The retention problem is not a support problem. It
is a measurement problem."* That works because it rejects a wrong frame to
install the actual thesis of the piece, once, in plain words. The banned
versions differ: they are used throughout, they pivot on a clever or dismissive
label, and they define small things by parallel contrast instead of reframing
the central problem. Keep the one necessary reframe; cut the rhetorical
contrasts that ornament ordinary points.

## Self-check before outputting

Scan the output against the voice profile first, then scan for:

- Any punctuation the profile bans, in every use. Where em dashes are banned, a
  connector becomes two sentences, a trailing aside becomes the main clause or
  gets cut, and a mid-sentence parenthetical becomes parentheses.
- Any sentence ending in "That's X." or "This is X." used as a trailing
  significance statement. Cut it or merge it into the preceding sentence.
- Any contrast that pivots on a negation, in any word order, standalone or
  embedded: "X, not Y", "Not X, but Y", "Not the X, but the Y", "isn't A, it's
  B", "wasn't X, it was Y". Reversed order is the one that slips through, so
  scan for the negation and not only for the "X, not Y" shape. For each, run the
  section 1 test. Keep the ones that name a real choice; rewrite the rest as a
  positive statement of what X actually is.
- Any blockquote epigraph or italicised pull-quote at the top of a piece. Read
  it cold. If it relies on parallel abstract nouns, the "I had X, so I did Y"
  formula, or inverted philosophical phrasing, cut it. The first real section is
  almost always a stronger opener.
- Any "I don't X, but Y" concession. Check whether the author actually does X.
  If so, rewrite to lead with the strength. Never concede a skill the author
  has.
- (Pitch and portfolio content) Any line that frames the target company's
  product or domain as a failure. Reframe it as a shared, interesting problem
  and stay positive about what they do well.
- Any multi-section piece that does not open on the problem. The first section
  is the diagnosis, not the setup, the role, or the brief.
- Any defensive caveat that undercuts the conclusion ("results may vary", "every
  team is different", "this is just one approach"). Cut it. Showing the failures
  themselves stays; that is evidence, not a caveat.
- Any sentence stating a conclusion, takeaway, reframe, or opinion that was not
  actually supplied. Do not ship it as the author's verdict. Replace it with a
  marked placeholder and ask.
- (Case study and strategy) Any design decision justified only on aesthetic
  grounds ("cleaner", "more elegant"). Tie it to a business or customer
  consequence, or cut it.
- (Published content) Any quote carrying a real name, identifiable business
  detail, or internal metric. Anonymise the source and mark cuts with `...` or
  `[missing context]`. Confirm at least one friction quote is present, not only
  applause.
- Any "earned its keep", abstract-subject "earns", "named [a decision]", "got
  honest", "stays honest", "keep [X] honest", "absorbing the difference",
  "runnable", "run X against Y", "held to", intransitive "[X] held", or
  "plainly" as a flourish. Replace with the plain verb.
- Any manufactured-contrast formula from section 8. Run the section 1 test on
  each. These almost always fail it, so cut and state the point directly.
- Any "and now we had to…" forced-consequence beat, "I didn't leave it there"
  cliffhanger, or "that proved it" / "proving [a point]". Drop the announced
  momentum or the certification; state what actually happened and what the
  evidence showed.
- Any reflexive idiom, analogy, or metaphor in the prose ("turns on", "nod along
  to", "put words in front of", "stays honest", "papering over", "carries it",
  "out loud", "point to"). Check provenance: the author's own figures stay, the
  agent never generates one, ask when provenance is unclear. Surfaces the
  profile marks as strict flatten every time.
- **Any figurative phrasal verb the agent generated.** These read as ordinary
  English, so a metaphor scan misses them: "dressed it up as", "glossed over",
  "spun it as", "sugar-coated", "framed it as", "walked it back", "leaned into",
  "doubled down on", "unpacked", "touched", "kills", "went the same way".
- **Every replacement just written for one of the above.** Check each one
  against the replacement method. If the new wording keeps the original image
  and only changes the word, that is a second metaphor. Ask who did what to
  what, and write that instead. *"dressed it up as a win"* becomes *"described
  the bug as a success"*, and never *"called it a win"*.
- Any fronted clause that switches subject between the clause and the main
  sentence. Rewrite subject-first. Fronted clauses that keep the subject and
  carry real information stay.
- Any run of two or more consecutive sentences opening on a subordinate clause,
  a cleft, or "there is / there are". Keep the one carrying real information;
  rewrite the rest subject-first.
- Any "there is / there are / there was / there were" where an actor can be
  named. Ask who or what did this and put the answer in the subject position.
  Keep it only for a static fact or a plain absence.
- Any mid-sentence appositive. Split it into two sentences.
- (Instructional passages only) Any step or how-to sentence over roughly 20
  words, or carrying more than one instruction. Split it. Narrative paragraphs
  are exempt.
- Any paragraph whose sentences could be reordered without loss. Each one should
  pick up the subject, object, or consequence of the last and carry it forward.
- (Case study) Any outcome-bullet block with more than three bullets, a bullet
  over about 90 characters, or a bullet that recaps the work instead of naming
  an outcome.

### Second pass: pattern-level tells

The checklist above is a sentence pass: each sentence is read and judged alone.
Some of the strongest tells are invisible to that pass because they only appear
across the whole piece. A sentence-by-sentence reviewer will clear a piece whose
problems are structural. After the sentence pass, do this second pass over the
piece as a whole.

- **Signature metaphor.** Scan for one figurative word reused as the piece's
  through-line, in the title, the headings, the metadata, and repeated in the
  body. A recurring metaphor is the hardest to catch and the strongest tell,
  because by the third use it reads as the piece's own vocabulary instead of as
  a figure. Make it literal everywhere, not only where it is noticed. Pick one
  literal replacement and apply it to every instance.
- **Stacked aphorism closers.** Read only the last sentence of each section in
  sequence. If two or more end on a significance or wisdom line, the piece is
  closing on cadence instead of substance. Keep at most the single most concrete
  one; rewrite the rest to end on what actually happened.
- **Bold budget.** Count the whole-sentence or whole-phrase bolds in each
  section against the profile's budget. Over budget means demoting all but the
  single line a skim-reader should stop on. Never bold a list label.

## Compression modes

When condensing a list or principle for a shorter venue, identify whether the
job is teaching or reminding. They take different shapes.

**Teaching version.** Cannot be much shorter than the long form. Names the
mechanic, the bad version, and the action. Each piece is doing work; remove any
of them and the principle loses meaning. Used in posts, essays, and threads
where each post is a full thought.

**Reminding version.** Telegraphic labels: verb plus noun phrase, or noun phrase
plus noun phrase. Each item tags a richer concept established in the longer
version. Labels work because they point, and the reader recovers the meaning
from elsewhere. Used in short summaries, slide bullets, and glanceable
checklists.

**Pitfall: aphoristic compression.** Shrinking a principle into a
wisdom-sounding short sentence that tries to *be* the principle in eight words
(*"Argue the thinking. The prose follows."*). It sounds like wisdom, supplies no
mechanic, and masquerades as a standalone thought. Either teach at length or
label in short. Do not fake the middle.

Test: if the short version would fit on a poster, it is an aphorism. Either
expand it back to the mechanic, or collapse it to a label.

**Closers that work versus aphorisms.** Not every short closing sentence is an
aphorism. A closer that works names a concrete consequence. *"The writing
changes as a side effect"* names a specific mechanism and a specific actor. An
aphorism compresses to wisdom. *"The prose follows"* names no mechanism and no
actor, only rhythm. The test is not length; it is whether the line adds
specificity or only cadence.

## Threads and social-post structure

Each principle in a thread is its own post. Within a post:

- **Line 1:** the principle title, one sentence on one line.
- **Blank line.**
- **One to three paragraphs of elaboration**, separated by blank lines if there
  is more than one.

Dense single-paragraph posts do not scan on social. The visual structure (title,
gap, elaboration) does as much work as the words. The reader sees the principle
first, then the explanation. Treat blank lines as necessary punctuation, not as
formatting decoration.

## The Meta-Rule

Do not replace one set of formulas with another. The goal is not "anti-AI
style". It is writing that sounds like a specific person said it for a specific
reason. Natural writing has personality, rough edges, and opinions. It does not
always flow perfectly. That is what makes it human.

Applying these rules mechanically is doing it wrong.

## Source and credit

ASD-STE100 is maintained by the Simplified Technical English Maintenance Group
(STEMG). Three of its rules are borrowed above and no part of its dictionary is
reproduced, because the standard is free to obtain and is not free to
redistribute. The standard can be requested at
<https://www.asd-ste100.org/STE_downloads.html>.

This skill is not an STE authoring tool and carries no endorsement from ASD or
STEMG, which maintains the standard, produces no AI tools, and endorses none.
The boundary that the standard excludes creative and persuasive writing is taken
from the asd-ste100-skill by Dustin Yuchen Teng, MIT licensed:
<https://github.com/danyuchn/asd-ste100-skill>.
