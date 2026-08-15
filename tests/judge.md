# Judging prompt

Two texts follow, marked BEGIN BEFORE and BEGIN AFTER. They say the same thing
in different words. A writing skill was applied to produce the second from the
first.

The skill's checks are listed below. For each check, decide whether each text
passes or fails it. A text fails a check when at least one sentence breaks it.

Judge only what the check states. Do not judge whether the writing is better,
shorter, or more pleasant. Do not reward the second text for being the second.

Output exactly two things and nothing else: the table below, then the totals
line under it.

| check | before | after | failing sentence |
|---|---|---|---|
| 1 animacy | PASS | PASS | |
| 2 literal restatement | FAIL | PASS | the check earned its keep |

Quote the failing sentence from whichever text failed. When both fail, quote the
one from the after text. Leave the cell empty when both pass.

Under the table, on its own line, put the totals in exactly this shape. The
denominator is the number of checks you were given.

TOTALS before 4/15 after 13/15

===== CHECKS =====

[paste the contents of ~/.claude/skills/conversation-prose/checks.md here, or
the equivalent checklist for the skill under test]

===== BEGIN BEFORE =====

[paste the before text]

===== BEGIN AFTER =====

[paste the after text]
