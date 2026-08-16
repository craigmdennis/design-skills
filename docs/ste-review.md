# ASD-STE100 review of the prose skills and prompts

A review of `prompts/conversation-prose.md`, `prompts/documentation-prose.md`, and
`prompts/published-prose.md`, and of the three installed skills they write, against
two sources:

- **ASD-STE100 and Artificial Intelligence** (White Paper, STEMG and STEMG AITT,
  June 2026). A position paper on AI use in STE environments. It contains no
  writing rules.
- **asd-ste100-skill** by Dustin Yuchen Teng, MIT licensed.
  <https://github.com/danyuchn/asd-ste100-skill>. A Claude skill that encodes the
  rule categories of ASD-STE100 Issue 9 with sources and worked examples. See
  "Credit and licence" at the end of this document.

Each item below is marked **[correction]**, **[conflict]**, **[addition]**,
**[removal]**, or **[governance]**.

## 1. Corrections

### 1.1 The rule count is unsourced and does not match Issue 9 [correction]

`prompts/published-prose.md:148` states "about 65 writing rules and a restricted
dictionary". The reference skill records Issue 9 (January 2025) as **53 writing
rules across 9 sections**, with a dictionary of approximately 900 approved words
and approximately 1,200 words to avoid.

Fix: name the issue and its date, then use that issue's count. A claim about a
standard that names no edition cannot be checked and goes stale on each release.

### 1.2 The em dash is not banned by ASD-STE100 [correction]

Rule 8.1 bans the semicolon and permits every other standard punctuation mark,
including the em dash. The em-dash ban in `published-prose` is a voice
preference. `conversation-prose` already lists "the em-dash ban" among the rules
that do not apply to replies, which is correct, but neither file states that STE
is not the authority for it.

Fix: label the em-dash ban as a voice rule in the voice profile, not as a
consequence of the standard.

### 1.3 No skill names the edition it encodes [correction]

The standard is versioned. Issue 9 replaced Issue 8 in January 2025 and changed
the rule count. All three skills refer to "ASD-STE100" with no edition.

Fix: one line in each skill: which issue the rules are drawn from, and the date.

## 2. Conflicts to resolve

### 2.1 The semicolon rule contradicts the stated priority order [conflict]

`published-prose` declares at `SKILL.md:30` that "Where a rule below and STE
disagree, STE takes priority, unless this file records a scoped exception". Rule
8.1 bans the semicolon outright. The file then requires semicolons at
`SKILL.md:144` ("Semicolons are the clause-joiner") and again at `SKILL.md:303`,
and records no exception.

Fix: keep the semicolon, and record it as a scoped exception beside the two
already recorded (sentence length, subject-first). The rule itself is sound for
the genre; the omission is the defect.

`conversation-prose` and `documentation-prose` say nothing about semicolons.
Both should adopt Rule 8.1 as written. It is mechanical, needs no dictionary, and
agrees with one-idea-per-sentence.

### 2.2 The passive rule in documentation-prose diverges from STE [conflict]

STE allows passive voice in descriptive text only, and only where the actor is
unknown or irrelevant. `documentation-prose` operation 1 requires an agentless
passive in the subordinate clause ("when asked a question, answer it"), which is
a wider allowance than the standard gives.

The divergence is defensible: deleting the agent is the point of the third-person
impersonal register, and ISO/IEC Directives Part 2 requires that register.
`published-prose` already records two divergences of this kind in full. This one
is not recorded anywhere.

Fix: record it, in the same form, and name the reason.

### 2.3 "No caveating" can upgrade a hedge to a claim [conflict]

The reference skill treats modality as content: a rewrite that turns "may have
failed" into "failed" is a different claim, not a shorter one. It names this as
the most common way an STE rewrite goes wrong, because a length cap is exactly
what tempts a writer to cut the hedge.

`published-prose` bans defensive caveats at `SKILL.md:85` and `SKILL.md:514`. The
file already states that the ban does not override fact-checking, and it does not
state that the ban never applies to modality inside a sentence.

Fix: add one line to the "No caveating" rule. The ban covers closing qualifiers
that undercut a conclusion. It never converts a stated hedge into a fact.

`conversation-prose` handles this correctly under "Caveat honestly" and needs no
change.

### 2.4 published-prose claims a standard that excludes its own genre [conflict]

The reference skill states the limit directly: STE is not for creative or
marketing copy, and it must not be applied where voice, nuance, or persuasion is
the point. `published-prose` governs blog posts, case studies, and application
answers, and declares STE "the governing standard for this skill"
(`SKILL.md:28-40`).

