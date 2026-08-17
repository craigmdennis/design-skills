# writing

Three writing standards, one per genre. Each is a separate skill because the
rules that improve one genre make the other two worse.

| Writing | Skill | Standard |
|---|---|---|
| An agent's replies: explanations, status updates, summaries, plans, reviews, questions back | `conversation-prose` | ASD-STE100 subset, 16 checks |
| Documentation: skills, READMEs, specs, plans, code comments, pull request bodies | `documentation-prose` | Third-person impersonal, 18 checks |
| Prose published under an author's name: posts, case studies, resume copy | `published-prose` | Voice rules plus a personal profile |

Applying `published-prose` to a reply removes the comparison that would have
made a concept clear and produces false confidence where a caveat was honest.
Applying `conversation-prose` to a blog post removes the author's voice from it.

## Install

```bash
claude plugin marketplace add craigmdennis/design-skills
claude plugin install writing@design-skills
```

Restart the session afterwards. The hooks below are inactive until then.

## The two hooks

`conversation-prose` governs every reply, so loading it on demand is too late.
By the time the standard is found to apply, the reply is written. Two hooks correct that order.

Each hook prints a `hookSpecificOutput` JSON envelope naming its own event. A
`SessionStart` hook's plain stdout is discarded, so the envelope is required
there; both events accept it.

| Hook | Injects | Cost |
|---|---|---|
| `SessionStart` | `conversation-prose/SKILL.md` | about 6,700 tokens, once per session |
| `UserPromptSubmit` | `conversation-prose/checks.md` | about 650 tokens per turn |

The per-turn injection exists because a file read once at session start stops
affecting output as a session gets longer. The 16 checks restated on each turn
are what keep the standard applied at turn 90.

`documentation-prose` and `published-prose` load on demand from their
descriptions and cost nothing until invoked.

To stop both injections, disable the plugin with `/plugin`.

### A local copy takes priority

Before reading its own copy, each injection looks for
`~/.claude/skills/<skill>/<file>`. Where one exists it is injected instead.
An edited copy takes priority over the plugin's, and the same text is never
injected twice.

## The voice profile

`published-prose` reads
`~/.claude/skills/published-prose/voice-profile.md` before writing anything. The
profile records spelling convention, punctuation bans, when to write "I" and
when "we", which sentence habits must survive an edit, what numbers may be
published on which surface, and which words are banned.

Where no profile is installed, the skill offers two paths: a twelve-question
interview that writes a profile, or writing without one and asking for each
preference at the moment it applies. A profile counts as installed when it
contains the line `status: complete`, so an interrupted interview does not
install a partial profile.

The profile is written outside the plugin directory on purpose. A plugin update
replaces everything under the plugin, and preferences cannot be replaced.

To rebuild one, delete `voice-profile.md` and invoke the skill again.

## Editing them

The rules describe failures in writing generally, which is why they are
shareable. The specific bans belong to one author. Two parts are meant to be
replaced:

- **`conversation-prose`**, the section "Words the reader has banned". It ships
  with one worked example. Replace it.
- **`published-prose`**, the whole voice profile.

Copy the skill directory to `~/.claude/skills/<name>/` before editing. Edits
made inside the plugin are lost at the next `claude plugin update`, and a local
copy takes priority over the plugin's anyway.

## Measured result

Blinded and reproducible. Violations per 1,000 words fall by 52%
for `conversation-prose` and 84% for `documentation-prose`; the model-judged
check score rises from 59–63% to 96–98% and from 70–71% to 95–97%. Three of
the nine conversation-prose prompts carry before texts copied from real
session transcripts, so the corpus includes failures at the density a session
produces. The corpus, the harness, and the limits of what those figures show
are in the repository README and `docs/prose-test-report.md`.
`published-prose` is not measured.

## Limits

These skills borrow from ASD-STE100 (Simplified Technical English) and are not
an implementation of it. The STE dictionary is licensed and is not reproduced
here. They are not authoring tools for regulated technical publications, and
the ASD Simplified Technical English Maintenance Group has not endorsed them.

Parts of the ASD-STE100 description and the statement of limits are adapted from
the asd-ste100-skill by Dustin Yuchen Teng, MIT licensed:
<https://github.com/danyuchn/asd-ste100-skill>.
