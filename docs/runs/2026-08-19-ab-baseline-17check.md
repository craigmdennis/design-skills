# A/B baseline against the shipped 17-check rubric

**Method:** A/B, generation mode with a frozen rubric. **Date:** 2026-08-19. **Model:** claude-opus-5, effort high. **Size:** 26 API calls, $2.24.

This file records one run and does not change. A later run adds a file.

## Why this run replaces the earlier baseline

The [first baseline](2026-08-19-ab-baseline.md) was measured hours earlier, against the 16-check rubric that was committed at the time. Merging writing 1.2.0 added check 17 to the file the judge reads from git, so the earlier figure and any later candidate figure would have come from two different rubrics. This run restores the comparison.

## Method

Six prompts under `tests/corpus/skill-ab/`. Two arms answered all six with the committed skill, and each reply was judged against `git show HEAD:...checks.md` by a separate call restricted to check 16, ambiguous referents. The two arms are identical in every input, so the gap between their totals is the noise floor for this metric.

## Results

| Prompt | Arm A findings | Arm B findings | Exact hits A / B |
|---|---:|---:|---:|
| 01 give-feedback-to-the-author | 2 | 2 | 0 / 0 |
| 02 write-an-incident-review | 0 | 0 | 0 / 0 |
| 03 explain-a-tripled-estimate | 1 | 2 | 0 / 0 |
| 04 assess-a-shipped-bug | 1 | 2 | 1 / 2 |
| 05 decline-an-unsafe-request | 3 | 2 | 0 / 0 |
| 06 explain-a-bloom-filter | 1 | 2 | 0 / 0 |
| **Total** | **8** | **10** | |

**Noise floor: 2.** Mean of the two arms: 9.0.

## What the run shows

1. The two arms differ by 2, where the earlier pair differed by 0. Two measurements of the same quantity give 0 and 2, so a single noise-floor reading understates the variation. A candidate edit counts as an effect at 5 findings or below: three clear of the lower arm.
2. The totals of 8 and 10 sit below the earlier pair's 11 and 11. The rubric gained a check between the two runs and the counts fell, so the difference belongs to run-to-run variation rather than to the rubric.
3. The exact detectors found 3 violations across 12 replies, all in one prompt.

## Limits

1. Six prompts give a direction and no confidence interval.
2. The judge applies one check of seventeen. A candidate that lowers check 16 findings while raising another class would score as an improvement here.
3. Two measurements of the noise floor, giving 0 and 2. A third pair would say which is typical.
