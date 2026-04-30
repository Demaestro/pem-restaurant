# PEM Operations Runbook

This runbook covers backup/restore, secrets management, on-call procedures, and
known incident playbooks for the PEM Restaurant platform.

---

## 1. Backup & Restore

### Supabase (production)

#### Daily logical backup

Use the Supabase project's built-in **Point-in-Time Recovery** (Pro plan +)
plus a nightly logical dump uploaded to object storage.

```bash
# Run nightly via cron / GitHub Actions
PGPASSWORD="$SUPABASE_DB_PASSWORD" pg_dump \
  --host "$SUPABASE_DB_HOST" \
  --port 5432 \
  --username postgres \
  --no-owner \
  --no-privileges \
  --format=custom \
  --file "pem-$(date -u +%Y%m%dT%H%M%SZ).dump" \
  postgres

aws s3 cp pem-*.dump s3://pem-backups/db/ \
  --storage-class STANDARD_IA \
  --sse AES256
```

Retain the last **30 daily** dumps and **12 monthly** dumps.

#### Restore to a fresh project

```bash
pg_restore \
  --host "$NEW_SUPABASE_DB_HOST" \
  --port 5432 \
  --username postgres \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --dbname postgres \
  pem-YYYYMMDDTHHMMSSZ.dump
```

Then apply `supabase/schema.sql` over the top to ensure new tables/columns
are present, run any pending migrations, and update `.env`'s
`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` to the new project before
restarting the API.

### Local JSON storage (development / single-instance fallback)

```bash
# Backup
cp data/submissions.json "data/submissions-$(date -u +%Y%m%dT%H%M%SZ).json"

# Restore
cp data/submissions-YYYYMMDDTHHMMSSZ.json data/submissions.json
```

### Verifying backup integrity

Each Friday run a restore-to-staging test:
1. Provision a temporary Supabase project (or local docker postgres).
2. Restore the most recent dump.
3. Run `npm test` (unit) and `npm run test:e2e` against the restored DB.
4. Tear down.

---

## 2. Secrets Management

### Required secrets

| Name | Purpose | Where it must live |
|---|---|---|
| `ADMIN_PASSWORD` | Owner-admin password (hashed at rest after first login) | Server env only |
| `SUPABASE_SERVICE_ROLE_KEY` | DB privileged access | Server env only |
| `PAYSTACK_SECRET_KEY` | Card payments + webhook HMAC | Server env only |
| `OPENAI_API_KEY` | AI dietary matcher | Server env only |
| `RESEND_API_KEY` | Transactional email | Server env only |
| `SENTRY_DSN` | Server-side error capture | Server env only |
| `VITE_SENTRY_DSN` | Client-side error capture | Build-time env |

### Production storage

Use **one** of: Doppler, HashiCorp Vault, AWS Secrets Manager, or 1Password
Connect. Inject secrets at process start; never write them to disk on the
host. CI/CD deploys must read from the secret manager, not from a checked-in
file.

### Rotation policy

| Secret | Cadence | Trigger |
|---|---|---|
| `ADMIN_PASSWORD` | 90 days | Or when an admin leaves |
| `SUPABASE_SERVICE_ROLE_KEY` | 180 days | Or on a suspected leak |
| `PAYSTACK_SECRET_KEY` | When Paystack notifies | Always rotate after a vendor incident |
| `OPENAI_API_KEY` | 180 days | Usage spike that doesn't match traffic |
| `RESEND_API_KEY` | 180 days | Bounce-rate spike from unknown sources |
| `SENTRY_DSN` | Only on team change | DSNs are not password-grade secrets but treat as such |
| Session cookies | 7 days (auto) | Janitor sweeps expired rows every 30 min |

### Rotating `ADMIN_PASSWORD`

1. Sign in as owner.
2. POST `/api/admin/change-password` with the new value.
3. Server hashes and stores via `persistAdminPassword` (writes to `.env`),
   clears all admin sessions.
4. Update the secret manager entry to match.

### Rotating Paystack key

1. Generate a new secret in the Paystack dashboard.
2. Update the secret manager.
3. Trigger a deploy (rolling, no downtime).
4. Update the webhook URL on the dashboard if the API origin changed.
5. Confirm a `charge.success` event flows through `POST /api/payments/paystack/webhook` and updates the order status.

---

## 3. On-call Playbooks

### Symptom: orders stuck in `awaiting_payment`

1. Check Paystack dashboard — was the charge captured?
2. Inspect the webhook logs in Sentry / log aggregator — did
   `verifyPaystackSignature` fail? If yes, the secret is mismatched.
3. As a last resort, an owner admin can mark the order as `received` from
   `/admin-orders` once payment is verified manually.

### Symptom: emails not sending

1. Confirm `RESEND_API_KEY` is set: `curl -H "Authorization: Bearer $RESEND_API_KEY" https://api.resend.com/domains`
2. Check `[mailer] send failed` lines in the logs.
3. If Resend is down, queued emails are lost (we do not currently retry).
   Customer-facing impact: order confirmations and verification emails.

### Symptom: 5xx spike on /api/orders

1. Check Sentry for stack traces.
2. Tail server logs for `api error` events with `status:5xx`.
3. If Supabase is the cause, fall back to local JSON by setting
   `STORAGE_MODE=local` and restarting (data writes will land in
   `data/submissions.json` until Supabase is healthy — keep an eye on
   reconciliation).

### Symptom: TOTP brute-force attempt

1. Check the `audit_logs` table for repeated `admin.login.totp_failed`
   from one IP.
2. The auth rate limiter caps at 10 attempts / 15 min by default. Tighten
   via `AUTH_RATE_LIMIT_MAX` if needed.
3. Disable + re-setup 2FA via `/api/admin/2fa/disable` + `/setup` if you
   suspect the secret was leaked.

---

## 4. Deployment

### Branch model

- `main` → production
- `claude/*` → feature branches; merged via PR

### Pre-deploy checklist

- [ ] `npm test` is green
- [ ] `npm run test:e2e` is green against staging
- [ ] `supabase/schema.sql` applied to the production DB
- [ ] All required env vars set in the secret manager
- [ ] `SENTRY_DSN` reachable
- [ ] `RESEND_API_KEY` reachable
- [ ] Paystack webhook URL points to the new origin

### Rollback

Frontend (Vercel/Netlify): redeploy the previous build from the dashboard.
Backend (Render/Fly/Railway): redeploy the previous image tag. The session
table tolerates rollback because tokens are hashed, not signed against
build-specific keys.

---

## 5. Compliance & Audit

The `audit_logs` table records:
- `admin.login.success`, `admin.login.failed`, `admin.login.totp_failed`
- `admin.password_changed`
- `admin.2fa.setup_started`, `admin.2fa.enabled`, `admin.2fa.disabled`
- `admin.settings.updated`
- `admin.order.status_changed`

Owner admins can query the last 500 entries via `GET /api/admin/audit-log`.
Retain audit log entries for at least **365 days** to satisfy typical
small-business compliance requirements.
