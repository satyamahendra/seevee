-- One-shot import of the old seevee DB into the v2 schema.
-- Prereq: v2 migrations applied, old dump loaded into schema "legacy" (see readme.txt).
-- Run: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -v admins="a@x.com,b@y.com" -f prisma/legacy/migrate-legacy.sql

BEGIN;

-- Roles & permissions (readme seed + the perms the admin pages check)
INSERT INTO permission (name) VALUES
  ('read home'), ('manage home'),
  ('read permissions'), ('manage permissions'),
  ('read roles'), ('manage roles'),
  ('read users'), ('manage users'),
  ('read products'), ('manage products'),
  ('read orders'), ('manage orders'),
  ('read reports'), ('manage reports')
ON CONFLICT (name) DO NOTHING;

INSERT INTO role (name) VALUES ('admin'), ('member') ON CONFLICT (name) DO NOTHING;

INSERT INTO role_permission (role_name, permission_name)
SELECT 'admin', name FROM permission
UNION ALL SELECT 'member', 'read home'
UNION ALL SELECT 'member', 'manage home'
ON CONFLICT (role_name, permission_name) DO NOTHING;

-- Users (v2 requires email + name; users without email cannot log in anyway).
-- emailVerified forced true: old app was Google-only, and 14 users lost their account row in a
-- broken 2025-12-25 migration; better-auth only implicitly re-links Google if this is true.
INSERT INTO "user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt")
SELECT id, coalesce(nullif(trim(name), ''), split_part(email, '@', 1)), email, true, image, "createdAt", "updatedAt"
FROM legacy."user"
WHERE email IS NOT NULL;

-- Accounts: issuer backfill mirrors migration 20260829000000_add_issuer_to_account
INSERT INTO account (id, issuer, "accountId", "providerId", "userId", "accessToken", "refreshToken", "idToken",
                     "accessTokenExpiresAt", "refreshTokenExpiresAt", scope, password, "createdAt", "updatedAt")
SELECT coalesce(a.id, gen_random_uuid()::text),
       CASE WHEN a."providerId" = 'google' THEN 'https://accounts.google.com' ELSE '' END,
       a."accountId", a."providerId", a."userId", a."accessToken", a."refreshToken", a."idToken",
       a."accessTokenExpiresAt", a."refreshTokenExpiresAt", a.scope, a.password, a."createdAt", a."updatedAt"
FROM legacy.account a
JOIN "user" u ON u.id = a."userId"
WHERE a."accountId" IS NOT NULL; -- 19 junk rows (no provider/accountId) from the broken old migration

-- One role per user: admin if old "manage admin" holder or whitelisted, else member
INSERT INTO user_role (user_id, role_name)
SELECT u.id,
       CASE WHEN lower(trim(u.email)) = ANY (string_to_array(lower(replace(:'admins', ' ', '')), ','))
              OR EXISTS (SELECT 1 FROM legacy."userPermissions" up
                         JOIN legacy.permission p ON p.id = up.permission_id
                         WHERE up.user_id = u.id AND p.name = 'manage admin')
            THEN 'admin' ELSE 'member' END
FROM "user" u;

-- Resumes: keep ids so public share links survive
INSERT INTO resume (id, "userId", data, "isPublic", "createdAt", "updatedAt")
SELECT r.id, r."userId", coalesce(r.data, '[]'::jsonb), r.is_public, r.created_at, r.updated_at
FROM legacy.resume r
JOIN "user" u ON u.id = r."userId";

-- Credits: v2 allows one row per user; keep the latest if old data has duplicates
INSERT INTO user_credit (id, "userId", "totalCredits", "createdAt", "updatedAt")
SELECT DISTINCT ON (c.user_id) c.id, c.user_id, c.total_credits, c.created_at, c.updated_at
FROM legacy."userCredits" c
JOIN "user" u ON u.id = c.user_id
ORDER BY c.user_id, c.updated_at DESC;

INSERT INTO credit_transaction (id, "userId", "creditsUsed", result, "actionType", "createdAt", "updatedAt")
SELECT t.id, t.user_id, t.credits_used, t.generated, t.action_type, t.created_at, t.updated_at
FROM legacy."creditTransactions" t
JOIN "user" u ON u.id = t.user_id;

-- Orders (products are not migrated; order has no product link in v2)
INSERT INTO "order" (id, user_id, midtrans_order_id, status, gross_amount, paid_at, midtrans_response, created_at, updated_at)
SELECT o.id, o.user_id, coalesce(nullif(o.order_id, ''), o.id),
       CASE WHEN o.payment_status IN ('pending','accept','settlement','deny','cancel','expire','success')
            THEN o.payment_status::"OrderStatus" ELSE 'pending' END,
       o.amount_paid,
       CASE WHEN o.payment_status IN ('settlement','success') THEN o.updated_at END,
       o.logs, o.created_at, o.updated_at
FROM legacy."purchaseHistory" o
JOIN "user" u ON u.id = o.user_id;

-- Self-check: abort if any legacy row with a valid user got lost
DO $$
BEGIN
  IF (SELECT count(*) FROM resume) <> (SELECT count(*) FROM legacy.resume r JOIN "user" u ON u.id = r."userId")
  OR (SELECT count(*) FROM account) <> (SELECT count(*) FROM legacy.account a JOIN "user" u ON u.id = a."userId" WHERE a."accountId" IS NOT NULL)
  OR (SELECT count(*) FROM "user") <> (SELECT count(*) FROM legacy."user" WHERE email IS NOT NULL)
  OR (SELECT count(*) FROM credit_transaction) <> (SELECT count(*) FROM legacy."creditTransactions" t JOIN "user" u ON u.id = t.user_id)
  OR EXISTS (SELECT 1 FROM "user" u LEFT JOIN user_role ur ON ur.user_id = u.id WHERE ur.user_id IS NULL)
  THEN RAISE EXCEPTION 'legacy import count mismatch';
  END IF;
END $$;

DROP SCHEMA legacy CASCADE;

COMMIT;
