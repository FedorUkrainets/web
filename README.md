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
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run seed
npm run dev
```

Backend runs on `http://localhost:3001` and API prefix is `/api`.

## Demo credentials

Created by seed:

- `email`: `admin@ev.local`
- `password`: `Admin123!`

## Core endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (JWT required)

### Stations + Connectors
- `POST /api/stations` (JWT required, transaction create station + connectors)
- `GET /api/stations`
- `GET /api/stations/:id`

### Charging Sessions lifecycle
- `POST /api/charging-sessions` (JWT required)
- `GET /api/charging-sessions` (JWT required)
- `GET /api/charging-sessions/:id` (JWT required)
- `PATCH /api/charging-sessions/:id/start` (JWT required)
- `PATCH /api/charging-sessions/:id/complete` (JWT required)
- `PATCH /api/charging-sessions/:id/cancel` (JWT required)

## Lifecycle rules

`ChargingSession.status` values:

- `CREATED`
- `ACTIVE`
- `COMPLETED`
- `CANCELLED`

Allowed transitions:

- `CREATED -> ACTIVE`
- `ACTIVE -> COMPLETED`
- `ACTIVE -> CANCELLED`

Forbidden transitions return `409 Conflict`.

## Rollback demo

`POST /api/stations` accepts optional `forceFail: true`.
If passed, service throws inside Prisma `$transaction`, so station and connectors are fully rolled back.
