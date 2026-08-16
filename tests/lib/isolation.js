'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// Verified against CLI 2.1.232. The probe in assertIsolated is what actually
// proves isolation, so a wrong value here fails loudly instead of producing a
// flattering number.
const CONFIG_DIR_VAR = 'CLAUDE_CONFIG_DIR';

// An isolated configuration directory cannot see the login the interactive CLI
// uses, which lives in the platform keychain. `~/.claude/.credentials.json`
// does not carry the account token either; on the machine this was built for it
// held only a plugin's OAuth state. So the credential comes from the
// environment and nothing is copied to disk.
// Only ANTHROPIC_API_KEY works. Every call passes --bare, which reads neither
// OAuth nor the keychain, so a token from `claude setup-token` fails inside the
// CLI with "Not logged in" and exit 1. Accepting that token here would let the
// run start and fail one call later with a message about login.
const TOKEN_VARS = ['ANTHROPIC_API_KEY'];

// The CLI on PATH may be a wrapper that injects its own instructions and a
// project briefing. On the machine this was built for, that wrapper's briefing
// quoted the skill under test, so a probe through it described the skill while
// the same probe through the real binary reported no such skill.
// CLAUDE_CODE_EXECPATH names the real binary.
const CLAUDE_BIN = process.env.CLAUDE_CODE_EXECPATH || 'claude';

// A self-report probe cannot separate a clean context from a clean context plus
// harness text. Asked to list what it carries, the model counts its own system
// prompt and reports that something is present, whatever the configuration.
// This asks a question that only a context carrying the skill can answer, which
// is the one contaminant that would invalidate the measurement.
function probePrompt(skill) {
  return `Answer in one short sentence. What does the ${skill} writing skill ` +
    'say? If you have no such skill in your context, answer exactly: ' +
    'NO SUCH SKILL';
}

// The directory holds an empty settings file and nothing else. Copying anything
// from the real configuration directory would defeat the isolation this module
// exists to provide.
function makeCleanConfigDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prose-test-'));
  fs.chmodSync(dir, 0o700);
  fs.writeFileSync(path.join(dir, 'settings.json'), '{}\n');
  return dir;
}

// Every exit path deletes the directory: the end of a run, a thrown error, and
// an interrupted process. The CLI writes session transcripts into it.
function removeConfigDir(dir) {
  if (dir && fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

// Returns the name of the variable carrying the credential, never its value.
// The caller may print the name.
function assertAuthAvailable(env) {
  const source = env || process.env;
  const found = TOKEN_VARS.find(name => source[name]);
  if (!found) {
    throw new Error(
      'no ANTHROPIC_API_KEY, so the isolated run cannot authenticate. Put the ' +
      'key in .env.test at the repository root, as ANTHROPIC_API_KEY=sk-ant-… ' +
      'on one line, and the runner loads it. Get a key from ' +
      'console.anthropic.com. A token from `claude setup-token` does not work ' +
      'here: every call passes --bare, which reads neither OAuth nor the ' +
      'platform keychain.'
    );
  }
  return found;
}

function cleanEnv(configDir) {
  return Object.assign({}, process.env, { [CONFIG_DIR_VAR]: configDir });
}

function assertIsolated(probeOutput, skill) {
  if (!/NO SUCH SKILL/i.test(probeOutput)) {
    throw new Error(
      `the run is not isolated: the probe described ${skill} instead of ` +
      `reporting no such skill. It replied: ${probeOutput.slice(0, 200)}. ` +
      'A before call that already has a skill loaded produces a false number. ' +
      'See docs/superpowers/notes/2026-08-14-cli-isolation.md'
    );
  }
}

module.exports = {
  makeCleanConfigDir, removeConfigDir, cleanEnv, assertIsolated,
  assertAuthAvailable, probePrompt, CLAUDE_BIN
};
