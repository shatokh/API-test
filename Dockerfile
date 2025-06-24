# syntax=docker/dockerfile:1.6

############################################################
# Stage 1: Builder (только зависимости Node.js)
# Эта стадия стала намного проще и быстрее!
############################################################
FROM node:20-bullseye-slim AS builder
LABEL maintainer="you@example.com"

WORKDIR /app

# Для mongodb-memory-server (при локальном запуске тестов) не устанавливаем
# системную MongoDB, он скачает ее сам при необходимости.
# В CI мы используем service-контейнер.

# Копируем файлы с зависимостями для кэширования
COPY package*.json ./

# Устанавливаем зависимости Node.js
RUN npm ci --ignore-scripts

# Копируем остальной исходный код
# (Убедитесь, что у вас есть .dockerignore файл!)
COPY . .

# Раскомментируйте, если хотите запускать юнит-тесты (не API) на этом этапе
# RUN npm run test:unit

############################################################
# Stage 2: Runtime (финальный образ для продакшена)
# Эта стадия остается такой же - она уже была хорошо оптимизирована.
############################################################
FROM node:20-alpine AS runtime
LABEL maintainer="you@example.com"

WORKDIR /app

# Устанавливаем curl для healthcheck и создаем non-root пользователя
RUN apk add --no-cache curl \
    && addgroup -S appgroup \
    && adduser -S appuser -G appgroup

# Копируем собранное приложение из builder стадии
COPY --from=builder --chown=appuser:appgroup /app ./

# Переключаемся на non-root пользователя
USER appuser

# Устанавливаем неизменяемые права для безопасности
RUN find . -type f -exec chmod 0444 {} \; \
    && find . -type d -exec chmod 0555 {} \;

# Открываем порт и настраиваем проверку состояния
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD ["curl", "-fs", "http://localhost:3000/health"]

# Команда для запуска приложения
ENTRYPOINT ["node", "server.js"]