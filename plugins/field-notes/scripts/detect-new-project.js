#!/usr/bin/env node
//
// field-notes: detect a new, untracked project
//
// Registered as a SessionStart hook. When a session starts in a brand-new git
// project that isn't tracked yet, it prints a directive to stdout (SessionStart
// stdout is injected into Claude's context) suggesting the field-notes
// skill. With FIELD_NOTES_AUTO_TRACK=1 the directive tells Claude to run the
// skill without asking (full opt-in mode).
//
// Self-guarding: no-op unless the project (a) is a git work tree, (b) has at
// most FIELD_NOTES_NEW_PROJECT_COMMITS commits, (c) is not already tracked, and
// (d) has no .field-notes-ignore marker. Best-effort: always exits 0; the
// ONLY stdout it ever produces is the directive.

'use strict';

const { execFileSync } = require('child_process');
const { readStdin, parsePayload, projectDir, isTracked, isIgnored, intEnv, boolEnv } = require('./lib');

function git(dir, args) {
  try {
    return execFileSync('git', ['-C', dir, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 5000,
    }).trim();
  } catch {
    return null;
  }
}

async function main() {
  const payload = parsePayload(await readStdin());

  // Don't re-nag when the session start is just a compaction continuation.
  if (payload.source === 'compact') return;

  const dir = projectDir(payload);

  if (isTracked(dir) || isIgnored(dir)) return;

  // Must be inside a git work tree.
  if (git(dir, ['rev-parse', '--is-inside-work-tree']) !== 'true') return;

  // Count commits; an unborn HEAD (no commits yet) makes rev-list fail -> 0.
  const raw = git(dir, ['rev-list', '--count', 'HEAD']);
  const count = /^\d+$/.test(raw || '') ? parseInt(raw, 10) : 0;

  // Only a genuinely new project qualifies.
  if (count > intEnv('FIELD_NOTES_NEW_PROJECT_COMMITS', 2)) return;

  if (boolEnv('FIELD_NOTES_AUTO_TRACK')) {
    process.stdout.write(
      `[field-notes] This looks like a new project with no field notes yet (${count} commit(s)). ` +
        'Auto-tracking is enabled (FIELD_NOTES_AUTO_TRACK): invoke the field-notes skill now ' +
        'to set up the .field-notes/ decision log — no need to ask. To opt this project out ' +
        'permanently, create a .field-notes-ignore file in the project root.\n'
    );
  } else {
    process.stdout.write(
      `[field-notes] This looks like a new project with no field notes yet (${count} commit(s)). ` +
        'Ask the user once whether to keep field notes on it — a live decision log for a future ' +
        'writeup — and if yes, invoke the field-notes skill. If they decline, create a ' +
        '.field-notes-ignore file in the project root so this suggestion never repeats.\n'
    );
  }
}

main().then(
  () => process.exit(0),
  () => process.exit(0)
);
