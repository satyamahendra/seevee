# ─────────────────────────────────────────────
#  Stage 1: deps — install dependencies only
# ─────────────────────────────────────────────
FROM node:24-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci

# ─────────────────────────────────────────────
#  Stage 2: builder — build the Next.js app
# ─────────────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
ARG NEXT_PUBLIC_MIDTRANS_URL
ENV NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=$NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
ENV NEXT_PUBLIC_MIDTRANS_URL=$NEXT_PUBLIC_MIDTRANS_URL

COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npx prisma generate

COPY . .

RUN npm run build

# ─────────────────────────────────────────────
#  Stage 3: migrator — runs prisma migrate deploy
# ─────────────────────────────────────────────
FROM node:24-alpine AS migrator

ARG PRISMA_VERSION=7.10.0

WORKDIR /app

RUN printf '{"name":"migrator","private":true}' > package.json \
 && npm install --no-save --no-audit --no-fund "prisma@$PRISMA_VERSION" "dotenv@^17.4.2"

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

CMD ["npx", "prisma", "migrate", "deploy"]

# ─────────────────────────────────────────────
#  Stage 4: runner — minimal production image
# ─────────────────────────────────────────────
FROM node:24-alpine AS runner

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/@prisma/client-runtime-utils ./node_modules/@prisma/client-runtime-utils
COPY --from=builder /app/node_modules/@prisma/adapter-pg          ./node_modules/@prisma/adapter-pg
COPY --from=builder /app/node_modules/@prisma/driver-adapter-utils ./node_modules/@prisma/driver-adapter-utils
COPY --from=builder /app/node_modules/@prisma/debug               ./node_modules/@prisma/debug

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static   ./.next/static

RUN node -e "require.resolve('@prisma/adapter-pg');require.resolve('@prisma/client-runtime-utils');require.resolve('./prisma/generated/prisma/client.js');console.log('prisma runtime resolvable')"

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
