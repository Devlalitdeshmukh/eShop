# eShop - Production Ready Multi-Environment Setup

This project now supports three clean runtime environments:

- `local`
- `development`
- `production`

## Folder Layout

```text
project-root/
+-- backend/
¦   +-- src/
¦   ¦   +-- app.js
¦   ¦   +-- server.js
¦   ¦   +-- config/
¦   ¦       +-- env.js
¦   ¦       +-- db.js
¦   ¦       +-- redis.js
¦   ¦       +-- mailer.js
¦   +-- .env.local
¦   +-- .env.development
¦   +-- .env.production
¦   +-- package.json
+-- frontend/
¦   +-- .env.local
¦   +-- .env.development
¦   +-- .env.production
¦   +-- package.json
+-- package.json
```

## Environment Files

### Backend

- `backend/.env.local`
- `backend/.env.development`
- `backend/.env.production`

Used by `backend/src/config/env.js` based on `NODE_ENV`.

### Frontend (Vite)

- `frontend/.env.local`
- `frontend/.env.development`
- `frontend/.env.production`

Frontend API base URL is now read from `VITE_API_URL` in `frontend/services/api.ts`.

## Commands

### Local

```bash
npm run dev:local
```

### Development

```bash
npm run dev:development
```

### Production

```bash
npm run start:production
```

This builds frontend in production mode and runs backend with `NODE_ENV=production`.

## Backend Scripts

```bash
npm run dev:local --prefix backend
npm run dev:development --prefix backend
npm run start:production --prefix backend
```

## Frontend Scripts

```bash
npm run dev:local --prefix frontend
npm run dev:development --prefix frontend
npm run build:production --prefix frontend
```

## Notes

- Redis is optional and controlled by:
  - `REDIS_ENABLED=true|false`
  - `REDIS_URL=redis://...`
- Mailer uses:
  - `ADMIN_EMAIL`
  - `ADMIN_EMAIL_PASS`
- JWT uses:
  - `JWT_SECRET`

Set strong secrets before production deployment.
