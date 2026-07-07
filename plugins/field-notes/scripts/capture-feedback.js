#!/usr/bin/env node
//
// field-notes: capture conversational feedback
//
// Registered as a UserPromptSubmit hook. On every prompt in a tracked project
// it appends the user's message verbatim to <project>/.field-notes/feedback-raw.md —
// the raw, append-only record of where the user corrects or redirects Claude.
// A later writing pass distills this into .field-notes/notes.md.
//
// Privacy: this writes prompts to disk (gitignored, local only). Disable it
// with FIELD_NOTES_CAPTURE_FEEDBACK=0.
//
// Self-guarding: no-op unless the project is tracked (.field-notes/notes.md exists).
// Best-effort: never blocks the prompt (always exits 0). Prints NOTHING to
// stdout — a UserPromptSubmit hook's stdout is injected into Claude's context,
// so any output here would pollute every turn.

'use strict';

const path = require('path');
const { readStdin, parsePayload, projectDir, isTracked, timestamp, ensureFile, appendFile } = require('./lib');

async function main() {
  if (String(process.env.FIELD_NOTES_CAPTURE_FEEDBACK || '') === '0') return;

  const payload = parsePayload(await readStdin());
  const dir = projectDir(payload);
  if (!isTracked(dir)) return;

  const prompt = typeof payload.prompt === 'string' ? payload.prompt : '';
  if (!prompt) return;

  const log = path.join(dir, '.field-notes', 'feedback-raw.md');
  ensureFile(
    log,
    '# Feedback (raw)\n\nAuto-captured user prompts, append-only. A later writing pass distills the corrections here into notes.md. Immutable — do not edit in place. Gitignored.\n'
  );
  appendFile(log, `\n[${timestamp()}]\n${prompt}\n`);
}

main().then(
  () => process.exit(0),
  () => process.exit(0)
);
