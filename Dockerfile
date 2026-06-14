# syntax=docker/dockerfile:1.7

FROM node:24-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:24-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# AUTH_SECRET is required at build time; provide a dummy that gets overridden at runtime.
ENV NODE_ENV=production
ENV AUTH_SECRET="build-time-placeholder-aaaaaaaaaaaaaaaa"
RUN npm run build

FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# minimal runtime bits
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/src/lib/db/schema.ts ./src/lib/db/schema.ts
COPY --from=builder /app/scripts ./scripts

# data dir is the persistent volume mount point in production (Railway mounts it via dashboard)
RUN mkdir -p /app/data /app/data/uploads

EXPOSE 3000

# Ensure data dirs exist on the volume (the volume mount shadows build-time mkdir),
# push schema (creates tables if missing) then start
CMD ["sh", "-c", "mkdir -p /app/data/uploads && npx drizzle-kit push && npm start"]
