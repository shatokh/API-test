# syntax=docker/dockerfile:1

####################################
# Stage 1: deps (support mongodb-memory-server + tests)
####################################
FROM node:18-bullseye-slim AS deps

# Определяем окружение сборки (production или development)
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Рабочая директория для установки зависимостей
WORKDIR /app

# Устанавливаем утилиты для HTTPS, GPG и сертификаты
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      wget gnupg curl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Импортируем GPG-ключ MongoDB и добавляем официальный репозиторий
RUN curl -fsSL https://pgp.mongodb.com/server-7.0.asc \
  | gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg \
 && echo "deb [signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg] https://repo.mongodb.org/apt/debian bullseye/mongodb-org/7.0 main" \
      > /etc/apt/sources.list.d/mongodb-org-7.0.list

# Устанавливаем системный пакет MongoDB (glibc)
RUN apt-get update \
 && apt-get install -y --no-install-recommends mongodb-org \
 && rm -rf /var/lib/apt/lists/*

# Копируем package-файлы и устанавливаем JS-зависимости без postinstall
COPY package*.json ./
RUN if [ "$NODE_ENV" = "production" ]; then \
      npm ci --omit=dev --ignore-scripts; \
    else \
      npm ci --ignore-scripts; \
    fi

# Принудительное использование системного бинаря mongod для mongodb-memory-server
ENV MONGOMS_SYSTEM_BINARY=/usr/bin/mongod

# Копируем весь проект (код и тесты)
COPY . .

####################################
# Stage 2: runtime (production)
####################################
FROM node:18-alpine AS runtime

# Рабочая директория для запуска приложения
WORKDIR /app

# Копируем зависимости и исходники из этапа deps
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app ./

# Даем непривилегированному пользователю права на запись в /app
RUN chown -R node:node /app

# Открываем порт приложения
EXPOSE 3000

# Запуск от непривилегированного пользователя node
USER node

# Команда запуска приложения
CMD ["node", "server.js"]