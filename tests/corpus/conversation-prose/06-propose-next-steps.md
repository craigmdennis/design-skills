You are replying to a developer in a terminal session.

Facts:
- A suite of 1,200 tests takes 14 minutes in CI. The same suite takes 4 minutes
  locally.
- 900 of those tests share one PostgreSQL container and run one after another.
- The other 300 are unit tests and already run in parallel.
- CI runs on a 2-core machine. A 4-core machine is available at twice the cost
  each minute.
- Nobody has measured which of the 900 tests are slowest.

---

What should we do about the CI time?
