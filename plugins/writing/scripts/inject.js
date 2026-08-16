#!/usr/bin/env node
//
// writing: inject a skill file into the agent's context
//
// Registered twice in hooks.json:
//   SessionStart      -> conversation-prose SKILL.md   (the full standard, once)
//   UserPromptSubmit  -> conversation-prose checks.md  (the checklist, per turn)
//
// conversation-prose governs every reply, so loading it on demand is too late:
// by the time the standard is found to apply, the reply is written. A
// session-start injection loads the standard; a per-turn injection restates the
// checklist near the reply, because a file read once at session start stops
// affecting output as a session gets longer.
//
// Output shape: a SessionStart hook's plain stdout is discarded. Both events
// accept the JSON envelope below, so both use it. Emitting the envelope from
// Node also removes the `jq` dependency an equivalent shell hook would carry.
//
// Precedence: a copy under ~/.claude/skills/<skill>/ takes priority over the
// plugin's own. An edited copy is the one that applies, and the same text is
// never injected twice.
//
// Best-effort: always exits 0. A failure prints nothing at all.

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const EVENTS = ['SessionStart', 'UserPromptSubmit'];

function main() {
  const [event, skill, file] = process.argv.slice(2);
  if (!EVENTS.includes(event) || !skill || !file) return;

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
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: event,
        additionalContext: stripFrontmatter(text).trim()
      }
    }) + '\n');
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
