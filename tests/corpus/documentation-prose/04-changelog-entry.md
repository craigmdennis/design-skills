Write documentation from the facts below.

Facts:
- Version 2.4.0 shipped on 2026-08-01.
- The search index now updates one document at a time instead of rebuilding.
  The reindex went from about 90 seconds to about 3 seconds.
- A crash was fixed. Opening a document with no title threw a null reference
  error.
- The `--verbose` flag was removed. `--log-level debug` replaces it.
- Aisha Nkemelu proposed the incremental index and Dan Rivera reviewed it on
  2026-07-22.

---

Write the changelog entry.
