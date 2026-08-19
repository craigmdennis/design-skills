# documentation-prose: run these on the draft before saving

Procedures, not word lists. A word list finds only the words on it. Run every check on every sentence and on every clause, including headings, table cells, and code comments.

1. **Personal name.** Every personal name, and every possessive referring to a person. Replace with the functional role (the author, the reader, the caller, the maintainer), or delete the sentence. A name inside a quoted example becomes [Name].
2. **Decision date.** Every date. If it records who decided something or when something was agreed, delete it. Version control holds that history with an author and a timestamp.
3. **Agent in a subordinate clause.** Read each subordinate clause. If it names the person acting, use the agentless passive: "when the user asks a question" becomes "when asked a question". The main clause stays imperative.
4. **Possessive determiner.** The user's, their, his, her, my, our. Delete the determiner. Where the noun then works as a general one, drop the article too: "the user's prose" becomes "the prose".
5. **Heading naming an owner.** Every heading and label states what the section covers, never whose it is.
6. **First and second person.** I, we, my, our, your, referring to the document's owner. Delete them. The imperative "you" is standard in instructions and stays.
7. **Figurative language.** Does each content word name what physically happened? Metaphor, idiom, analogy, and personification all go, including figurative phrasal verbs, which read as ordinary English: "glossed over", "went the same way", "bolt on".
8. **Replacement that kept the image.** For every phrase replaced under check 7, ask whether the new wording carries the original picture. Answer who did it, what they did, and to what, then write that.
9. **Synonym for variety.** One concept, one word. Reuse the first term.
10. **One term per role.** One term for each role in the document, repeated. Varying it makes a reader ask whether two roles are meant.
11. **One idea per sentence.** Around 20 words in an instruction. Use the number to notice a sentence carrying two ideas, and split it.
12. **Active voice, subject first.** The main clause is active with its subject first. The agentless passive appears only in a subordinate clause, where check 3 puts it.
13. **Plainest accurate word.** The short common word. "Use" instead of "utilize", "help" instead of "facilitate".
14. **Cross-reference a reader may not have.** Every reference to another file. A shared document stands alone, so a pointer to a personal instruction file gets removed or replaced with the content it names.
15. **Quoted material is exempt.** Verbatim quotations, before-and-after pairs, banned phrases a rule prints, code samples, and command output are reference. Checks 1 to 14 do not apply inside them.

Checks 16 to 18 apply to a change document: a pull request body, a changelog entry, or a release note. Any other document passes all three.

16. **A state that exists only inside the branch.** An approach tried and reverted, a defect introduced and fixed, a diagnostic method. Keep the mechanism a reviewer needs and remove the incident.
17. **A mechanism named by route or folder.** Every mechanism the change touches gets a term, defined once and reused. "extending the /x/ generator" names a route, not a mechanism.
18. **A missing out-of-scope part.** Where the change leaves a related mechanism unchanged, the document says so and gives the reason.
19. **A condition placed after its instruction.** A condition that limits a step goes before the step, so the reader tests it and then acts: "Run the migration if the backup finished" becomes "If the backup finished, run the migration." Applies to a clause naming a version, a permission, an operating system, or a prior step.
20. **A politeness word or a difficulty word in a step.** Delete "please" from an instruction. Delete "simply", "just", "easy", and "quickly" where they describe a step: each states how hard the reader will find the work, which the writer cannot know. Change the opening word of any sentence that repeats the one before it.
