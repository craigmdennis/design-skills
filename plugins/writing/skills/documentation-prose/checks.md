# documentation-prose: run these on the draft before saving

Procedures, not word lists. A word list finds only the words on it. Run every check on every sentence and on every clause, including headings, table cells, and code comments.

1. **Personal name.** Every personal name, and every possessive referring to a person. Replace with the functional role (the author, the reader, the caller, the maintainer), or delete the sentence. A name inside a quoted example becomes [Name]. One exception: in a strategy document, a first name can name the owner of an action.
2. **Decision date.** Every date. If it records who decided something or when something was agreed, delete it. Version control holds that history with an author and a timestamp.
3. **Agent in a subordinate clause.** Read each subordinate clause. If it names the person acting, use the agentless passive: "when the user asks a question" becomes "when asked a question". The main clause stays imperative.
4. **Possessive determiner.** The user's, their, his, her, my, our. Delete the determiner. Where the noun then works as a general one, drop the article too: "the user's prose" becomes "the prose".
5. **Heading naming an owner.** Every heading and label states what the section covers, never whose it is.
6. **First and second person.** I, we, my, our, your, referring to the document's owner. Delete them. The imperative "you" is standard in instructions and stays.
7. **Figurative language.** Does each content word name what physically happened? Metaphor, idiom, analogy, and personification all go, including figurative phrasal verbs, which read as ordinary English: "glossed over", "went the same way", "bolt on". When a literal phrase is available, use it: "a dial worth turning" becomes "a parameter worth varying".
8. **Replacement that kept the image.** For every phrase replaced under check 7, ask whether the new wording carries the original picture. Answer who did it, what they did, and to what, then write that.
9. **Synonym for variety.** One concept, one word. Reuse the first term.
10. **One term per role.** One term for each role in the document, repeated. Varying it makes a reader ask whether two roles are meant.
11. **One idea per sentence.** Around 20 words in an instruction. Use the number to notice a sentence carrying two ideas, and split it.
12. **Active voice, subject first.** The main clause is active with its subject first. The agentless passive appears only in a subordinate clause, where check 3 puts it.
13. **Plainest accurate word.** The short common word. "Use" instead of "utilize", "help" instead of "facilitate". Replace jargon with the common word, and delete a word that adds no meaning.
14. **Cross-reference a reader may not have.** Every reference to another file. A shared document stands alone, so a pointer to a personal instruction file gets removed or replaced with the content it names.
15. **Quoted material is exempt.** Verbatim quotations, before-and-after pairs, banned phrases a rule prints, code samples, and command output are reference. No other check applies inside them.

Checks 16 to 18 apply to a change document: a pull request body, a changelog entry, or a release note. Any other document passes all three.

16. **A state that exists only inside the branch.** An approach tried and reverted, a defect introduced and fixed, a diagnostic method. Keep the mechanism a reviewer needs and remove the incident.
17. **A mechanism named by route or folder.** Every mechanism the change touches gets a term, defined once and reused. "extending the /x/ generator" names a route, not a mechanism.
18. **A missing out-of-scope part.** Where the change leaves a related mechanism unchanged, the document says so and gives the reason.
19. **A condition placed after its instruction.** A condition that limits a step goes before the step, so the reader tests it and then acts: "Run the migration if the backup finished" becomes "If the backup finished, run the migration." Applies to a clause naming a version, a permission, an operating system, or a prior step.
20. **A politeness word or a difficulty word in a step.** Delete "please" from an instruction. Delete "simply", "just", "easy", and "quickly" where they describe a step: each states how hard the reader will find the work, which the writer cannot know. Change the opening word of any sentence that repeats the one before it.

Checks 21 to 26 apply to every document.

21. **A number without its context.** Every number states its baseline, its period, and its cause. A percentage also gives the absolute values: "Spend fell 50%" becomes "Spend fell 50%, from $1M to $500K a year. Retiring the legacy billing service saved $350K."
22. **A vague quantity.** Replace "huge", "significant", "many", and every word like them with the amount, the period, and the population measured.
23. **Precision the reader does not need.** Round a number to the precision that can change a decision: "32.47%" becomes "32%".
24. **A fact that changes nothing.** Delete a number or a fact that has no effect on the decision or the task the document supports. A 50% saving on a $200 subscription is trivia.
25. **A figure without a sentence.** Every chart, screenshot, and diagram has a sentence that states what it shows and the conclusion it supports. Where the sentence makes the point alone, link to the figure or move it to an appendix.
26. **An answer that does not start with the answer.** In an FAQ, a question and answer section, or a reply to a review question, the first sentence is a core answer: yes or no, a number, a date, a numbered list, or "not yet known" with the follow-up. Context comes after it.

Checks 27 to 30 apply to a decision document: a memo, a proposal, a status update, a strategy document, or an incident review. Any other document passes all four.

27. **A list in place of an argument.** Paragraphs carry the reasoning. A list holds only steps or parallel items. A bet in a strategy document is a block of bold labels (Hypothesis, Evidence, What [team] delivers, Effect on the company, Measuring success, Milestones), each followed by a sentence or a paragraph.
28. **Length past the limit.** One page where the content allows. Six pages, or about 3,000 words, at most, with supporting detail in an appendix.
29. **A question the reader will ask, left unanswered.** Read the draft as a reviewer. Answer each that applies: clarification (an ambiguous term, a number with no unit or baseline), assumptions, evidence (source, sample, method), causes, effects (who is affected, for how long, the risk), and actions (what, when, the role accountable, the result expected).
30. **A setback left unstated.** State what went wrong, what has been done, what remains, and the change to the process. Make the system, the process, or the decision the subject, and name no person.
