#!/usr/bin/env node
//
// field-notes: capture Claude's insight blocks
//
// Registered as a Stop hook. When a turn ends it reads the session transcript
// (path arrives on stdin), extracts every "★ Insight" block Claude produced
// (the explanatory output style's boxed callouts), and appends any not seen
// before to <project>/.field-notes/insights-raw.md. A later writing pass can mine
// these as raw material.
//
// Note: these blocks only exist when Claude Code runs in the "explanatory"
// output style. In any other style this hook is a silent no-op.
//
// Self-guarding: no-op unless the project is tracked (.field-notes/notes.md exists).
// Best-effort: always exits 0. Dedups across turns and sessions via a hash
// sidecar (.field-notes/.insights-seen), so re-scanning the whole transcript each
// turn never produces duplicates.

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { readStdin, parsePayload, projectDir, isTracked, timestamp, ensureFile, appendFile } = require('./lib');

// Carve insight blocks out of one assistant text chunk: from the line
// containing "Insight" plus box-drawing chars through the next line that is
// nothing but box-drawing chars.
function extractBlocks(text) {
  const blocks = [];
  let capturing = false;
  let block = '';
  for (const line of text.split('\n')) {
    if (!capturing && line.includes('Insight') && line.includes('─')) {
      capturing = true;
      block = line + '\n';
      continue;
    }
    if (capturing && /^\s*─+\s*$/.test(line)) {
      blocks.push(block + line);
      capturing = false;
      block = '';
      continue;
    }
    if (capturing) block += line + '\n';
  }
  return blocks;
}

async function main() {
  const payload = parsePayload(await readStdin());
  const dir = projectDir(payload);
  if (!isTracked(dir)) return;

  const transcript = payload.transcript_path;
  if (!transcript || !fs.existsSync(transcript)) return;

  let raw;
  try {
    raw = fs.readFileSync(transcript, 'utf8');
  } catch {
    return;
  }

  // Pull all assistant text out of the JSONL transcript.
  const blocks = [];
  for (const line of raw.split('\n')) {
    if (!line.trim()) continue;
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    if (entry.type !== 'assistant') continue;
    const content = entry.message && entry.message.content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (part && part.type === 'text' && typeof part.text === 'string') {
        blocks.push(...extractBlocks(part.text));
      }
    }
  }
  if (!blocks.length) return;

  const log = path.join(dir, '.field-notes', 'insights-raw.md');
  const seenFile = path.join(dir, '.field-notes', '.insights-seen');
  ensureFile(
    log,
    "# Insights (raw)\n\nClaude's insight callouts, auto-captured from session transcripts. Append-only, deduped. Gitignored.\n"
  );
  ensureFile(seenFile, '');

  let seen;
  try {
    seen = new Set(fs.readFileSync(seenFile, 'utf8').split('\n').filter(Boolean));
  } catch {
    return;
  }

  for (const block of blocks) {
    if (!block.replace(/\s/g, '')) continue; // whitespace-only fragment
    const hash = crypto.createHash('md5').update(block).digest('hex');
    if (seen.has(hash)) continue;
    appendFile(log, `\n[${timestamp()}]\n${block}\n`);
    appendFile(seenFile, hash + '\n');
    seen.add(hash);
  }
}

main().then(
  () => process.exit(0),
  () => process.exit(0)
);
