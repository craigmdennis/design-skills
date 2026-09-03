#!/usr/bin/env node
//
// field-notes: periodically ask the user for rationale
//
// Registered as a UserPromptSubmit hook. Once per session, after a few turns
// of activity in a tracked project, it prints a checkpoint reminder to stdout
// (UserPromptSubmit stdout is injected into Claude's context) prompting Claude
// to ask the user for the "why" behind recent decisions and log it to
// .field-notes/notes.md.
//
// Self-guarding: no-op unless the project is tracked (.field-notes/notes.md exists).
// Fires at most once per session, tracked by a sentinel keyed on session_id
// in the plugin's state dir. Threshold configurable via
// FIELD_NOTES_RATIONALE_TURNS (default 5; 0 disables). Best-effort: always
// exits 0.

'use strict';

const fs = require('fs');
const path = require('path');
const { readStdin, parsePayload, projectDir, isTracked, intEnv, stateDir } = require('./lib');

async function main() {
  const threshold = intEnv('FIELD_NOTES_RATIONALE_TURNS', 5);
  if (threshold === 0) return;

  const payload = parsePayload(await readStdin());
  const dir = projectDir(payload);
  if (!isTracked(dir)) return;

  // Only when we can key a per-session sentinel.
  const sessionId = typeof payload.session_id === 'string' ? payload.session_id : '';
  if (!/^[\w-]+$/.test(sessionId)) return;

  const cache = stateDir();
  if (!cache) return;

  const doneFile = path.join(cache, `${sessionId}.done`);
  if (fs.existsSync(doneFile)) return;

  const countFile = path.join(cache, `${sessionId}.count`);
  let count = 0;
  try {
    count = parseInt(fs.readFileSync(countFile, 'utf8'), 10);
  } catch {
    /* first turn */
  }
  if (!Number.isInteger(count) || count < 0) count = 0;
  count += 1;
  try {
    fs.writeFileSync(countFile, String(count) + '\n');
  } catch {
    return;
  }

  // Wait for a few turns of real activity before the one nudge.
  if (count < threshold) return;

  process.stdout.write(
    '[field-notes] Session checkpoint — this project keeps field notes for a future writeup. ' +
      'If the user has made any non-obvious decision, rejected an approach, or changed direction ' +
      'this session, ask them the "why" behind one or two of them now and log their answer to ' +
      '.field-notes/notes.md (and keep the Framing block current). Skip if nothing noteworthy has happened ' +
      "or they'd rather not. This reminder fires once per session.\n"
  );

  try {
    fs.writeFileSync(doneFile, '');
  } catch {
    /* best-effort */
  }
}

main().then(
  () => process.exit(0),
  () => process.exit(0)
);
