Write documentation from the facts below.

Facts:
- `POST /v1/exports` starts an export job.
- The body takes `format`, one of csv, json, or parquet, and an optional
  `since` timestamp in RFC 3339.
- It returns 202 with a body containing `job_id` and `status_url`.
- It returns 400 when `format` is absent or unrecognised, and 429 when the
  caller already has 3 running jobs.
- Jobs expire after 24 hours, and the download URL stops working then.
- Authentication is a bearer token in the Authorization header.

---

Write the API reference for this endpoint.
