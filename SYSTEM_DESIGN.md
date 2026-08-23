# System Design — Healthcare Appointment Manager

## Architecture

The system follows a standard three-tier design: a React (Vite) frontend, a Node/Express REST API, and a PostgreSQL database accessed through Sequelize ORM. Authentication uses JWTs issued at login and checked via Express middleware (`authenticate`/`authorize`) that gates routes by role — `patient`, `doctor`, or `admin`. Two external services are integrated: the Anthropic API for LLM-generated pre- and post-visit summaries, and SendGrid for transactional email (booking confirmations, cancellations, reminders, leave notices). A `node-cron` job (`* * * * *`) runs independently of the request/response cycle to process queued notifications, decoupling email delivery from the user-facing booking flow so a slow or failing mail provider never blocks a booking request.

## Preventing Double-Booking

Double-booking is prevented at the database layer, not just in application code. The `Appointments` table has a composite unique constraint, `unique_doctor_slot`, on `(doctor_id, slot_start)`, defined in a migration rather than only declared in the Sequelize model. This distinction matters: application-level checks (e.g., "query for an existing appointment before inserting") are vulnerable to race conditions, since two near-simultaneous requests can both pass the check before either commits. A DB-level unique index closes that gap — Postgres itself rejects the second insert atomically, regardless of timing.

The `bookAppointment` controller wraps the insert in a try/catch that checks `err.name === 'SequelizeUniqueConstraintError'` and returns a clean 4xx response ("This slot was just booked by someone else. Please choose another.") instead of a raw 500. This was verified directly: two `POST /api/appointments` requests were fired concurrently (via parallel PowerShell jobs) for the same `doctor_id`/`slot_start`. One request succeeded with a created appointment; the other returned the graceful conflict message. No crash, no duplicate row.

## LLM Integration and Failure Handling

The pre- and post-visit summary feature calls the Anthropic API (`api.anthropic.com/v1/messages`) from `llm.js`. The call is wrapped in a try/catch with a defined fallback: if the API call fails for any reason (auth failure, insufficient credits, network error), the system logs the error and falls back to a static summary rather than allowing the failure to propagate and block the surrounding operation — visit notes still save, and the appointment status still updates correctly. This was verified against a real failure mode: with a valid but under-funded API key, the Anthropic API returned a 400 `invalid_request_error` ("credit balance is too low"). The application logged this cleanly and completed the request via the fallback path, proving the try/catch boundary is correctly scoped around only the LLM call, not the surrounding transaction.

## Notification Retry and Failure Handling

Notifications (booking confirmations, cancellations, reminders, doctor-leave alerts) are written to a `Notifications` table with `status` (`pending`/`sent`/`failed`) and `attempts` columns rather than sent synchronously inline with the triggering request. The cron job polls for rows where `status IN ('pending', 'failed') AND attempts < 3`, attempts delivery via SendGrid, and updates `status` and increments `attempts` based on the outcome. Each send is individually wrapped in a try/catch, so one failing email does not stop the batch from processing the rest.

This was tested by intentionally pointing `SENDGRID_API_KEY` at an invalid value and creating three fresh notifications (via marking a doctor on leave for a date with active bookings). SendGrid returned genuine 401 `Unauthorized` responses. Over three consecutive cron cycles, all three notifications were retried, incremented from `attempts: 0` to `attempts: 3`, and then stopped being picked up by the query — landing permanently in `status: 'failed'` without ever crashing the job or blocking unrelated notifications. This confirms both the retry ceiling and the isolation between notification failures and core application flow.

## Trade-offs and Known Limitations

The retry mechanism is time-based (one attempt per cron tick) rather than exponential backoff, which is simpler but less efficient under sustained provider outages. A `status: 'failed'` notification that exhausts its three attempts currently has no operator-facing alert or manual-retry path — it is silently parked. The LLM fallback is a static message rather than a cached/simplified prompt retry, which is a reasonable trade-off for demo scope but would benefit from a secondary retry with backoff in production. Both gaps are acceptable given the project's evaluation focus on demonstrating resilience patterns rather than production hardening.

