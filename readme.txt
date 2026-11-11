how to start:

1. clone repo

2. set env

3. seed data

-- Permissions
INSERT INTO permission (name) VALUES
  ('read home'),
  ('manage home'),
  ('read permissions'),
  ('manage permissions'),
  ('read roles'),
  ('manage roles'),
  ('read users'),
  ('manage users'),
  ('read products'),
  ('manage products'),
  ('read orders'),
  ('manage orders'),
  ('read reports'),
  ('manage reports')
ON CONFLICT (name) DO NOTHING;

-- Roles
INSERT INTO role (name) VALUES
  ('admin'),
  ('member')
ON CONFLICT (name) DO NOTHING;

-- RolePermissions
INSERT INTO role_permission (role_name, permission_name) VALUES
  ('admin', 'read home'),
  ('admin', 'manage home'),
  ('admin', 'read permissions'),
  ('admin', 'manage permissions'),
  ('admin', 'read roles'),
  ('admin', 'manage roles'),
  ('admin', 'read users'),
  ('admin', 'manage users'),
  ('admin', 'read products'),
  ('admin', 'manage products'),
  ('admin', 'read orders'),
  ('admin', 'manage orders'),
  ('admin', 'read reports'),
  ('admin', 'manage reports'),
  ('member', 'read home'),
  ('member', 'manage home')
ON CONFLICT (role_name, permission_name) DO NOTHING;

importing data from the old seevee (instead of step 3; the script seeds roles/permissions itself):

  a. pg_dump -Fc <old db> > seevee_backup.dump          (stop the old app first)
  b. createdb seevee_legacy && pg_restore --no-owner --no-privileges -d seevee_legacy seevee_backup.dump
     psql seevee_legacy -c 'ALTER SCHEMA public RENAME TO legacy'
  c. npx prisma migrate deploy                             (empty v2 db)
  d. pg_dump --no-owner --no-privileges -n legacy seevee_legacy | psql "$DATABASE_URL"
  e. psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -v admins="$WHITELISTED_EMAILS" -f prisma/legacy/migrate-legacy.sql
  f. dropdb seevee_legacy, then recreate products in /products (old IDR products are not imported)
