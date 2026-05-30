# Frontend container — Next.js standalone build.
# Relies on `output: 'standalone'` in next.config.ts.

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN npm install -g bun && bun install --frozen-lockfile
COPY . .
# NEXT_PUBLIC_* values are inlined into the client bundle at build time, so they
# must be present here (not only at runtime). Docker/AWS builds force every
# Refresh through the backend; Vercel builds leave FORCE_BACKEND unset.
ARG NEXT_PUBLIC_APP_ENV=mock
ARG NEXT_PUBLIC_FORCE_BACKEND=true
ENV NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV
ENV NEXT_PUBLIC_FORCE_BACKEND=$NEXT_PUBLIC_FORCE_BACKEND
RUN bun run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
