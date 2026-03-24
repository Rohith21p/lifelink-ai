# LifeLink AI – Step 2 Foundation Upgrade

Production-style Step 2 extension of the existing healthcare coordination platform.

## Step 2 Scope

### Implemented

- Upgraded donor-patient matching workflow with review actions
- Rule-based compatibility scoring engine with score breakdown fields
- Notification abstraction module with mocked IN_APP/SMS/EMAIL/WHATSAPP adapters
- Notification templates and delivery logs
- Report metadata upload + report detail + mock extraction pipeline
- Blood bank module (banks, inventory, requests, low stock alerts)
- Dashboard upgrades (match stats, reports count, low stock visibility, recent notifications)
- Step 2 seeded Indian demo data across new entities
- Extended frontend pages for matches, reports, blood banks, notifications

### Explicitly Deferred

- Auth/login/signup/RBAC
- Real external messaging credentials/integrations
- ML training pipeline and advanced AI extraction
- Legal transplant workflow and advanced analytics pipeline

## Monorepo Structure

```text
.
├── apps
│   ├── backend
│   │   ├── prisma
│   │   │   ├── schema.prisma
│   │   │   ├── seed.ts
│   │   │   └── migrations
│   │   └── src
│   │       ├── modules
│   │       │   ├── blood-banks
│   │       │   ├── dashboard
│   │       │   ├── donors
│   │       │   ├── matches
│   │       │   ├── notifications
│   │       │   ├── patients
│   │       │   └── reports
│   │       ├── common
│   │       ├── prisma
│   │       ├── app.module.ts
│   │       └── main.ts
│   └── frontend
│       ├── app/(app)
│       │   ├── blood-banks
│       │   ├── dashboard
│       │   ├── donors
│       │   ├── matches
│       │   ├── notifications
│       │   ├── patients
│       │   ├── reports
│       │   └── settings
│       ├── components
│       │   ├── blood-banks
│       │   ├── matches
│       │   ├── notifications
│       │   ├── reports
│       │   └── ...
│       └── lib
│           ├── api
│           ├── stores
│           └── types
├── docker-compose.yml
└── README.md
```

## Database (Step 2 Additions)

New/extended schema entities:

- Added enums for review actions, donation type, notification channels/events/statuses
- Extended existing tables: `patients`, `donors`, `donor_preferences`, `donor_patient_matches`, `notifications`
- Added new tables:
  - `report_files`
  - `report_extractions`
  - `blood_banks`
  - `blood_inventory`
  - `blood_requests`
  - `notification_templates`
  - `notification_logs`
  - `match_reviews`

Migration file:

- `apps/backend/prisma/migrations/202603240002_step2_foundation/migration.sql`

## REST APIs

Base URL: `http://localhost:3001/api`

### Patients (Step 1 compatible)

- `POST /patients`
- `GET /patients`
- `GET /patients/:id`
- `PATCH /patients/:id`
- `DELETE /patients/:id`

### Donors (Step 1 compatible)

- `POST /donors`
- `GET /donors`
- `GET /donors/:id`
- `PATCH /donors/:id`
- `DELETE /donors/:id`

### Matches (upgraded)

- `GET /matches`
- `GET /matches/:id`
- `POST /matches`
- `PATCH /matches/:id`
- `PATCH /matches/:id/status`
- `POST /matches/:id/reviews`
- `GET /matches/:id/score-breakdown`

### Notifications

- `GET /notifications`
- `POST /notifications`
- `PATCH /notifications/:id/read`
- `GET /notifications/logs`
- `GET /notifications/templates`

### Reports

- `POST /reports`
- `GET /reports`
- `GET /reports/:id`
- `GET /reports/:id/extraction`
- `POST /reports/:id/extract`

### Blood Banks

- `GET /blood-banks`
- `GET /blood-banks/inventory`
- `POST /blood-banks/inventory`
- `GET /blood-banks/requests`
- `GET /blood-banks/low-stock-alerts`
- `GET /blood-banks/recent-stock-activity`

### Dashboard (upgraded)

- `GET /dashboard/summary`
- `GET /dashboard/recent-activities`
- `GET /dashboard/recent-match-activity`
- `GET /dashboard/low-stock-alerts`
- `GET /dashboard/recent-notifications`

### Swagger

- `GET /api/docs`

## Demo Data

`apps/backend/prisma/seed.ts` now seeds realistic Indian records for:

- hospitals, coordinators, patients, donors
- matches with varied statuses + score breakdown fields
- match reviews
- notification templates + notifications + notification logs
- reports + extraction summaries
- blood banks + inventory + requests
- settings

## Run With Docker (Recommended)

```bash
docker compose up --build
```

Services:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:3001/api](http://localhost:3001/api)
- Swagger: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
- PostgreSQL: `localhost:5432`

## Run Locally (Without Docker)

### 1. Start PostgreSQL

```bash
docker compose up -d postgres
```

### 2. Backend

```bash
cd apps/backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:deploy
npm run seed
npm run start:dev
```

### 3. Frontend

```bash
cd apps/frontend
cp .env.example .env.local
npm install
npm run dev
```

## Build Verification (Step 2)

Executed successfully:

- `cd apps/backend && npm run build`
- `cd apps/frontend && npm run build`

## Mocking Notes

- Messaging channels (SMS/Email/WhatsApp) are mock adapters by design
- Report extraction is mock/placeholder and AI-ready for future replacement
- No auth/RBAC implemented yet by requirement

