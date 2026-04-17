# EV Charging Demo (Simplified)

## Stack
- Frontend: React + Vite + plain CSS
- Backend: Express + SQLite (`better-sqlite3`)
- Auth: JWT (Bearer)

## Run backend
```bash
cd backend
npm install
npm run dev
```
Backend runs on `http://localhost:3001`.

## Run frontend
```bash
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

## Default seeded admin
- email: `admin@demo.local`
- password: `Admin123!`

## API
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/stations` (Bearer token)
- `POST /api/stations` (Bearer token, station + chargers transaction)
- `PATCH /api/stations/:id/status` (Bearer token, lifecycle rules)
- `DELETE /api/stations/:id` (Bearer token)
