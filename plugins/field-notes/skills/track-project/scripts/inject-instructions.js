// SessionStart hook: in tracked projects, print the capture instructions to
// stdout (SessionStart stdout reaches the model's context) and make sure git
// ignores .field-notes/ via the repo's local exclude file. Untracked
// projects get nothing. Same contract as every hook here: never throw,
// always exit 0.

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { readStdin, parsePayload, projectDir, isTracked } = require('./lib');

function git(dir, args) {
  return execSync(`git ${args}`, {
    cwd: dir,
    stdio: ['ignore', 'pipe', 'ignore'],
    timeout: 5000,
  })
    .toString()
    .trim();
}

// Append .field-notes/ to <gitdir>/info/exclude unless git already ignores
// it. The exclude file is local-only, so no tracked file changes — this is
// what keeps repos safe even when their .gitignore lacks the entry.
function ensureExcluded(dir) {
  try {
    git(dir, 'check-ignore -q .field-notes');
    return; // already ignored (gitignore, global excludes, or a prior run)
  } catch {
    // fall through: not ignored yet, or not a git repo
  }
  try {
    const gitDir = git(dir, 'rev-parse --git-common-dir');
    const exclude = path.resolve(dir, gitDir, 'info', 'exclude');
    fs.mkdirSync(path.dirname(exclude), { recursive: true });
    const current = fs.existsSync(exclude)
      ? fs.readFileSync(exclude, 'utf8')
      : '';
    if (!/^\.field-notes\/?\s*$/m.test(current)) {
      const sep = current === '' || current.endsWith('\n') ? '' : '\n';
      fs.appendFileSync(exclude, `${sep}.field-notes/\n`);
    }
  } catch {
    // not a git repo, or git not on PATH — nothing to protect
  }
}

// Ignore rules never apply to files git already tracks, so committed notes
// need the user, not the exclude file.
function trackedNotes(dir) {
  try {
    return git(dir, 'ls-files .field-notes') !== '';
  } catch {
    return false;
  }
}

(async () => {
  try {
    const payload = parsePayload(await readStdin());
    const dir = projectDir(payload);
    if (!isTracked(dir)) process.exit(0);
    ensureExcluded(dir);
    let out = fs.readFileSync(path.join(__dirname, 'instructions.md'), 'utf8');
    if (trackedNotes(dir)) {
      out +=
        '\nWarning: git tracks files under `.field-notes/`, and ignore rules do not apply to tracked files. Tell the user and offer `git rm -r --cached .field-notes` so the notes become local-only again.\n';
    }
    process.stdout.write(out);
  } catch {
    // best-effort: a failed injection must not degrade the session
  }
  process.exit(0);
})();
