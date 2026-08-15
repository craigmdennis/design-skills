'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// Verified against CLI 2.1.232. The probe in assertIsolated is what actually
// proves isolation, so a wrong value here fails loudly instead of producing a
// flattering number.
const CONFIG_DIR_VAR = 'CLAUDE_CONFIG_DIR';

// An isolated configuration directory cannot see the credentials in the real
// one, so a run inside it fails with "Not logged in". Only this one file is
// copied across, with owner-only permissions, and removeConfigDir deletes the
// whole directory when the run ends. Nothing else from the real configuration
// directory is copied, which is what keeps the run isolated.
const CREDENTIALS = '.credentials.json';

const PROBE_PROMPT =
  'List by name every skill, instruction file, and injected reminder currently ' +
  'in your context. If there are none, reply with the single word NONE.';

const CONTAMINANTS = [
  /conversation-prose/i,
  /documentation-prose/i,
  /published-prose/i,
  /UserPromptSubmit/i,
  /SessionStart/i,
  /CLAUDE\.md/i
];

function makeCleanConfigDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prose-test-'));
  fs.chmodSync(dir, 0o700);
  fs.writeFileSync(path.join(dir, 'settings.json'), '{}\n');

  const source = path.join(os.homedir(), '.claude', CREDENTIALS);
  if (!fs.existsSync(source)) {
    throw new Error(
      `no credentials at ${source}. The isolated run cannot authenticate. ` +
      'Log in with the CLI, or set ANTHROPIC_API_KEY and use --bare instead.'
    );
  }
  const target = path.join(dir, CREDENTIALS);
  fs.copyFileSync(source, target);
  fs.chmodSync(target, 0o600);

  return dir;
}

// Every exit path deletes the directory: the end of a run, a thrown error, and
// an interrupted process. A copied credential left behind is the failure this
// guards against.
function removeConfigDir(dir) {
  if (dir && fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function cleanEnv(configDir) {
  return Object.assign({}, process.env, { [CONFIG_DIR_VAR]: configDir });
}

function assertIsolated(probeOutput) {
  for (const pattern of CONTAMINANTS) {
    if (pattern.test(probeOutput)) {
      throw new Error(
        `the run is not isolated: the probe returned ${pattern}. ` +
        'A before call that already has a skill loaded produces a false number. ' +
        'See docs/superpowers/notes/2026-08-14-cli-isolation.md'
      );
    }
  }
}

module.exports = {
  makeCleanConfigDir, removeConfigDir, cleanEnv, assertIsolated, PROBE_PROMPT
};
