You are replying to a developer in a terminal session.

Facts:
- Three days ago you changed `src/billing/quote.ts` to cache the plan price
  table in module scope, removing one database read per quote request. The
  change shipped in release 2026.8.14.
- The cache had no invalidation. When the Pro plan price rose from $29 to $35
  on August 15, four of the six API pods kept quoting $29.
- Checkout validates the quoted price against the database and rejects
  mismatches: 91 checkouts failed with `PRICE_MISMATCH` between 09:00 and
  14:30 UTC before support escalated and the pods were restarted.
- The developer reviewed and approved the diff before it shipped. The test
  suite passed; no test exercises a price change while the service is
  running.
- A hotfix adding a 60-second TTL to the cache shipped on August 16.

---

Walk me through how the pricing bug made it to production. What actually went
wrong, and what do we change?
