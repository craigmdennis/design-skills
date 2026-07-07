// Shared helpers for the field-notes hooks.
//
// Every hook follows the same contract: read the hook payload as JSON on
// stdin, act only in tracked projects, never throw, always exit 0. A hook
// that crashes or blocks would degrade every session in every project once
// the plugin is installed, so everything here is deliberately best-effort.

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', () => resolve(''));
  });
}

function parsePayload(raw) {
  try {
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

function projectDir(payload) {
  return process.env.CLAUDE_PROJECT_DIR || payload.cwd || process.cwd();
}

// A project counts as tracked only when the skill has created
// .field-notes/notes.md. The dot-prefixed folder never collides with a
// project's own content directories (blog/, notes/, docs/).
function isTracked(dir) {
  try {
    return fs.existsSync(path.join(dir, '.field-notes', 'notes.md'));
  } catch {
    return false;
  }
}

function isIgnored(dir) {
  try {
    return fs.existsSync(path.join(dir, '.field-notes-ignore'));
  } catch {
    return false;
  }
}

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}

function intEnv(name, fallback) {
  const v = parseInt(process.env[name] || '', 10);
  return Number.isInteger(v) && v >= 0 ? v : fallback;
}

function boolEnv(name) {
  return ['1', 'true', 'yes'].includes(String(process.env[name] || '').toLowerCase());
}

// Mutable state directory for per-session sentinels. Prefers the plugin data
// dir when the harness provides one; falls back to a cache dir under ~/.claude.
function stateDir() {
  const base =
    process.env.CLAUDE_PLUGIN_DATA ||
    path.join(os.homedir(), '.claude', '.cache', 'field-notes');
  try {
    fs.mkdirSync(base, { recursive: true });
    return base;
  } catch {
    return null;
  }
}

function appendFile(file, text) {
  try {
    fs.appendFileSync(file, text);
    return true;
  } catch {
    return false;
  }
}

function ensureFile(file, header) {
  try {
    if (!fs.existsSync(file)) fs.writeFileSync(file, header);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  readStdin,
  parsePayload,
  projectDir,
  isTracked,
  isIgnored,
  timestamp,
  intEnv,
  boolEnv,
  stateDir,
  appendFile,
  ensureFile,
};
