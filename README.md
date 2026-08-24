# Student Carlift Tracker

Initial monorepo foundation for a Student Carlift Tracker app. The current phase focuses on architecture, configuration, database setup, authentication, onboarding, and development tooling.

## Architecture Overview

- `client/`: React, TypeScript, Vite, React Router, feature-based UI modules.
- `server/`: Node.js, Express, TypeScript, REST API, PostgreSQL through `pg`, Zod validation, bcrypt password hashing, JWT authentication.
- `docker-compose.yml`: development PostgreSQL container with a named volume and healthcheck.
- `server/migrations/`: ordered SQL migrations tracked by `schema_migrations`.

React never connects directly to PostgreSQL. The browser talks to Express through `/api`, and Express owns database access through repositories.

## Prerequisites

- Node.js 22 or later is recommended.
- npm
- Docker Desktop

## Project Structure

```text
student-carlift-tracker/
├── client/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── routes/
│   │   ├── services/
│   │   └── styles/
│   └── .env.example
├── server/
│   ├── migrations/
│   ├── scripts/
│   └── src/
│       ├── config/
│       ├── middleware/
│       ├── modules/
│       └── routes/
├── docker-compose.yml
└── package.json
```

## Environment Setup

```bash
npm install

cp server/.env.example server/.env
cp client/.env.example client/.env
```

Set a strong `JWT_SECRET` in `server/.env`. Never commit real secrets.

Client `VITE_*` variables are bundled into frontend code and must be treated as public. Do not put backend secrets in `client/.env`.

## PostgreSQL With Docker

PostgreSQL runs in Docker during development:

```bash
npm run db:up
npm run migrate
```

The database is available at `localhost:5432` and persists data in the `postgres_data` Docker volume.

If port `5432` is already used on your machine, start Docker with another host port and match `server/.env`:

```bash
POSTGRES_HOST_PORT=5433 npm run db:up
```

To stop the environment:

```bash
npm run db:down
```

## Development

```bash
npm run dev
```

Useful URLs:

- Frontend: `http://localhost:5173`
- API health: `http://localhost:3000/api/health`
- Database health: `http://localhost:3000/api/database-health`

## Available Commands

```bash
npm run dev
npm run dev:client
npm run dev:server
npm run db:up
npm run db:down
npm run migrate
npm run typecheck
npm run lint
npm run build
```

## Registration And Onboarding Flow

Registration collects only:

- Mobile number
- Password
- Confirm password

The server validates `confirmPassword` with Zod but never stores it. Passwords are hashed with bcrypt. Public registration always creates a `STUDENT` account with `profile_completed = false`.

After login, the frontend checks `user.profileCompleted`:

```text
Register -> Login/session -> profileCompleted false -> /student/profile/setup
Profile saved -> profileCompleted true -> /student/dashboard
```

Incomplete users can access their own setup route without redirect loops.

## Account Data Vs Profile Data

`users` contains authentication and account-level data:

- mobile number
- password hash
- role
- profile completion status
- account active status

Role-specific details are stored separately:

- `student_profiles`
- `driver_profiles`

This keeps authentication shared across roles while allowing Admin, Driver, and Student profile data to evolve independently.

## API Endpoints

- `GET /api/health`
- `GET /api/database-health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `GET /api/users/me`
- `PATCH /api/users/me`
- `GET /api/students/me`
- `PATCH /api/students/me`
- `GET /api/drivers/me`
- `PATCH /api/drivers/me`
- `POST /api/vehicle-locations`
- `GET /api/vehicle-locations/latest/:driverId`

## Next Development Phase

- Admin-controlled driver creation and role management.
- Password reset token workflow and SMS integration.
- File upload/storage for profile photos.
- Student-driver assignment and route planning.
- Vehicle/location UI and Google Maps integration.
- Automated API and UI tests.
