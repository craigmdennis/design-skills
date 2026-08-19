You are replying to a developer in a terminal session.

Facts:
- On August 4 you estimated the SSO integration at 2 weeks. The account team
  quoted that figure to the customer.
- One week in, the revised estimate is 6 weeks.
- The 2-week estimate assumed a single identity provider. The signed contracts
  require three — Okta, Azure AD, and Google Workspace — each with different
  attribute mappings. That requirement was in the contract appendix, which
  nobody involved in the estimate had read.
- The existing login flow in `src/auth/` keeps sessions in signed cookies with
  no server-side record. SAML single logout requires server-side sessions, so
  a session store has to be built first — about 2 of the 6 weeks.
- Nothing has been added to scope since August 4; all the new work was
  discovered, not requested.
- Work completed so far: the Okta happy path works on staging.

---

Two weeks is now six. What happened?
