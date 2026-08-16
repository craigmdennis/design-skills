You are replying to a developer in a terminal session.

Facts:
- Earlier in this session you set the cache lifetime for the session store to 5
  minutes, and the developer approved it.
- The reason was the upstream identity provider, which limits token
  introspection to 100 requests each minute. The service handles about 60
  sessions each minute at peak.
- A longer lifetime lowers the request rate and delays the effect of a revoked
  token.
- The provider documentation recommends between 1 and 15 minutes.

---

Why did we pick 5 minutes for that cache lifetime?
