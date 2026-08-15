# CLI isolation for before/after harness runs

## Problem

The harness sends twelve prompts to a Claude instance twice: once with no
skill loaded, producing the "before" text, and once with a skill supplied in
the prompt, producing the "after" text. This machine injects one of the
skills under test on `SessionStart` and routes to it from
`~/.claude/CLAUDE.md`. A plain `claude -p` call inherits both. Under that
condition the before call already carries the skill, the measured difference
between before and after collapses toward nothing, and every score the
harness reports afterward is wrong.

## Mechanisms tried, established empirically against CLI 2.1.232

- **`CLAUDE_CONFIG_DIR`.** Setting this environment variable redirects the
  configuration directory the CLI reads. A run with it set wrote its session
  files into a throwaway directory instead of `~/.claude`, which is the
  isolation the harness needs.
- **An isolated configuration directory alone.** A throwaway directory has no
  copy of the credentials at `~/.claude/.credentials.json`, so a run against
  it fails with `Not logged in - Please run /login`. Isolation and
  authentication are coupled: an isolated directory that authenticates
  requires deliberate credential handling.
- **`--bare`.** This flag skips hooks, auto-memory, and `CLAUDE.md`
  discovery. Its own help text states that OAuth and the keychain are never
  read under it, so it requires `ANTHROPIC_API_KEY`. That variable is not set
  on this machine, so `--bare` is not usable here without additional setup.

## Route chosen

Copy only `~/.claude/.credentials.json` into the throwaway configuration
directory, and delete the whole directory when the run ends. This was the
repository owner's explicit choice once told that isolation and
authentication are coupled and that copying the credential was the
alternative to `--bare` plus an API key.

Constraints on the copy:

- The throwaway directory is created at mode `0700` and the copied credential
  at mode `0600`.
- The credential is the only file copied. Nothing else from the real
  configuration directory is copied, because copying more would defeat the
  isolation this mechanism exists to provide.
- A missing credential throws with a clear message rather than falling
  through to an unauthenticated run.
- The directory is deleted at the end of every run, including on a thrown
  error, so a failing run cannot leave a copied credential behind.

## Verification

A probe prompt is sent as the first message of every clean run, before any
corpus prompt, asking the model to list every skill, instruction file, and
injected reminder in its context, or reply `NONE` if there are none. The
harness checks the reply for the name of either prose skill, or for a
mention of a hook or a routing line, and refuses to proceed if any appears.

CLI version observed on this machine at implementation time: `2.1.233`. The
mechanisms above were established against `2.1.232`.

## Verification result on this machine: blocked

Running the isolated probe against `2.1.233` on this machine did not reach
the model. It returned:

```
Not logged in · Please run /login
```

The credential copy itself is not at fault: the copied file is byte-identical
to the source, and the throwaway directory holds exactly two entries,
`settings.json` and `.credentials.json`, at the required permissions.

The cause is a difference in where this machine keeps the account
credential. Inspecting only the key names of `~/.claude/.credentials.json`
(never its values) shows a single top-level key, `mcpOAuth`, holding OAuth
state for one installed plugin. It holds no account-level access token. The
CLI on this machine authenticates its normal, non-isolated runs some other
way — most likely the platform keychain, which a file present in a
`CLAUDE_CONFIG_DIR` copy cannot carry, and which reading requires a
permission this task did not seek. `ANTHROPIC_API_KEY` is also unset here, so
the `--bare` route in the mechanisms above is unavailable as a fallback.

The route described above, copying `~/.claude/.credentials.json`, was
established and consented to on the assumption that this file holds the
account credential. On this machine it does not, so Step 5 of the task that
produced this note could not confirm isolation against a real call. The
directory-isolation mechanism itself is exercised and covered by the unit
tests; only the live-call confirmation is outstanding.
