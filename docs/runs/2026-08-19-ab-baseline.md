# A/B baseline, frozen judge, noise floor

**Method:** A/B, generation mode with a frozen rubric. **Date:** 2026-08-19. **Model:** claude-opus-5, effort high. **Size:** 26 API calls, $2.03.

This file records one run and does not change. A later run adds a file.

## Method

Six prompts under `tests/corpus/skill-ab/`, each covering a genre the rewrite corpus lacks. Two arms answered all six with the committed skill, and each reply was judged against `git show HEAD:...checks.md` by a separate call restricted to check 16, ambiguous referents. The two arms are identical in every input, so the gap between their totals is the noise floor for this metric.

`tests/skill-ab.js` runs it. A canary pair prices the run from real usage before the arms start and stops the run when the projection exceeds the budget by more than 10 percent.

## Results

| Prompt | Arm A findings | Arm B findings | Exact hits A / B |
|---|---:|---:|---:|
| 01 give-feedback-to-the-author | 2 | 2 | 0 / 0 |
| 02 write-an-incident-review | 0 | 0 | 0 / 0 |
| 03 explain-a-tripled-estimate | 3 | 1 | 0 / 0 |
| 04 assess-a-shipped-bug | 3 | 3 | 1 / 0 |
| 05 decline-an-unsafe-request | 2 | 3 | 0 / 0 |
| 06 explain-a-bloom-filter | 1 | 2 | 1 / 0 |
| **Total** | **11** | **11** | |

**Noise floor: 0.**

## What the run shows

1. Two identical arms produced the same total, so the frozen rubric gives a metric that holds still between runs. The skill-training loop of 2026-08-17 had no such measurement, and its rising counts could not be read.
2. Per-prompt counts varied where the totals did not. Prompt 03 scored 3 then 1, prompt 05 scored 2 then 3, and prompt 06 scored 1 then 2. The largest single-prompt swing was 2, so a candidate edit counts as an effect at 8 findings or below, three clear of both arms.
3. The exact detectors found 2 violations across 12 replies, both long sentences. Generation with the skill loaded produces few mechanical failures.

## Limits

1. Six prompts give a direction and no confidence interval.
2. The judge applies one check. A candidate edit that lowers check 16 findings while raising another class would score as an improvement here.
3. One measurement of the noise floor. A second baseline pair would say whether 0 is typical or lucky.
