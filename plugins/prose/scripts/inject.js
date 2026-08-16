#!/usr/bin/env node
//
// prose: inject a skill file into the agent's context
//
// Registered twice in hooks.json:
//   SessionStart      -> conversation SKILL.md   (the full standard, once)
//   UserPromptSubmit  -> conversation checks.md  (the checklist, per turn)
//
// conversation governs every reply, so loading it on demand is too late:
// by the time the agent decides a reply needs it, the reply is written. A
// session-start injection loads the standard; a per-turn injection restates the
// checklist near the reply, because a file read once at session start stops
// affecting output as the session grows.
//
// Precedence: a copy under ~/.claude/skills/<skill>/ wins over the plugin's own
// copy. Anyone who edited the standard into their own words keeps that edit, and
// nobody pays twice for two near-identical copies of the same text.
//
// Best-effort: always exits 0. Stdout reaches the agent's context, so a failure
// prints nothing at all.

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

function main() {
  const [skill, file] = process.argv.slice(2);
  if (!skill || !file) return;

  const candidates = [
    path.join(os.homedir(), '.claude', 'skills', skill, file)
  ];
  if (process.env.CLAUDE_PLUGIN_ROOT) {
    candidates.push(path.join(process.env.CLAUDE_PLUGIN_ROOT, 'skills', skill, file));
  }

  for (const candidate of candidates) {
    let text;
    try {
      text = fs.readFileSync(candidate, 'utf8');
    } catch {
      continue;
    }
    // An empty file is a truncated write, not a deliberate silence. Fall
    // through to the next candidate instead of injecting nothing.
    if (!text.trim()) continue;
    process.stdout.write(stripFrontmatter(text).trim() + '\n');
    return;
  }
}

// Frontmatter is metadata for the skill loader. Injected text is read as prose,
// where a name/description block is noise.
function stripFrontmatter(text) {
  if (!text.startsWith('---\n')) return text;
  const end = text.indexOf('\n---\n', 4);
  return end === -1 ? text : text.slice(end + 5);
}

try {
  main();
} catch {
  // Never break a session over a context injection.
}
process.exit(0);
