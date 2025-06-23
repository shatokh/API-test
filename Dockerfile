# syntax=docker/dockerfile:1

####################################
# Stage 1: Builder (all deps + tests)
####################################
FROM node:18-bullseye-slim AS builder
LABEL maintainer="you@example.com"

WORKDIR /app

# 1) Install system tools & MongoDB so MemoryServer uses it
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

# 2) Force mongodb-memory-server to use system binary
ENV MONGOMS_SYSTEM_BINARY=/usr/bin/mongod

# 3) Install JS deps without postinstall scripts (skip lefthook)
COPY package*.json ./
RUN npm ci --ignore-scripts

# 4) Copy source for tests
COPY . .

####################################
# Stage 2: Runtime (production)
####################################
FROM node:18-alpine AS runtime
LABEL maintainer="you@example.com"

WORKDIR /app

# 1) Install wget and create non-root user in one layer
RUN apk add --no-cache wget \
 && addgroup -S appgroup \
 && adduser -S appuser -G appgroup

USER appuser

# 2) Copy app + prod-deps with read-only permissions for group/others
COPY --from=builder \
     --chown=appuser:appgroup \
     --chmod=0440 \
     /app ./

# 3) Expose port and configure healthcheck
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s \
  CMD ["wget","--quiet","--tries=1","--spider","http://localhost:3000/health"]

# 4) Start the application
ENTRYPOINT ["node","server.js"]
