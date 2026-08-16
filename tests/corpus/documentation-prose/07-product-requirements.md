Write documentation from the facts below.

Facts:
- The feature is a bulk export for the reporting dashboard. Today a user
  exports one report at a time, and a support ticket every week asks for more.
- Accounts holding more than 50 reports are the ones that ask. Those are about
  8 per cent of accounts and about 40 per cent of revenue.
- The export runs as a background job and emails a link when it finishes. A
  link expires after 24 hours.
- The first release covers CSV. Parquet and JSON wait for a later release.
- A job over 500 reports is rejected, with a message naming the limit.
- Priya Raman proposed the feature on 2026-04-02 after a customer call, and the
  team agreed the scope on 2026-04-09. Marcus Webb owns delivery.
- Success is the weekly count of those support tickets, which should reach zero
  within two months of release.

---

Write the product requirements document.
