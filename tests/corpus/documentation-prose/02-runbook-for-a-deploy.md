Write documentation from the facts below.

Facts:
- Deploys run from the main branch only.
- The procedure is: run `npm run build`, check the output is under 4 MB, run
  `wrangler deploy --env production`, then confirm that `/healthz` returns 200
  within 60 seconds.
- When the health check fails, run `wrangler rollback --env production` and
  tell the on-call engineer in the eng-oncall channel.
- No deploy happens on a Friday after 15:00 UTC. Marcus Webb set that rule on
  2026-01-09 after an incident.
- The build step needs the SENTRY_AUTH_TOKEN variable.

---

Write the deploy runbook.
