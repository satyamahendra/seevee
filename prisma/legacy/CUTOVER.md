# Seevee cutover: old (bare VPS) → v2 (Docker)

Run each phase top to bottom. Every **✅ Check** must pass before you continue.
Golden rule: **nothing on the old app gets deleted until Phase 5**, and the dump must be on your PC first.

---

## Phase 0: Prep (on your PC)

- [ ] `deploy.yml` passes every env the app reads. Currently missing: `GEMINI_API_KEY`, `GEMINI_MODEL`, `USD_TO_IDR`. Add them to the GitHub secrets **and** to the `docker run ... seevee-app` command, or AI assist and pricing break.
- [ ] Copy the import script to the VPS:
    ```bash
    scp prisma/legacy/migrate-legacy.sql <user>@<vps>:~/
    ```

---

## Phase 1: Deploy v2 next to the old app

On the VPS:

```bash
sudo ss -tlnp | grep -E ':3000|:5432'
```

✅ Check: no output, so nothing else is using v2's ports.

```bash
pg_dump --version
```

✅ Check: version is **17 or lower** (the v2 container runs Postgres 17 and can't restore newer dumps). If it's newer, stop and sort this out first.

Now publish a GitHub release so `deploy.yml` runs. Then:

```bash
docker ps --format '{{.Names}}\t{{.Status}}'
```

✅ Check: `seevee-db` and `seevee-app` are `Up`. The old app is still serving users.

---

## Phase 2: Freeze and dump the old app

Set variables for this shell (fill these in, **they're not saved anywhere**):

```bash
OLD_URL="postgresql://<old_user>:<old_pass>@localhost:5432/<old_db>"
U="<POSTGRES_USER secret>"
DB="<POSTGRES_DB secret>"
ADMINS="<WHITELISTED_EMAILS secret>"     # comma-separated
```

Stop the old app so nothing new is written to its DB (pick the line that matches how it runs):

```bash
pm2 stop <old-app>
# sudo systemctl stop <old-app>
```

✅ Check: the site no longer responds on the old app's port.

Dump the old DB:

```bash
pg_dump -Fc "$OLD_URL" > ~/seevee_old.dump
pg_restore --list ~/seevee_old.dump | grep -c 'TABLE DATA'
```

✅ Check: the count is about **14** (one per old table).

**On your PC**, download the dump. Once Phase 5 has run, this file is the only copy of your data:

```bash
scp <user>@<vps>:~/seevee_old.dump .
```

✅ Check: the file exists on your PC and is more than 0 bytes.

Record the old counts so you can compare them later:

```bash
psql "$OLD_URL" -c 'SELECT
 (SELECT count(*) FROM "user" WHERE email IS NOT NULL) users,
 (SELECT count(*) FROM account WHERE "accountId" IS NOT NULL) accounts,
 (SELECT count(*) FROM resume) resumes,
 (SELECT count(*) FROM "userCredits") credits,
 (SELECT count(*) FROM "creditTransactions") credit_tx,
 (SELECT count(*) FROM "purchaseHistory") orders'
```

Write them down: users **_ accounts _** resumes **_ credits _** credit_tx **_ orders _**

---

## Phase 3: Import into v2

### 3.1 Back up the v2 DB and check it's empty

```bash
docker exec seevee-db pg_dump -U $U -Fc $DB > ~/v2_before_import.dump
docker exec seevee-db psql -U $U -d $DB -c 'SELECT count(*) FROM "user"'
```

✅ Check: count is `0`. If not (you logged in while testing), clear the test data. This keeps the schema and migration history:

```bash
docker exec seevee-db psql -U $U -d $DB -c 'TRUNCATE "user", role, permission, product, verification CASCADE'
```

### 3.2 Stage the old data as schema `legacy`

```bash
docker cp ~/seevee_old.dump seevee-db:/tmp/old.dump
docker cp ~/migrate-legacy.sql seevee-db:/tmp/migrate-legacy.sql
docker exec seevee-db createdb -U $U seevee_legacy
docker exec seevee-db pg_restore -U $U --no-owner --no-privileges -d seevee_legacy /tmp/old.dump
docker exec seevee-db psql -U $U -d seevee_legacy -c 'ALTER SCHEMA public RENAME TO legacy'
docker exec seevee-db sh -c "pg_dump -U $U --no-owner --no-privileges -n legacy seevee_legacy | psql -U $U -d $DB -q -v ON_ERROR_STOP=1"
```

✅ Check:

```bash
docker exec seevee-db psql -U $U -d $DB -c 'SELECT count(*) FROM legacy."user"'
```

This should match the `users` number from Phase 2 (or be slightly higher if some old users had no email).

### 3.3 Run the import

```bash
docker exec seevee-db psql -U $U -d $DB -v ON_ERROR_STOP=1 -v admins="$ADMINS" -f /tmp/migrate-legacy.sql
```

✅ Check: the output ends with `DROP SCHEMA` then `COMMIT`.

If it fails, everything rolled back and the v2 tables are untouched. Remove the staged schema, fix the cause, then rerun from the last command of 3.2:

```bash
docker exec seevee-db psql -U $U -d $DB -c 'DROP SCHEMA legacy CASCADE'
```

### 3.4 Verify

```bash
docker exec seevee-db psql -U $U -d $DB -c 'SELECT
 (SELECT count(*) FROM "user") users,
 (SELECT count(*) FROM account) accounts,
 (SELECT count(*) FROM resume) resumes,
 (SELECT count(*) FROM user_credit) credits,
 (SELECT count(*) FROM credit_transaction) credit_tx,
 (SELECT count(*) FROM "order") orders,
 (SELECT count(*) FROM user_role WHERE role_name = $$admin$$) admins'
```

✅ Check: every number matches what you wrote down in Phase 2, and `admins` ≥ 1.

### 3.5 Clean up

```bash
docker exec seevee-db dropdb -U $U seevee_legacy
docker exec seevee-db rm /tmp/old.dump /tmp/migrate-legacy.sql
docker restart seevee-app
```

---

## Phase 4: Go live

Point nginx at v2. In the site config, change `proxy_pass` to `http://127.0.0.1:3000`, then:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

✅ Check: `nginx -t` says `syntax is ok`, and the domain loads the v2 landing page.

Then check external services and the app:

- [ ] Google Cloud Console → OAuth redirect URI includes `<BETTER_AUTH_URL>/api/auth/callback/google`
- [ ] Midtrans dashboard → Payment notification URL is `https://<domain>/api/midtrans/webhook`
- [ ] Log in as admin → /products → recreate products (USD cents; old IDR products were not imported)
- [ ] Log in as an old user → same resumes, same credit balance, /history shows old transactions
- [ ] Log in as an old user who wasn't working before (one of the ~14 whose Google link was broken) → lands on their existing data, not an empty new account
- [ ] Open an old public resume link → it loads
- [ ] One test payment → credits are added

**Rollback** (only possible until Phase 5): point `proxy_pass` back to the old port, reload nginx, run `pm2 start <old-app>`.

---

## Phase 5: Remove the old app (wait a few days)

Only once v2 has run cleanly **and** `seevee_old.dump` is safely on your PC:

```bash
pm2 delete <old-app> && pm2 save
# or: sudo systemctl disable --now <old-app> && sudo rm /etc/systemd/system/<old-app>.service && sudo systemctl daemon-reload

sudo -u postgres dropdb <old_db>
rm -rf ~/<path-to-old-seevee>
rm ~/seevee_old.dump ~/v2_before_import.dump ~/migrate-legacy.sql
```

Optional: remove the host Postgres if nothing else on the VPS uses it (check with `sudo -u postgres psql -l` first):

```bash
sudo apt purge 'postgresql*' && sudo apt autoremove
sudo rm -rf /var/lib/postgresql /etc/postgresql
```

Done 🎉