In practice the file already restricts STE to two rules: no figurative language,
and one word for one meaning. Everything else is either scoped away, contradicted
(the semicolon), or unused.

Fix: demote the claim to match the practice. State that two STE rules are
borrowed, name them, and state that the remainder does not apply to the genre.
This is more accurate and it removes a false priority order that the rest of the
file has to work around.

## 3. Additions: rules the standard has and the skills lack

None of the three skills contains any of the following. All are structural rules,
which the reference skill defines as the rules applicable without the licensed
dictionary.

### 3.1 Noun clusters, maximum 3 words [addition]

Absent from all three skills. Verified by grep. A stack of four or more nouns used
as one modifier ("high pressure fuel pump inlet valve assembly") has no marked
grammatical relations, so the reader has to guess them.

This is the highest-value missing rule for this repository, because product and
design writing produces these constantly ("design system adoption evaluation
framework"). It is mechanical: count the nouns.

Add to: all three skills.

### 3.2 Do not omit words to shorten a sentence [addition]

STE requires the subject, the verb, and the article to stay, and warns that
dropping them creates ambiguity instead of clarity. `conversation-prose` covers
part of this under "Write in complete sentences" (`SKILL.md:164-168`) without
naming the rule.

Add to: `documentation-prose`. Cross-reference the rule name in
`conversation-prose`.

### 3.3 Simple tenses, with one exception [addition, scoped]

STE permits infinitive, imperative, simple present, simple past, simple future,
and the past participle as an adjective. It excludes the present perfect and
other compound forms.

The reference skill records a well-argued exception: where the compound form
carries current relevance that the simple form cannot ("the job has completed",
meaning the output is available now), keep it and state the departure. Aircraft
manuals never need the present perfect; status reporting frequently does.

Recommendation: adopt in `documentation-prose` with the exception attached. Do
**not** adopt in `conversation-prose`, where status reporting is most of the
output and the exception would fire on nearly every use.

### 3.4 Paragraph limits: one topic, maximum 6 sentences [addition]

Absent from all three. Useful in documentation, low value in conversation.

Add to: `documentation-prose` only.

### 3.5 Vertical lists for sequences [addition]

STE requires a numbered or bulleted list for three or more steps or conditions
instead of a prose sentence. `conversation-prose` check 13 currently pushes the
other way ("no headers or tables on a short answer"), which is correct for a
one-line answer and wrong for a three-step sequence.

Add to: `documentation-prose`. Add the sequence exception to
`conversation-prose` check 13.

### 3.6 Safety-critical instructions open the sentence [addition]

STE requires a safety instruction to open with the command or condition, not to
carry it mid-sentence. Relevant to runbooks, which `documentation-prose` names in
its scope.

Add to: `documentation-prose`.

### 3.7 A project glossary of approved technical terms [addition]

This is the largest gap, and it is the one the White Paper cares about most.

STE includes a terminology allowance: an organisation may define its own
dictionary of approved technical nouns and verbs beyond the base list. All three
skills already say that approved technical names are acceptable
(`conversation-prose SKILL.md:85`, `published-prose SKILL.md:38`), and none of
them provides a place to record which names those are. The rule therefore has no
effect: nothing is approved, because nothing is written down.

The White Paper names terminology control twice: once as a benefit AI can deliver,
and once as something AI can compromise.

Proposal: a `terms.md` companion file, in the pattern already used by
`checks.md` and `voice-profile.md`.

- Two columns: the approved term, and the terms it replaces.
- Written at install time for `documentation-prose`, or per project.
- Read before writing, and appended to when a new term is settled.

This also implements the one-word-one-meaning rule, which is currently stated as
an instruction with no mechanism behind it.

## 4. Removals and size reductions

### 4.1 published-prose is too large to run reliably [removal]

`prompts/published-prose.md` is 1,456 lines; the skill it writes is 569.
`conversation-prose` is 719 and 272. `documentation-prose` is 234 and 164.

The failure already diagnosed in this repository was a rule that was present and
not executed. Length is the mechanism. Three specific reductions:

- **Anti-pattern sections 1 and 8 are one rule.** Section 8 states so itself
  ("These run through section 1's test, not a separate rule",
  `SKILL.md:482`). Merge them. Section 8's value is the list of word orders a
  scan misses; keep that list, delete the restated reasoning. Saves roughly 40
  lines.
- **The self-check restates almost every rule in the file**
  (`SKILL.md:503-531`, 29 items). Convert it to the procedural form already used
  by `conversation-prose`, where each item is a test to run and not a rule to
  recall. Fewer items, each mechanical.
- **The vocabulary section is a dictionary written as prose**
  (`SKILL.md:320-378`, roughly 60 lines, approximately 30 single-word bans, each
  with its own paragraph). This is exactly what STE's dictionary is: a table of
  words to avoid with approved replacements. Convert it to a three-column table
  (avoid, use, note). Same content, roughly one third of the lines, and directly
  greppable.

### 4.2 The replacement method appears three times [removal, declined]

`conversation-prose SKILL.md:34`, `documentation-prose SKILL.md:184-198`, and
`published-prose SKILL.md:42-60` each teach the same method. The duplication looks
like waste and is not: each skill installs alone and must stand alone. Keep all
three copies. Recorded here so the question is not reopened.

### 4.3 Do not add the present perfect ban to conversation-prose [removal]

See 3.3. Listed here because it is the one rule from the reference skill that
should be declined rather than adopted.

## 5. Structure borrowed from the reference skill

### 5.1 Separate structural rules from lexical rules [improvement]

The reference skill's strongest structural idea: STE's rules divide into those a
reader can apply from the description alone (sentence shape, voice, tense,
punctuation, noun clusters) and those defined entirely by the licensed dictionary
(which word is approved). Without the dictionary, the second kind degrades from a
checkable standard into a preference for plain words.

`conversation-prose` gestures at this in one line (`SKILL.md:87`: "The full STE
dictionary is licensed and aerospace-oriented, so exact compliance isn't
checkable"). The reference skill turns it into a structure: two tables, and an
instruction to state the difference in the output instead of implying compliance
that was never verified.

Recommendation: adopt the split in all three skills. It is honest, it tells a
reader which rules an agent can actually enforce, and it answers the White Paper's
observation that automated STE checks currently have varying levels of accuracy.

### 5.2 Two modes [improvement]

The reference skill defines **Strict** (procedures, error messages, safety text:
every rule) and **STE-flavored** (READMEs, changelogs, explanatory prose:
structural rules in full, lexical rules advisory).

This repository has already made the same split, but along genre lines and across
three separate files. Naming the two modes inside `documentation-prose` would be
useful, because that skill covers both kinds of text: a runbook step is strict,
an architecture note is not.

### 5.3 Boundary statements [improvement]

The reference skill's "Will not" list contains three items worth copying:

- STE fixes the form of a text and not its substance. A hollow paragraph rewritten
  under these rules is a clean hollow paragraph.
- Do not force changes onto text that already complies.
- Do not shorten past the point of clarity. The goal is removing ambiguity, not
  removing words.

The third is the direct answer to the failure mode `conversation-prose` already
warns about in its meta-rule, stated more usefully.

## 6. Governance items from the White Paper

The White Paper contains no writing rules. It is a position paper, and every item
below comes from it.

### 6.1 Non-endorsement [governance]

"The primary role of the STEMG is to develop and maintain the STE standard. It
does not engage in producing AI software or tools and does not endorse any of
them." STEMG has extended ASD's non-endorsement policy to AI tools.

This repository publishes prompts that name ASD-STE100 as their standard, to
readers who did not write them. A reader could reasonably read that as a claim of
compliance or endorsement.

Fix: one paragraph in `README.md` and one line in each installed skill. The skills
apply a subset of the STE writing rules, they do not implement the standard, they
are not endorsed by ASD or STEMG, and the dictionary is licensed and not included.

### 6.2 Redistribution limits on the standard [governance]

The reference skill records the licence position precisely: ASD-STE100 is free to
obtain and not free to redistribute. Issue 9 page 2 requires the written authority
of an ASD officer for any reproduction, and grants free reproduction only to eight
listed categories of organisation.

This repository paraphrases rule categories, which is the same position the
reference skill takes, and it does not say so anywhere.

Fix: state it, and link the official request form. The rules may be described; the
dictionary may not be reproduced.

### 6.3 Scope limit: not for regulated technical publications [governance]

The White Paper's "Reliability and troubleshooting risks" item notes that AI
performance may be limited in safety-critical work. The reference skill states the
matching boundary: it does not guarantee an aerospace or defence grade
STE-compliant document.

This repository's prompts are public, and the phrase "ASD-STE100" is what an
aerospace technical author would search for.

Fix: one line per skill. These skills govern blog posts, documentation, and
conversation. They are not an authoring tool for regulated technical publications,
and they must not be used for S1000D or maintenance documentation.

### 6.4 Accountability stays with the author [governance]

"Responsibility remains with the human author or organization" and "AI should
assist, not replace, human authors".

`published-prose` already implements this better than anything else in the
repository, under "Do not supply the conclusion" (`SKILL.md:91-100`). The rule is
not currently named as an accountability rule, and the other two skills have no
equivalent.

Fix: name it. In `documentation-prose`, the matching rule is that a specification
states what is required, and an agent does not decide the requirement.

### 6.5 Disclosure of AI assistance [governance, decision required]

"Disclaimers: indicate when AI-assisted content is used, with scope and
limitations."

For a personal blog this is a publishing decision and not a writing rule. It is
recorded here because the White Paper names it and the repository does not address
it. The question is whether `published-prose` should carry a disclosure
convention, and if so, whether the voice-profile interview should ask for it.

### 6.6 Traceability of content decisions [governance]

The White Paper lists "limited traceability of content sources" as a live
challenge, and the regulatory frameworks it cites require auditability.

`published-prose` already implements this as provenance: the author's own wording
stays, an agent generates none, and an agent asks when the origin is unclear. The
rule appears twice (`SKILL.md:292-298` for contrast constructions, `SKILL.md:339`
for figurative language) and is stated as a general principle nowhere.

Fix: state it once as a general rule, then reference it from both places.

Note: `conversation-prose` bans clipping a multi-word term to its head noun and
names "provenance" as an example (`SKILL.md:255`). If the general rule is added to
`published-prose`, it should be written as "who wrote it" or as "origin", to stay
consistent across the two files.

### 6.7 Data confidentiality [governance]

"Protect proprietary and sensitive technical information", and encourage in-house
tools where confidentiality is critical.

`published-prose` handles the published surface well: numbers by surface,
anonymised quotes, marked cuts. The voice-profile interview
(`prompts/published-prose.md:1360-1401`) asks a reader to describe their employers'
figures and their banned words, and it contains no warning about what not to paste
into it.

Fix: one line before question 1 of the interview. Answers are written to a local
file and are sent to a model. Do not paste anything under NDA.

### 6.8 Benchmarks and evaluation [governance]

"Develop benchmarks or evaluation frameworks to assess AI performance in
STE-compliant writing and translation."

This repository has no test corpus. Its worked examples are real and correct and
are scattered inside the skill prose. The reference skill separates them into
`examples/before-after.md`: a table of rule, before, after, and why, then longer
worked cases with the flagged violations listed and a note on what was
deliberately not flagged.

This is the highest-value structural addition available, and it is the only way to
answer the question the repository keeps asking itself: does a change to a skill
make it catch more, or fewer, of the sentences it was written for.

Proposal: a `tests/` directory, one file per genre, each entry being a failing
sentence, the rule it breaks, and the accepted rewrite. Seed it from the failures
already recorded in the skills, which is the corpus already written. Run it by
pasting the failing sentences into a session with the skill installed and
comparing against the recorded rewrite.

## 7. Suggested order

1. Corrections in section 1. Small, and they are factual errors currently
   published.
2. Semicolon exception (2.1) and the divergence record (2.2). Both are one
   paragraph.
3. Noun clusters (3.1) into all three skills.
4. The published-prose reductions in 4.1, and the self-check conversion. This is
   the largest single task and it is already on the open list.
5. The structural and lexical split (5.1) and the governance lines in 6.1, 6.2,
   and 6.3.
6. `terms.md` (3.7) and the `tests/` corpus (6.8). Both are new mechanisms rather
   than edits, and both need a design pass first.

## Credit and licence

The rule detail, the structural and lexical split, the two modes, the modality
warning, and the redistribution position in this review are taken from
**asd-ste100-skill** by **Dustin Yuchen Teng**, MIT licensed, at
<https://github.com/danyuchn/asd-ste100-skill>.

Any material copied from it into this repository, in particular the rule tables,
carries the MIT requirement that the copyright notice and permission notice travel
with the copy. Two places need it:

- `README.md`, in a sources section.
- Each installed skill that carries copied material, because a skill written by a
  prompt leaves this repository and the licence has to leave with it.

A rule paraphrased from ASD-STE100 itself belongs to ASD and is covered by section
6.2, not by the MIT licence.

Where a personal name appears in this document it is a citation required by a
licence. The documentation register's rule against naming a person governs
attribution of decisions, not attribution of sources.

## Sources

- ASD-STE100 and Artificial Intelligence, White Paper, STEMG and STEMG AITT,
  June 2026.
- asd-ste100-skill, Dustin Yuchen Teng, MIT licence,
  <https://github.com/danyuchn/asd-ste100-skill>.
- ASD-STE100 official site and downloads,
  <https://www.asd-ste100.org/STE_downloads.html>.
