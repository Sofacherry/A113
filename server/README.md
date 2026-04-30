# A113 API (Node.js + MVVM)

Бэкенд реализован на чистом Node.js (`node:http`) в архитектуре MVVM:
- `models/` — работа с PostgreSQL (SQL-слой),
- `viewmodels/` — бизнес-правила и валидация,
- `views/` — HTTP-представление (JSON-ответы),
- `routes/` — таблица маршрутов.

## Быстрый старт

1. Установить зависимости:
```bash
npm i
```

2. Создать `.env` по примеру `.env.example`.

3. Запустить API:
```bash
npm run dev:server
```

4. Запустить фронт + API вместе:
```bash
npm run dev:full
```

## Основные эндпоинты

- `GET /health`
- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me` (Bearer token)
- `GET /api/services`
- `POST /api/services` (`X-User-Role: Admin`)
- `PUT /api/services/:id` (`X-User-Role: Admin`)
- `DELETE /api/services/:id` (`X-User-Role: Admin`)
- `GET /api/categories`
- `GET /api/citizen-categories`
- `GET /api/orders`
- `POST /api/orders`
- `PATCH /api/orders/:id/status` (`X-User-Role: Admin|Manager`)
- `GET /api/users` (`X-User-Role: Admin`)
- `GET /api/reports/monthly-revenue`
- `GET /api/reports/top-services`
- `GET /api/reports/top-clients`

## Пример запроса

```bash
curl -X POST http://localhost:1314/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"password2\"}"
```

Успешный ответ `login/register`:

```json
{
  "accessToken": "jwt_token_here",
  "user": {
    "id": "1",
    "email": "admin@example.com",
    "displayName": "Админ",
    "role": "Admin"
  }
}
```
