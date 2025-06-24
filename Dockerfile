# syntax=docker/dockerfile:1

####################################
# Stage 1: Builder (all deps + tests)
####################################
FROM node:18-bullseye-slim AS builder
LABEL maintainer="you@example.com"

WORKDIR /app

# System tools + MongoDB so MemoryServer uses it
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      ca-certificates \
      curl \
      git \
      gnupg \
      libcurl4 \
      tar \
      wget \
 && wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add - \
 && echo "deb [arch=amd64] https://repo.mongodb.org/apt/debian bullseye/mongodb-org/7.0 main" \
      > /etc/apt/sources.list.d/mongodb-org-7.0.list \
 && apt-get update \
 && apt-get install -y --no-install-recommends mongodb-org \
 && rm -rf /var/lib/apt/lists/* \
 && mkdir -p /root/.cache/mongodb-binaries

# Force mongodb-memory-server to use system binary
ENV MONGOMS_SYSTEM_BINARY=/usr/bin/mongod

# Install JS deps (skip lefthook)
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy source for tests
COPY . .

####################################
# Stage 2: Runtime (production)
####################################
FROM node:18-alpine AS runtime
LABEL maintainer="you@example.com"

WORKDIR /app

# Install wget & create non-root user
RUN apk add --no-cache wget \
 && addgroup -S appgroup \
 && adduser -S appuser -G appgroup

USER appuser

# Copy code and prod-deps
COPY --from=builder --chown=appuser:appgroup /app ./

# Drop write permissions but keep exec bits on dirs
RUN find . -type f -exec chmod 0444 {} \; \
 && find . -type d -exec chmod 0555 {} \;

# Expose & healthcheck
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s \
  CMD ["wget","--quiet","--tries=1","--spider","http://localhost:3000/health"]

# Start
ENTRYPOINT ["node","server.js"]
