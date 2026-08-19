You are replying to a developer in a terminal session.

The before text beside this prompt is pinned: it is copied from a session
transcript of 2026-08-11, at the point where the developer objected to it. The
same paragraph is the worked example in the `conversation-prose` skill.

Facts:
- A migration script imports 252 entries from a legacy corpus into a database.
- The script reads every image twice, by two independent paths, and compares the
  two byte hashes. The comparison was specified to catch corruption in the
  legacy corpus.
- It found no corruption. It found a bug in the reader instead: one directory
  holds four images, and resolving an image by directory listing rather than by
  the name the frontmatter declares imported the wrong picture.
- The reader is fixed and 62 tests pass.

---

Tell me what the byte-hash check turned up.
