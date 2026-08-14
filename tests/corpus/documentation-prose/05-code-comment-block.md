Write documentation from the facts below.

Facts:
- The function is `resolveImagePath(frontmatterName, directory)`.
- It returns the absolute path of the image that a post's frontmatter names.
- An earlier version listed the directory and took the first file, which
  imported the wrong image when a directory contained more than one.
- It throws when the named file is absent, because a silent fallback caused
  that error.
- Callers pass an absolute directory path.

---

Write the comment block for this function.
