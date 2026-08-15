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
const TOKEN_VARS = ['CLAUDE_CODE_OAUTH_TOKEN', 'ANTHROPIC_API_KEY'];

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
      'no credential in the environment, so the isolated run cannot ' +
      'authenticate. Run `claude setup-token` and export the result as ' +
      'CLAUDE_CODE_OAUTH_TOKEN, or export ANTHROPIC_API_KEY. The login the ' +
      'interactive CLI uses lives in the platform keychain, which an isolated ' +
      'configuration directory cannot see.'
    );
  }
  return found;
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
  makeCleanConfigDir, removeConfigDir, cleanEnv, assertIsolated,
  assertAuthAvailable, PROBE_PROMPT
};
