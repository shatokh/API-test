# 1) Собрать образ с dev-зависимостями (builder)
docker build --target builder -t api-test:builder .

# 2) Запустить unit-тесты
docker run --rm api-test:builder npm run test:unit

# 3) Запустить MongoDB
docker run -d --name mongo -p 27017:27017 mongo:6

# 4) Запустить API-тесты
docker run --rm --link mongo:mongo --env MONGODB_URI="mongodb://mongo:27017" api-test:builder npm run test:api  


# 5) Остановить и удалить MongoDB
docker stop mongo; docker rm mongo

# 6) Собрать production-образ (runtime)
docker build --target runtime -t api-test:prod .

# 7) Запустить production-контейнер и проверить, что он стартует корректно
docker run --rm -p 3000:3000 --env-file .env api-test:prod

# (опционально) Можно сразу проверить healthcheck:
docker run -d --name api-test-prod-check -p 3000:3000 --env-file .env api-test:prod
sleep 10
docker inspect --format='{{.State.Health.Status}}' api-test-prod-check
docker stop api-test-prod-check