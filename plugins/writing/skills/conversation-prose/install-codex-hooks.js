#!/usr/bin/env node
//
// writing: register the conversation-prose injection hooks with Codex
//
//   node install-codex-hooks.js              register
//   node install-codex-hooks.js --uninstall  remove exactly what was registered
//
// Codex hooks use the same events, stdin payload, and stdout envelope as
// Claude Code's, so inject.js runs unchanged; only the registration differs.
// This script merges two entries into ~/.codex/hooks.json (CODEX_HOME
// respected): a SessionStart injection of SKILL.md and a UserPromptSubmit
// injection of checks.md. The existing file is backed up to hooks.json.bak
// before any write, other keys and entries are never touched, and a rerun
// adds nothing twice. This is a user-run installer, so unlike the hooks it
// fails loudly.

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const ENTRIES = [
  {
    event: 'SessionStart',
    script: 'inject.js',
    args: 'SessionStart conversation-prose SKILL.md',
    statusMessage: 'Loading conversation-prose',
    timeout: 10,
  },
  {
    event: 'UserPromptSubmit',
    script: 'inject.js',
    args: 'UserPromptSubmit conversation-prose checks.md',
    statusMessage: 'Loading conversation-prose checks',
    timeout: 10,
  },
];

const codexHome = process.env.CODEX_HOME || path.join(os.homedir(), '.codex');
const file = path.join(codexHome, 'hooks.json');
const uninstall = process.argv.includes('--uninstall');

function commandFor(entry) {
  const script = path.join(__dirname, entry.script);
  return `node "${script}"` + (entry.args ? ` ${entry.args}` : '');
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
    groups.push({
      matcher: '*',
      hooks: [
        {
          type: 'command',
          command,
          timeout: entry.timeout,
          statusMessage: entry.statusMessage,
        },
      ],
    });
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
  console.log('Restart Codex to load them.');
}
