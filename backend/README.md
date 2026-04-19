# EVCharge Backend (Production-ready baseline)

## Локальный запуск

1. Установите зависимости:
   ```bash
   cd backend
   npm install
   ```
2. Создайте `.env` на основе примера:
   ```bash
   cp .env.example .env
   ```
3. Укажите корректный `DATABASE_URL` PostgreSQL.
4. Запустите сервер:
   ```bash
   npm start
   ```

Сервер стартует на `localhost` и `PORT` из `.env` (по умолчанию `3001`).

## Переменные окружения

Пример в `.env.example`:

```env
PORT=3001
DATABASE_URL=postgres://postgres:postgres@localhost:5432/evcharge
JWT_SECRET=change_me_for_demo
NODE_ENV=development
```

## Деплой (Render / Railway)

1. Подключите PostgreSQL в панели провайдера.
2. В environment variables задайте:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `PORT` (опционально, Render/Railway обычно задают автоматически)
3. Build command: `npm install`
4. Start command: `npm start`

## Примеры API

### Healthcheck
```bash
curl http://localhost:3001/health
```

### Регистрация
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.local","password":"Admin123!","role":"admin"}'
```

### Логин
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.local","password":"Admin123!"}'
```

### Получить станции
```bash
curl http://localhost:3001/api/stations \
  -H "Authorization: Bearer <TOKEN>"
```

### Создать станцию
```bash
curl -X POST http://localhost:3001/api/stations \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Station A","code":"A-001","location":"Center","capacity_kw":120,"current_load_kw":40,"total_chargers":4,"active_chargers":2}'
```

### Обновить статус станции
```bash
curl -X PUT http://localhost:3001/api/stations/1 \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status":"ACTIVE"}'
```

### Удалить станцию
```bash
curl -X DELETE http://localhost:3001/api/stations/1 \
  -H "Authorization: Bearer <TOKEN>"
```
