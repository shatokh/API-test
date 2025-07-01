FROM node:18-alpine AS deps
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /app
COPY package*.json ./
RUN if [ "$NODE_ENV" = "production" ]; then \
      npm ci --omit=dev --ignore-scripts; \
    else \
      npm install; \
    fi

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
USER node
CMD ["node", "server.js"]