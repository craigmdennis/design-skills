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
- **Copying `~/.claude/.credentials.json` into the throwaway directory.**
  This was tried first. The copy was mechanically correct: the copied file
  was byte-identical to the source, and the throwaway directory held exactly
  the two expected entries at the required permissions. The run still
  returned `Not logged in`. Inspecting only the key names of the source file
  (never its values) showed a single top-level key, `mcpOAuth`, holding
  OAuth state for one installed plugin, and no account-level access token.
  The account login this machine's interactive CLI uses lives in the
  platform keychain, not in that file, and no file copy carries a keychain
  entry. This finding is why the route below replaced the file-copy
  approach.

## Route chosen

The credential comes from the environment, in `CLAUDE_CODE_OAUTH_TOKEN` or
`ANTHROPIC_API_KEY`, and nothing is copied to disk. `claude setup-token`
produces a long-lived token against a subscription; that token is exported
into the shell environment before a run. `cleanEnv` passes the whole
environment through unchanged, so the variable reaches the isolated call.

Constraints on this route:

- The throwaway configuration directory is created at mode `0700` and holds
  only an empty settings file. Nothing from the real configuration directory
  is copied into it, because copying anything would defeat the isolation
  this mechanism exists to provide.
- `assertAuthAvailable` checks for one of the two accepted variables and
  returns its name, never its value, so a caller can report which one was
  used without exposing the credential. A missing credential throws with
  instructions naming `claude setup-token` and the keychain, rather than
  falling through to an unauthenticated run.
- The throwaway directory is deleted at the end of every run, including on a
  thrown error, because the CLI writes session transcripts into it while it
  runs.

## Verification

A probe prompt is sent as the first message of every clean run, before any
corpus prompt, asking the model to list every skill, instruction file, and
injected reminder in its context, or reply `NONE` if there are none. The
harness checks the reply for the name of either prose skill, or for a
mention of a hook or a routing line, and refuses to proceed if any appears.

CLI version observed on this machine at implementation time: `2.1.233`. The
mechanisms above were established against `2.1.232`.

## Verification status: not yet run

The live probe against the real CLI has not been run under this route. It
needs a credential in the environment, in `CLAUDE_CODE_OAUTH_TOKEN` or
`ANTHROPIC_API_KEY`, that had not been created at the time this note was
last updated. The directory-isolation mechanism and `assertAuthAvailable`
are exercised and covered by unit tests; the live-call confirmation is
outstanding until a token is exported and the probe is run once.
