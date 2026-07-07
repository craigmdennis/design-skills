#!/usr/bin/env node
//
// npx field-notes
//
// Thin wrapper around Claude Code's own plugin installer. The plugin system —
// not this script — copies files and registers hooks, so install, update, and
// uninstall all stay in Claude Code's hands. This script only saves typing:
//
//   claude plugin marketplace add craigmdennis/design-skills
//   claude plugin install field-notes@design-skills

'use strict';

const { spawnSync } = require('child_process');

const MARKETPLACE_REPO = 'craigmdennis/design-skills';
const PLUGIN_SPEC = 'field-notes@design-skills';

// Windows resolves `claude` (a .cmd shim) only through a shell.
const shell = process.platform === 'win32';

function claude(args) {
  const res = spawnSync('claude', args, { encoding: 'utf8', shell });
  return {
    ok: res.status === 0,
    output: `${res.stdout || ''}${res.stderr || ''}`.trim(),
    missing: res.error && res.error.code === 'ENOENT',
  };
}

const probe = claude(['--version']);
if (probe.missing || (!probe.ok && !probe.output)) {
  console.error(
    'Could not find the `claude` CLI on your PATH.\n' +
      'Install Claude Code first: https://claude.com/claude-code\n\n' +
      'Or install the plugin manually from inside Claude Code:\n' +
      `  /plugin marketplace add ${MARKETPLACE_REPO}\n` +
      `  /plugin install ${PLUGIN_SPEC}`
  );
  process.exit(1);
}

console.log(`Adding marketplace ${MARKETPLACE_REPO} ...`);
const add = claude(['plugin', 'marketplace', 'add', MARKETPLACE_REPO]);
if (!add.ok && !/already/i.test(add.output)) {
  console.error(add.output || 'Failed to add the marketplace.');
  process.exit(1);
}

console.log(`Installing ${PLUGIN_SPEC} ...`);
const install = claude(['plugin', 'install', PLUGIN_SPEC]);
if (!install.ok && !/already/i.test(install.output)) {
  console.error(install.output || 'Failed to install the plugin.');
  process.exit(1);
}

console.log(
  '\nDone. Restart Claude Code (or run /reload-plugins) to activate the hooks.\n' +
    'Then say "keep field notes on this project" in any repo — or just start a\n' +
    'new project and the SessionStart hook will offer it automatically.\n\n' +
    'Privacy note: in tracked projects your prompts are logged verbatim to the\n' +
    'local, gitignored .field-notes/feedback-raw.md. Disable with\n' +
    'FIELD_NOTES_CAPTURE_FEEDBACK=0.'
);
