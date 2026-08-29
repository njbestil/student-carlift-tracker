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
Set `VITE_GOOGLE_MAPS_API_KEY` in `client/.env` to enable the student live map and address locator. Restrict this browser key by HTTP referrer in Google Cloud and enable the Maps JavaScript API, Places API, and Places API (New).

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
- `GET /api/students/me/driver` (student only; returns the assigned driver's contact and vehicle details)
- `PATCH /api/students/me`
- `PATCH /api/students/:userId/service-status` (legacy driver-only endpoint; requires an active trip; body: `{ "serviceStatus": "ABSENT" | "WAITING" | "PICKED_UP" | "DROPPED_OFF" }`)
- `GET /api/drivers/me`
- `GET /api/drivers/me/dashboard` (driver only; returns the driver profile and assigned students)
- `PATCH /api/drivers/me`
- `PATCH /api/drivers/me/service-status` (driver only; body: `{ "isOnService": true | false }`)
- `POST /api/drivers/me/trips` (driver only; body: `{ "tripOrigin": "HOME" | "SCHOOL" }`)
- `PATCH /api/drivers/me/trips/students/:userId/status` (driver only; body: `{ "serviceStatus": "ABSENT" | "WAITING" | "PICKED_UP" | "DROPPED_OFF" }`)
- `POST /api/vehicle-locations` (driver only; throttled by the client)
- `GET /api/vehicle-locations/my-driver/latest` (student only; reads assigned driver location)
- `GET /api/vehicle-locations/latest/:driverId` (admin, assigned student, or the driver themself)

## Driver Trip Flow

The driver dashboard is organised around a route-level trip rather than independent status toggles. This prevents a driver from having to reset every student before the afternoon journey and prevents invalid transitions such as dropping off a student who was never picked up.

### Start a trip

The dashboard presents a single route action:

- **Start school run**: sets `tripOrigin` to `HOME` for the Home → School journey.
- **Start return trip**: sets `tripOrigin` to `SCHOOL` for the School → Home journey and resets completed, non-absent riders from `DROPPED_OFF` to `WAITING` in one confirmed batch action.

Students marked `ABSENT` remain absent until the driver explicitly marks them present. The start-trip confirmation must show the affected rider counts before applying the reset.

### Student status actions

Each student card exposes only the next valid action:

| Current status | Driver action | Result |
| --- | --- | --- |
| `WAITING` | Pick up | `PICKED_UP` |
| `PICKED_UP` | Drop off | `DROPPED_OFF` |
| `DROPPED_OFF` | Completed | No action |
| `ABSENT` | Mark present | `WAITING` |

The server must enforce these transitions, ensure the student is assigned to the authenticated driver, and reject duplicate or out-of-sequence updates.

```text
Start school run (HOME) or start return trip (SCHOOL)
  -> eligible students become WAITING
  -> Pick up -> PICKED_UP
  -> Drop off -> DROPPED_OFF
  -> all eligible students dropped off -> trip complete
  -> start return trip resets completed riders to WAITING
```

### Trip history

`driver_trip_runs` stores each route and `driver_trip_run_students` stores each student's status and pickup/drop-off timestamps for that route. The current `student_profiles.service_status` remains a convenient latest-status projection, while the trip-run tables retain the morning and afternoon history independently.

## Live Vehicle Tracking

Driver GPS updates are sent from the driver phone through the Express API and stored in PostgreSQL. Students read only their assigned driver's latest location through `/api/vehicle-locations/my-driver/latest`; the browser never chooses an arbitrary driver as the source of truth.

Until an admin assignment UI exists, the oldest active driver account is the single static driver. Migration `006_configure_static_driver.sql` changes that driver's mobile number to `0522465535` and assigns every student profile to that driver. New student profiles are assigned automatically when saved.

To keep free-tier usage low:

- Driver GPS sharing starts only after the driver turns service on.
- The driver client saves the first available GPS position, then posts only about every 30 seconds or after meaningful movement.
- The student client loads Google Maps only when the Live Map dialog opens.
- Student location polling runs only while the dialog is open and the tab is visible.
- The MVP does not call Google Directions, Distance Matrix, Places, or Geocoding APIs.

## Next Development Phase

- Admin-controlled driver creation and role management.
- Password reset token workflow and SMS integration.
- File upload/storage for profile photos.
- Student-driver assignment and route planning.
- Vehicle/location UI and Google Maps integration.
- Automated API and UI tests.
