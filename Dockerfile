FROM node:24-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ ca-certificates openssl curl \
  && rm -rf /var/lib/apt/lists/* \
  && npm install -g pnpm@11.18.0

WORKDIR /app
COPY . .

RUN pnpm install --frozen-lockfile \
  && pnpm --filter @ben/infra-db run generate \
  && pnpm --filter @ben/server-ben run build

ARG GIT_REV=unknown
ENV NODE_ENV=production \
    API_PORT=3333 \
    PERSISTENCE_DRIVER=sqlite \
    DATABASE_URL=file:/data/ben.db \
    GIT_REV=$GIT_REV
LABEL org.opencontainers.image.revision=$GIT_REV

VOLUME ["/data"]
EXPOSE 3333

WORKDIR /app/packages/infra/server-ben
CMD ["sh", "-c", "pnpm --filter @ben/infra-db run migrate:deploy && node dist/server.js"]
