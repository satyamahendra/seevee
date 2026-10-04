how to start:

1. clone repo

2. set env
   envs:
   DATABASE_URL=
   NODE_ENV=
   BETTER_AUTH_SECRET=
   BETTER_AUTH_URL=
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   MIDTRANS_SERVER_KEY=
   NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
   NEXT_PUBLIC_MIDTRANS_URL=
   WHITELISTED_EMAILS=
   GEMINI_APIKEY=

3. seed data
   -- Permissions
   INSERT INTO permission (name) VALUES
   ('manage home'),
   ('read permissions'),
   ('manage permissions'),
   ('read roles'),
   ('manage roles'),
   ('read users'),
   ('manage users'),
   ('read orders'),
   ('manage orders'),
   ('read products'),
   ('manage products'),
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
   ('admin', 'read orders'),
   ('admin', 'manage orders'),
   ('admin', 'read products'),
   ('admin', 'manage products'),
   ('admin', 'read reports'),
   ('admin', 'manage reports'),
   ('member', 'read home'),
   ('member', 'manage home')
   ON CONFLICT (role_name, permission_name) DO NOTHING;

4. procedure pushing db edits
   npx prisma generate
   npx prisma migrate dev --name "<your-migration-name>"
   npx prisma migrate deploy

5. > `prisma` must stay pinned to the exact same version as `@prisma/client`
> (see `package.json`). Installing a newer major (e.g. Prisma 8) silently
> removes the `migrate` command and breaks `migrate deploy` at deploy time.
