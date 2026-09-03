#!/usr/bin/env node
//
// field-notes: register the capture hooks with Codex
//
//   node install-codex-hooks.js              register
//   node install-codex-hooks.js --uninstall  remove exactly what was registered
//
// Codex hooks use the same events, stdin payload, and stdout contract as
// Claude Code's, so three of the four capture scripts run unchanged:
// inject-instructions (SessionStart), capture-feedback and prompt-rationale
// (UserPromptSubmit). capture-insights stays Claude-only — it parses Claude
// Code's JSONL transcript for callouts only the `explanatory` output style
// produces, so it is not registered here. This script merges its entries
// into ~/.codex/hooks.json (CODEX_HOME respected), backs the file up to
// hooks.json.bak before any write, never touches other keys or entries, and
// adds nothing twice on a rerun. This is a user-run installer, so unlike the
// hooks it fails loudly.

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const ENTRIES = [
  {
    event: 'SessionStart',
    script: 'inject-instructions.js',
    statusMessage: 'field-notes: capture instructions',
    timeout: 10,
  },
  { event: 'UserPromptSubmit', script: 'capture-feedback.js', timeout: 10 },
  { event: 'UserPromptSubmit', script: 'prompt-rationale.js', timeout: 10 },
];

const codexHome = process.env.CODEX_HOME || path.join(os.homedir(), '.codex');
const file = path.join(codexHome, 'hooks.json');
const uninstall = process.argv.includes('--uninstall');

function commandFor(entry) {
  return `node "${path.join(__dirname, entry.script)}"`;
}

let config = { hooks: {} };
if (fs.existsSync(file)) {
  try {
    config = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    console.error(`${file} contains invalid JSON (${err.message}).`);
    console.error('Nothing was changed. Fix or remove the file, then rerun.');
    process.exit(1);
  }
}
if (typeof config !== 'object' || config === null || Array.isArray(config)) {
  console.error(`${file} is not a JSON object. Nothing was changed.`);
  process.exit(1);
}
if (typeof config.hooks !== 'object' || config.hooks === null || Array.isArray(config.hooks)) {
  config.hooks = {};
}

const isMine = (h) =>
  h && typeof h.command === 'string' && h.command.includes(__dirname);

let added = 0;
let removed = 0;

if (uninstall) {
  for (const [event, groups] of Object.entries(config.hooks)) {
    if (!Array.isArray(groups)) continue;
    for (const group of groups) {
      if (!Array.isArray(group.hooks)) continue;
      const before = group.hooks.length;
      group.hooks = group.hooks.filter((h) => !isMine(h));
      removed += before - group.hooks.length;
    }
    config.hooks[event] = groups.filter(
      (g) => !Array.isArray(g.hooks) || g.hooks.length > 0
    );
    if (config.hooks[event].length === 0) delete config.hooks[event];
  }
  if (removed === 0) {
    console.log(`No entries pointing at ${__dirname} found in ${file}.`);
    process.exit(0);
  }
} else {
  for (const entry of ENTRIES) {
    const command = commandFor(entry);
    if (!Array.isArray(config.hooks[entry.event])) config.hooks[entry.event] = [];
    const groups = config.hooks[entry.event];
    const exists = groups.some(
      (g) => Array.isArray(g.hooks) && g.hooks.some((h) => h && h.command === command)
    );
    if (exists) continue;
    const hook = { type: 'command', command, timeout: entry.timeout };
    if (entry.statusMessage) hook.statusMessage = entry.statusMessage;
    groups.push({ matcher: '*', hooks: [hook] });
    added += 1;
  }
}

if (fs.existsSync(file)) fs.copyFileSync(file, `${file}.bak`);
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, JSON.stringify(config, null, 2) + '\n');

if (uninstall) {
  console.log(`Removed ${removed} entr${removed === 1 ? 'y' : 'ies'} from ${file}.`);
} else if (added === 0) {
  console.log(`Already registered in ${file}; nothing to do.`);
} else {
  console.log(`Registered ${added} hook${added === 1 ? '' : 's'} in ${file}.`);
  console.log('Restart Codex to load them. Hooks only act in projects with .field-notes/notes.md.');
}
