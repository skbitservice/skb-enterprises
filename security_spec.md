# Security Specification & Test-Driven Design (TDD)
**Project Name:** SKB Enterprises Laptop Solutions & Spare Parts Depot Database Security Spec
**Security Architect:** DeepMind Security Sentinel

---

## 1. Core Data Invariants

1. **User Identity Invariant (Isolation):** A user is strictly forbidden from reading, listing, modifying, or creating any profile document under `/users/{userId}` where `{userId}` does not exactly match `request.auth.uid`.
2. **Booking Authenticity Invariant:** A booking document must always associate `userId` with the actual authenticated sender (`request.auth.uid`). Users can only query booking history where the `userId` matches their authenticated credit.
3. **Logistics Integrity Invariant:** User profile data or parts orders containing high-class PII (addresses, contact numbers, order rates) must not be browseable or listing-scraped by general signed-in users.
4. **State Transitions Invariant:** Standard clients cannot retroactively modify status fields (such as changing a status of `ready` to a malicious `delivered` without payment, or general state tampering).
5. **No Spoofing Invariant:** Users cannot set their own role to admin/technician or manipulate system rates.

---

## 2. The "Dirty Dozen" Poison Payloads

Here are 12 specific payloads representing exploits targeting identity, integrity, data-exhaustion, or unauthorized access:

### Payload 1: Profile Stealing (Identity Spoofing)
*   **Target Path:** `/users/malicious_uid_123`
*   **Action:** `set`
*   **Malicious Intent:** Try writing a profile with a random client ID to claim their identity.
*   **Blocked By:** `request.auth.uid == userId` check.

### Payload 2: General Admin Elevation
*   **Target Path:** `/users/{myAuthUid}`
*   **Payload:** `{ "role": "admin", "name": "Fake Admin", "email": "hacker@skbitservice.com" }`
*   **Malicious Intent:** Self-assigning `role: "admin"` to hijack privileges or bypass permissions.
*   **Blocked By:** `affectedKeys().hasOnly(...)` limiting editable fields during updates.

### Payload 3: Spoofed Booking Ownership
*   **Target Path:** `/bookings/booking_leak_1`
*   **Payload:** `{ "id": "booking_leak_1", "userId": "victim_uid_999", "brand": "HP", "model": "Omen" }`
*   **Malicious Intent:** Submit a laptop repair booking and charge it or list it under a victim's userId.
*   **Blocked By:** `incoming().userId == request.auth.uid` validation rule.

### Payload 4: Booking Status Fast-Forward
*   **Target Path:** `/bookings/active_repair_888`
*   **Payload:** `{ "status": "delivered", "paymentStatus": "paid" }`
*   **Malicious Intent:** Modifying repair status directly from `received` to `delivered` and bypass actual repair fee billing.
*   **Blocked By:** Strict state-locking and update action limits.

### Payload 5: Deny-of-Wallet Character Overload
*   **Target Path:** `/bookings/SPAM_LONG_ID_` + "A" * 5000
*   **Action:** `set`
*   **Malicious Intent:** Inject a massive key index to bloat index sizes and drive up Firebase transactional storage billing.
*   **Blocked By:** `isValidId(bookingId)` limiting length `<= 128` and matching secure character boundaries.

### Payload 6: Anonymous Booking Submission
*   **Target Path:** `/bookings/anon_booking_9`
*   **Action:** `create`
*   **Malicious Intent:** Creating bookings without verified login session or with spoofed token states.
*   **Blocked By:** `request.auth.token.email_verified == true` mandate.

### Payload 7: Invoice Amount Tampering (Price Drift)
*   **Target Path:** `/purchases/order_100`
*   **Payload:** `{ "partId": "hp_battery_01", "price": 1, "totalAmount": 1, "quantity": 1 }`
*   **Malicious Intent:** Checkout parts for Rs 1 instead of listed retail price index.
*   **Blocked By:** Validation rules ensuring integrity of incoming fields or server-side sync checks.

### Payload 8: Blanket Booking Scraper (Query Scrape)
*   **Target Path:** `/bookings`
*   **Action:** `list`
*   **Malicious Intent:** Scraping list of all NCR orders and target list values.
*   **Blocked By:** `allow list: if resource.data.userId == request.auth.uid` constraint.

### Payload 9: PII Address Harvest
*   **Target Path:** `/users/victim_uid_303`
*   **Action:** `get`
*   **Malicious Intent:** Download address and phone of another customer.
*   **Blocked By:** `allow get: if request.auth.uid == userId` safety limit.

### Payload 10: Ghost Fields Injection
*   **Target Path:** `/users/{myAuthUid}`
*   **Payload:** `{ "name": "Raj", "email": "raj@gmail.com", "phone": "99381903", "ghostSecurityToken": "secret_access" }`
*   **Malicious Intent:** Inject random metadata properties into the collection document that may be parsed by other layers.
*   **Blocked By:** `data.keys().hasAll(...) && data.keys().size() == N` creation checks and modification constraints.

### Payload 11: Relational ID Splicing
*   **Target Path:** `/bookings/booking_1`
*   **Payload:** `{ "id": "booking_1", "userId": "myAuthUid", "brand": "HP", "model": "Spectre", "issues": ["malicious_issue_id_not_exist"] }`
*   **Malicious Intent:** Create booking targeting a non-existing issue or corrupted schema index.
*   **Blocked By:** Structured enum/validation bounds.

### Payload 12: Terminal Booking State Rollback
*   **Target Path:** `/bookings/delivered_booking_400`
*   **Action:** `update`
*   **Payload:** `{ "status": "pending" }`
*   **Malicious Intent:** Modify an historic order that was already delivered and trigger duplicate parts shipping.
*   **Blocked By:** Terminal lock guards preventing writes on documents containing terminal status values (`delivered` or `ready`).

---

## 3. Test Runner Specification
These invariants and malicious payload cases are programmed for comprehensive test execution. All test branches must return `PERMISSION_DENIED` under custom configurations.
