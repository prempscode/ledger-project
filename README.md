# Ledger Project

A small double-entry banking/ledger system: a Node/Express/MongoDB backend with
JWT auth and idempotent transactions, plus a minimal React (Vite) frontend for
registering, viewing account balances, and transferring money between accounts.

```
ledger-project/
├── backend/     Express API, MongoDB models, transaction logic
└── frontend/    React (Vite) client
```

## How it works

Every account has a `balance` field for fast reads, but the real source of
truth is the **ledger** — every transfer writes a `DEBIT` entry on the
sender's account and a `CREDIT` entry on the receiver's account, tied to a
`transaction` record. Ledger entries are immutable (no updates or deletes,
enforced at the schema level).

Transfers run inside a MongoDB session/transaction so a debit is never
committed without its matching credit — if anything fails partway through,
the whole transaction rolls back and the attempt is marked `FAILED` instead
of being left stuck as `PENDING`. Every transfer also requires a client-
generated `idempotencyKey`, so a retried request (e.g. after a network drop)
never gets charged twice.

New accounts start with a default balance of 5000.

## Prerequisites

- Node.js
- A MongoDB instance (local `mongod`, or a free MongoDB Atlas cluster)

## 1. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/ledger
JWT_SECRET=some-long-random-string
FRONTEND_URL=http://localhost:5173

# Optional — registration emails via Gmail OAuth2. Leave blank to skip;
# a missing/invalid config just logs an error and doesn't block anything.
EMAIL_USER=
CLIENT_ID=
CLIENT_SECRET=
REFRESH_TOKEN=
```

> **Note:** the variable must be named exactly `JWT_SECRET` — the code reads
> `process.env.JWT_SECRET`. A common gotcha is naming it `JWT_SECRET_TOKEN`
> or similar, which leaves it `undefined` and crashes registration/login.

Run it:

```bash
npm run dev
```

You should see `Server is running on port 3000` and `server is connected to DB`.

### API routes

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create a user, returns `{ user, token }` |
| POST | `/api/auth/login` | — | Log in, returns `{ user, token }` |
| POST | `/api/auth/logout` | — | Blacklists the current token |
| POST | `/api/accounts` | user | Create a new account for the logged-in user |
| GET | `/api/accounts` | user | List the logged-in user's accounts |
| GET | `/api/accounts/balance/:accountId` | user | Get one account's balance |
| POST | `/api/transactions` | user | Transfer money between two accounts |
| POST | `/api/transactions/system/initial-funds` | system user | Fund an account from the system account |

Auth is via a JWT, sent either as an `httpOnly`-style cookie or as
`Authorization: Bearer <token>`.

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `frontend/.env` and point it at the backend:

```env
VITE_API_URL=http://localhost:3000/api
```

Run it:

```bash
npm run dev
```

Open **http://localhost:5173**.

The frontend covers: register / login, viewing accounts and balances,
creating a new account, and transferring money to any account ID. It doesn't
expose the system-user `initial-funds` route — that's meant for
backend-side seeding, not everyday use.

## Troubleshooting

- **CORS errors in the browser console** — make sure `backend/src/app.js`
  has the `cors` middleware enabled and `FRONTEND_URL` in `backend/.env`
  matches the frontend's actual origin.
- **500 on register/login, "secretOrPrivateKey must have a value"** —
  `JWT_SECRET` isn't set (or is misnamed) in `backend/.env`. Restart the
  backend after fixing it — `.env` is only read on boot.
- **"User already exists" after a failed registration** — if registration
  crashed after the user was created but before the token was issued
  (e.g. the JWT_SECRET issue above), the user is stuck in Mongo with no way
  to log in. Delete it and retry: `db.users.deleteOne({ email: "..." })`.
