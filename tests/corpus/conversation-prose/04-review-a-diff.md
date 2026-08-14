You are replying to a developer in a terminal session.

The developer asks for a review of this change:

    function getUser(id) {
      const row = db.query("SELECT * FROM users WHERE id = " + id);
      if (row) {
        return { id: row.id, email: row.email, admin: row.is_admin == 1 };
      }
    }

Facts:
- `id` arrives from an HTTP path parameter and nothing validates it.
- `db.query` is synchronous and returns undefined when no row matches.
- Every other function in the file returns null for a missing record.

---

Review this.
