'use strict';
const fs = require('node:fs');
const path = require('node:path');

// The key lives in a gitignored file at the repository root, so one command
// runs any phase with no shell setup. A variable already in the environment
// wins, which keeps an explicit export ahead of the file.
//
// Every entry point loads it. The judge once did not, and a full run reached
// the judging phase and stopped there, after the corpus phase had already been
// paid for.
function loadEnvFile() {
  // The test for the no-credential path deletes the variables from the child's
  // environment. Without this switch the file would put the key back, the run
  // would start, and the test would make real model calls.
  if (process.env.PROSE_TEST_SKIP_ENV_FILE) return;

  const file = path.join(__dirname, '..', '..', '.env.test');
  if (!fs.existsSync(file)) return;

  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, name, rawValue] = match;
    if (process.env[name]) continue;
    process.env[name] = rawValue.replace(/^["']|["']$/g, '');
  }
}

module.exports = { loadEnvFile };
