# Этап установки зависимостей
FROM node:18-alpine AS deps

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app
COPY package*.json ./

# В prod — prod-зависимости без скриптов,
# в dev — все зависимости, но без postinstall (lefthook)
RUN if [ "$NODE_ENV" = "production" ]; then \
      npm ci --omit=dev --ignore-scripts; \
    else \
      npm ci --ignore-scripts; \
    fi

# Этап рантайма
FROM node:18-alpine AS runtime

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Даем право пользователю node записывать в /app
RUN chown -R node:node /app

EXPOSE 3000

# По умолчанию запускаемся от имени node
USER node

CMD ["node", "server.js"]