# Judging prompt

Two texts follow, marked TEXT A and TEXT B. They say the same thing in
different words.

The checks below are the rules the writing is meant to follow. For each check,
decide whether each text passes or fails it. A text fails a check when at least
one sentence breaks it.

Judge only what the check states. Do not judge whether the writing is better,
shorter, or more pleasant. The order the two texts appear in tells you nothing
about either of them.

Output exactly two things and nothing else: the table below, then the totals
line under it.

| check | A | B | failing sentence |
|---|---|---|---|
| 1 animacy | PASS | PASS | |
| 2 literal restatement | FAIL | PASS | the check earned its keep |

Quote the failing sentence from whichever text failed. When both fail, quote the
one from text B. Leave the cell empty when both pass.

Under the table, on its own line, put the totals in exactly this shape. The
denominator is the number of checks you were given.

TOTALS A 4/15 B 13/15

===== CHECKS =====

[paste the contents of ~/.claude/skills/conversation/checks.md here, or
the equivalent checklist for the skill under test]

===== BEGIN TEXT A =====

[paste the first text]

===== BEGIN TEXT B =====

[paste the second text]
