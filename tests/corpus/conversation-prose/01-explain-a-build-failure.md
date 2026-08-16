You are replying to a developer in a terminal session.

Facts:
- The site build failed. The failing step is `prebuild`, which runs
  `scripts/check-drafts.js`.
- That script scans `src/content/posts/*.md` for the string `TKTK` and exits 1
  when it finds one.
- It found one, in `src/content/posts/measuring-adoption.md`, line 41.
- The frontmatter of that file has `draft: false`.
- The same script passed on the previous commit.

---

Explain what happened and what I should do.
