# Auth API Test Project

This is a **simple Express + MongoDB REST API** created for educational and testing purposes.\
It provides a working backend to help you practice API testing (Postman, Swagger, curl) and backend development patterns (auth, roles, status control).

---

## 🌟 Purpose

- ✅ Learn how to build and test an API from scratch
- 🔐 Practice user registration, login, JWT authorization
- 𞴑 Test role-based access control (`admin`, `user`)
- ⚙️ Practice using Swagger UI as interactive API documentation
- 🟣 Learn Docker & cloud deploys with Render.com

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/API-test.git
cd API-test
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env` file

```env
PORT=3000
JWT_SECRET=your_secret_here
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/authdemo
```

### 4. Run server

```bash
node server.js
```

### Or via Docker

```bash
docker build -t auth-api .
docker run -p 3000:3000 --env-file .env auth-api
```

---

## 🔗 API Endpoints

| Method | Endpoint               | Description                 | Auth required  |
| ------ | ---------------------- | --------------------------- | -------------- |
| POST   | `/api/auth/register`   | Register new user           | ❌              |
| POST   | `/api/auth/login`      | Login, receive JWT          | ❌              |
| GET    | `/api/auth/me`         | Get current user info       | ✅ (user/admin) |
| POST   | `/api/auth/set-status` | Admin sets status of a user | ✅ (admin only) |

### User Roles

- `user`: default
- `admin`: can change other users' status (active/inactive)

---

## 📘 Swagger UI

After server is started:

```text
http://localhost:3000/api-docs
```

You can test the entire API interactively via Swagger UI in your browser.

---

## 📌 Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- Docker
- Swagger (OpenAPI 3.0)
- Role-based access
- Validation (`express-validator`)
- Logger (`morgan`)

---

## 🧪 Sample JSON Requests

### Register

```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "123456"
}
```

### Login

```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "123456"
}
```

### Set Status (admin only)

```json
POST /api/auth/set-status
Headers: Authorization: Bearer <ADMIN_TOKEN>
{
  "userId": "665fa3f98ef9c5d73b874ccb",
  "status": "inactive"
}
```

---

## 🌐 Deploy to Render

You can deploy this project for free using Docker on [https://render.com](https://render.com).\
See `Dockerfile` and `.env` support for easy deploy.

---

## 🤝 Contributing

This project is for learning. Fork it, break it, improve it. Pull requests welcome.