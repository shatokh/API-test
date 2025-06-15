🧪 4. Протестируй API (через Swagger или Postman)
✅ Регистрация пользователя
POST /api/auth/register

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```
✅ Логин
POST /api/auth/login

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```
→ В ответе придёт token, скопируй его и используй в Authorization:

```http

Authorization: Bearer <TOKEN>
```
✅ Просмотр текущего пользователя
GET /api/auth/me

✅ Смена статуса (только админ)
POST /api/auth/set-status

```json
{
  "userId": "<ID пользователя>",
  "status": "inactive"
}
```