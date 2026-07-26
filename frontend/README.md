# Ledger — Frontend

A minimal React frontend for the ledger backend: register/login, view accounts and
balances, create accounts, and transfer money.

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` and set `VITE_API_URL` to wherever your backend is running, e.g.

```
VITE_API_URL=http://localhost:3000/api
```

Then start the dev server:

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

## Backend requirements

This frontend expects the backend routes exactly as they exist in
`backend-ledger-project-main`:

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`
- `GET /api/accounts`, `POST /api/accounts`, `GET /api/accounts/balance/:accountId`
- `POST /api/transactions`

**CORS:** the backend didn't have CORS enabled, since it was built to be
called from the same origin. A small patch was added to `src/app.js`
(`app.use(cors(...))`) so it accepts requests from this frontend's origin
(`http://localhost:5173` by default). Run `npm install` in the backend after
pulling in that change so the new `cors` dependency is installed. If your
frontend runs on a different port, set `FRONTEND_URL` in the backend's `.env`.

## Notes / current limitations

- The backend has no endpoint to list past transactions, so this UI shows
  current account balances only — no transaction history feed. Add a
  `GET /api/transactions` route on the backend if you want that later.
- Auth token is stored in `localStorage` and sent as `Authorization: Bearer <token>`
  (the backend also supports cookies, but a bearer token sidesteps cross-origin
  cookie configuration).
- `POST /api/transactions/system/initial-funds` requires a system user and
  isn't exposed in this UI — it's meant for backend/admin seeding, not
  everyday use.
