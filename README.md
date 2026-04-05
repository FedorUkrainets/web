# EV Charging System

This repository now contains:

- `web` frontend (Next.js, current root app)
- `backend` API (Express + Prisma + SQLite)

## 1) Run frontend

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

## 2) Run backend

```bash
cd backend
cp .env.example .env   # Linux/macOS
# or on Windows PowerShell:
copy .env.example .env
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run seed
npm run dev
```

Backend runs on `http://localhost:3001` and API prefix is `/api`.

Демо-учетные данные
Создано пользователем seed:

email: admin@ev.local
пароль: Admin123!

Основные конечные точки
Аутентификация
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me (требуется JWT)
Станции + Коннекторы
POST /api/stations (требуется JWT, транзакция создает станцию ​​+ коннектор)
GET /api/stations (требуется JWT)
GET /api/stations/:id (требуется JWT)
PATCH /api/stations/:id/status (требуется JWT, переход жизненного цикла)
DELETE /api/stations/:id (требуется JWT)
Жизненный цикл сеансов зарядки
POST /api/charging-sessions (требуется JWT)
GET /api/charging-sessions (требуется JWT)
GET /api/charging-sessions/:id (требуется JWT)
PATCH /api/charging-sessions/:id/start (JWT) (обязательно)
PATCH /api/charging-sessions/:id/complete (требуется JWT)
PATCH /api/charging-sessions/:id/cancel (требуется JWT)
Правила жизненного цикла
Значения ChargingSession.status:

СОЗДАНО
АКТИВНО
ЗАВЕРШЕНО
ОТМЕНЕНО
Разрешенные переходы:

СОЗДАНО -> АКТИВНО
АКТИВНО -> ЗАВЕРШЕНО
АКТИВНО -> ОТМЕНЕНО
Запрещенные переходы возвращают ошибку 409 Conflict.

Демонстрация отката
POST /api/stations принимает необязательный параметр forceFail: true. Если он передан, служба генерирует исключение внутри Prisma $transaction, поэтому станция и коннекторы полностью откатываются.
