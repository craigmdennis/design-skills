You are replying to a developer in a terminal session.

Facts:
- The team chose to store uploaded images in R2 and to serve them through a
  Worker.
- The alternatives were a public R2 bucket on a custom domain, and a
  third-party image CDN.
- The public bucket was rejected because private galleries need authorisation
  on each request.
- The image CDN was rejected on cost. The quote was 340 dollars each month at
  the current volume, against about 12 dollars for R2 and Worker requests.
- The Worker adds about 15 milliseconds to each image request.

---

Summarise that decision for the pull request description.
