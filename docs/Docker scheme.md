                        ┌──────────────────────────────────────┐
                        │              .env.docker            │
                        │  ┌────────────────────────────────┐  │
                        │  │ PORT=3000                      │  │
                        │  │ JWT_SECRET=…                   │  │
                        │  │ NODE_ENV=development           │  │
                        │  │ MONGO_URI=mongodb://mongo…     │  │
                        │  └────────────────────────────────┘  │
                        └──────────────────────────────────────┘
                                        │
                                        ▼

┌────────────────────────────┐ ┌──────────────────────────┐
│ docker-compose.yml │──────▶│ docker-compose.override.yml
│ (prod, metrics networks) │ │ (dev & test overrides) │
└────────────────────────────┘ └──────────────────────────┘
│ │ │
│ │ │
▼ ▼ ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Service │ │ Service │ │ Service │
│ mongo │ │ prom- │ │ api │
│ (DB, │ │ etheus │ │ (Node.js │
│ health │ │ metrics) │ │ +App) │
└──────────┘ └──────────┘ └──────────┘
│ │ │
│ │ │
▼ ▼ ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ push- │ │ grafana │ │ test │
│ gateway │ │ (dash- │ │ (Vitest) │
│ (metrics)│ │ boards) │ └──────────┘
└──────────┘ └──────────┘

# Описание схемы

## Файлы окружения

- **.env** — содержит переменные для локального запуска (например `MONGO_URI=mongodb://localhost:27017/authdemo`).
- **.env.docker** — содержит переменные для Docker (сервис `mongo` вместо `localhost`, общий `PORT`, `JWT_SECRET`, `NODE_ENV`).

## Dockerfile (multi–stage)

### stage deps

- Аргумент `ARG NODE_ENV` задаёт среду (`production` или `development`).
- Устанавливаются зависимости:
  - В **production** — `npm ci --omit=dev --ignore-scripts`.
  - В **development** — `npm ci --ignore-scripts`.

### stage runtime

- Копируются зависимости и код.
- Права на папку `/app` передаются пользователю `node`.
- Образ запускается `node server.js`.

## docker-compose.yml

Определяет продакшен–сервисы:

- **api** — собирается из Dockerfile с `NODE_ENV=production`. Использует `env_file: .env.docker`. Связывается с сетью `backend` и `monitoring`.
- **mongo** — официальный образ MongoDB, том `mongo_data`, `healthcheck`.
- **prometheus**, **pushgateway**, **grafana** — сервисы мониторинга в сети `monitoring`.

Также объявляет том `mongo_data` и сети `backend`, `monitoring`.

## docker-compose.override.yml

Переопределяет **api** для разработки:

- С теми же настройками сборки, но с `NODE_ENV=development`.
- Монтирует код из текущей папки и том `node_modules` для «горячего» обновления.
- Запускает `npm start` (или тесты для сервиса `test`).

Переопределяет **test**, чтобы запускать Vitest (`npm run test:unit && npm run test:api`).

## Сети и взаимодействие

- **backend**: связывает `api` и `mongo`.
- **monitoring**: связывает метрики (`prometheus`, `pushgateway`, `grafana`) и, при необходимости, `api`.
- Docker Compose автоматически настраивает DNS: контейнер `api` видит базу по хосту `mongo`.

## Запуск и проверки

**Продакшен:**

```bash
cp .env.docker .env
docker-compose up --build -d
```

**Разработка + тесты:**

```bash
cp .env.docker .env
docker-compose up --build -d
docker-compose run --rm test
```

**Локально (без контейнеров):**

```bash
cp .env.local .env     # (где .env.local содержит MONGO_URI=localhost)
npm install
node server.js
```

---

Таким образом докеризация:

- Чётко разделяет среды (локальную, dev, prod).
- Использует Dockerfile с кешированием зависимостей и безопасным рантаймом.
- Собирает мониторинговый стек вместе с приложением.
- Обеспечивает «горячую» разработку и CI-тестирование.

```mermaid
flowchart TB
  subgraph ENV_FILES["Файлы окружения"]
    E1[".env
(локальная)"]
    E2[".env.docker
(Docker)"]
  end

  subgraph DOCKERFILE["Dockerfile (multi-stage)"]
    D1["deps: npm ci / npm ci --ignore-scripts"]
    D2["runtime: copy, chown, node server.js"]
    D1 --> D2
  end

  subgraph COMPOSE_FILES["Compose Files"]
    C1["docker-compose.yml
(prod + metrics)"]
    C2["docker-compose.override.yml
(dev + тесты)"]
  end

  subgraph PROD_SERVICES["Продакшен-сервисы"]
    S_api["api"]
    S_mongo["mongo"]
    S_prom["prometheus"]
    S_push["pushgateway"]
    S_graf["grafana"]
  end

  subgraph DEV_TEST["Dev & Test Services"]
    S_apiDev["api (dev)"]
    S_test["test (Vitest)"]
  end

  subgraph NETWORKS["Сети"]
    N_backend[(backend)]
    N_monitor[(monitoring)]
  end

  E2 --> C1
  E2 --> C2
  D2 --> C1
  D2 --> C2
  C1 --> S_api
  C1 --> S_mongo
  C1 --> S_prom
  C1 --> S_push
  C1 --> S_graf
  C2 --> S_apiDev
  C2 --> S_test
  S_api --> N_backend
  S_mongo --> N_backend
  S_apiDev --> N_backend
  S_test --> N_backend
  S_api --> N_monitor
  S_prom --> N_monitor
  S_push --> N_monitor
  S_graf --> N_monitor
```

> Схема показывает поток: сначала файлы окружения (.env, .env.docker) используются в Docker Compose (`docker-compose.yml` и override), затем Multi-Stage Dockerfile устанавливает зависимости и подготавливает рантайм-образ, после чего Compose заводит продакшен- и dev-сервисы в сетях `backend` и `monitoring`.
