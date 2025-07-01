## В проекте настроена докеризация для локального запуска и проверки проекта API-test в ветке dev и для мастер ветке в проде.

Ниже список команд для локального запуска и проверки проекта API-test в ветке dev. Сохраните этот файл в папку docs/ как local-setup-commands.md.

### 1. Переключиться на ветку dev и обновить код

```bash
git fetch origin
git checkout dev
git pull origin dev
```

### 2. Запустить окружение разработки (подхватывает docker-compose.override.yml)

```bash
docker-compose up --build -d
```

### 3. Убедиться, что все контейнеры запустились

```bash
docker-compose ps
```

### 4. Проверить логи сервиса API

```bash
docker-compose logs -f api
```

### 5. Проверить endpoint здоровья

```bash
curl -f http://localhost:3000/health && echo "API здоров!"
```

### 6. Запустить контейнер с тестами

```bash
docker-compose run --rm test
```

### 7. Запустить метрики (Prometheus, Pushgateway и Grafana)

```bash
docker-compose -f docker-compose.metrics.yml up -d
docker-compose -f docker-compose.metrics.yml ps
```

### 8. (Опционально) Собрать и запустить продакшен-окружение

```bash
docker-compose -f docker-compose.yml up --build -d
```

### 9. Остановить и удалить контейнеры, тома и сети

```bash
docker-compose down -v
```
