You are replying to a developer in a terminal session.

Facts:
- The crawler in this repo uses a Bloom filter, built in
  `internal/dedupe/filter.go`, to decide whether a URL has already been
  fetched.
- A Bloom filter is a bit array plus k independent hash functions. Inserting
  an item sets the k bit positions its hashes point to. Querying hashes the
  same way: if any of the k positions is 0, the item was never inserted; if
  all are 1, it was probably inserted.
- False positives are possible; false negatives are not. The filter cannot
  list its contents or remove an item.
- This filter is sized for 30 million URLs at a false positive rate of about
  1 in 1,000, which works out to a 54 MB bit array and 10 hash functions.
- A false positive here means the crawler skips a URL it never fetched. That
  is acceptable because the weekly sitemap pass re-lists every URL.
- Storing the same 30 million URLs in a hash set (about 60 bytes per URL)
  would take roughly 1.8 GB.

---

I've never actually understood what a Bloom filter is. What is that thing in
dedupe/filter.go doing?
