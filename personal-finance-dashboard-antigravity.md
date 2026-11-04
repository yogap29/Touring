# Personal Finance Dashboard — Project Specification for Antigravity

> **Goal:** Generate a complete, runnable beginner-friendly personal finance web app using NestJS + Vue 3 + TypeScript. Work in the current workspace, create all required files, install dependencies, run migrations/seeds, launch both apps, and fix errors found during verification.
>
> **Important:** Do not stop after producing a plan or boilerplate. Implement the application end-to-end. If a command fails, inspect the error, fix the root cause, and retry. Do not claim success unless the relevant command actually succeeds.

## 1. Product overview

Build a local-first, single-user Personal Finance Dashboard for recording income and expenses, managing expense categories and monthly budgets, and viewing monthly summaries.

### MVP features

1. Dashboard:
   - Selected month (default to the current local month).
   - Total income, total expenses, and net cash flow for the selected month.
   - Transaction count.
   - Expense breakdown by category.
   - Six-month income-versus-expense trend.
   - Budget usage summary.
2. Transactions:
   - List, create, view, edit, and delete transactions.
   - Filter by month, transaction type, category, and optional date range.
   - Show category name, transaction date, type, amount, and note.
   - Validate user input and show useful errors.
3. Categories:
   - List, create, edit, and delete categories.
   - Types are `INCOME` or `EXPENSE`.
   - Prevent duplicate category names within the same type.
   - Do not allow deleting a category referenced by transactions or budgets; return a clear validation error.
4. Budgets:
   - Create or update a budget for a category and month.
   - One budget per category per month.
   - Only expense categories can have budgets.
   - Display limit, spent amount, remaining amount, and usage percentage.
5. Seed data:
   - Seed useful default categories and a small, clearly identifiable set of demo transactions and budgets.
   - Seed operation must be idempotent: rerunning it must not duplicate rows.
   - Make it easy to remove demo data or start with a clean database.
6. Documentation:
   - Include complete setup, run, migration, seed, and troubleshooting instructions in `README.md`.

### Explicitly out of scope for v1

- Authentication or multiple users.
- Bank/e-wallet integrations.
- Investment, debt, or asset tracking.
- Recurring transactions, notifications, AI, cloud deployment, microservices, Redis, or background queues.

## 2. Technology choices

Use compatible, stable versions and pin compatible major versions in package manifests.

### Backend

- Node.js LTS.
- NestJS + TypeScript.
- REST API with prefix `/api/v1`.
- Prisma ORM with Prisma 6 and SQLite for a simple local setup.
- `class-validator` and `class-transformer` for DTO validation.
- `@nestjs/config` for environment configuration.
- Prisma Client.
- Use NestJS modules, controllers, services, DTOs, and dependency injection.
- Configure CORS for the local Vue dev server (`http://localhost:5173`).

### Frontend

- Vue 3 + TypeScript + Vite.
- Vue Router.
- Bootstrap 5 for responsive styling.
- Axios for API requests.
- Chart.js + `vue-chartjs` for charts.
- Pinia is optional; do not add it unless there is a clear need.
- Use Composition API and `<script setup lang="ts">`.

### Database

- SQLite database stored locally in the backend project.
- No separate database server required.
- Use Prisma migrations, not `db push` as the only schema setup mechanism.
- Use a single, consistent Prisma 6 configuration. Ensure `prisma` and `@prisma/client` use the same compatible major version.
- Configure the database path correctly for Prisma 6. Verify the actual database file path after migration.

## 3. Suggested repository structure

Create this structure (adjust only if required by the selected tooling, and document changes):

```text
personal-finance-dashboard/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── prisma/
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts
│   │   ├── categories/
│   │   ├── transactions/
│   │   ├── budgets/
│   │   └── dashboard/
│   ├── .env.example
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── router/
│   │   ├── views/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.vue
│   │   └── main.ts
│   └── package.json
├── .gitignore
└── README.md
```

## 4. Database schema

Implement these three models. Use CUID string primary keys.

### Category

- `id`: String, primary key, CUID.
- `name`: String.
- `type`: String with application-level validation restricted to `INCOME` or `EXPENSE`.
- `color`: String, default to a sensible hex color.
- `createdAt`: DateTime, default now.
- Relations: transactions and budgets.
- Unique constraint on `[name, type]`.

### Transaction

- `id`: String, primary key, CUID.
- `title`: String, required.
- `amount`: Int, required, positive integer in Indonesian rupiah.
- `type`: String, restricted to `INCOME` or `EXPENSE`.
- `date`: DateTime.
- `note`: optional String.
- `categoryId`: String foreign key to Category.
- `createdAt`: DateTime, default now.
- `updatedAt`: DateTime, auto-updated.
- Index on `date` and composite index on `[categoryId, date]`.
- Prevent deletion of a referenced category.

### Budget

- `id`: String, primary key, CUID.
- `categoryId`: String foreign key to Category.
- `month`: String in strict `YYYY-MM` format.
- `limitAmount`: Int, positive integer in Indonesian rupiah.
- `createdAt`: DateTime, default now.
- `updatedAt`: DateTime, auto-updated.
- Unique constraint on `[categoryId, month]`.
- Only expense categories may have budgets.
- Ensure category deletion is handled safely. Prefer restricting deletion when a category has budgets or transactions rather than silently deleting financial history.

### Data integrity rules

- Store IDR amounts as integers, never floating-point currency values. Example: Rp7.300.000 is stored as `7300000`.
- Do not accept zero or negative transaction amounts or budget limits.
- Validate enum-like `type` fields in DTOs/services.
- Validate that referenced categories exist and that transaction type matches the category type.
- Validate month strings strictly.
- Avoid timezone-related month-boundary errors. Treat dates consistently; use local calendar dates for the user's transaction date and query monthly intervals with an inclusive start and exclusive next-month start. Document the chosen timezone handling.
- Do not represent a period's net cash flow as a bank account balance. Label it “Arus Kas Bersih”.

## 5. REST API contract

All endpoints use `/api/v1`.

### Categories

- `GET /categories` — list categories; support optional `type` filter.
- `GET /categories/:id` — category details if useful.
- `POST /categories` — create category.
- `PATCH /categories/:id` — update category name/color; avoid changing type if referenced data would become inconsistent.
- `DELETE /categories/:id` — delete only if not referenced by transactions or budgets.

Example create request:

```json
{
  "name": "Makanan",
  "type": "EXPENSE",
  "color": "#f59e0b"
}
```

### Transactions

- `GET /transactions?month=2026-10` — list transactions for a month.
- Also support optional `type`, `categoryId`, `from`, `to`, `page`, and `limit` filters.
- `GET /transactions/:id` — get one transaction with its category.
- `POST /transactions` — create transaction.
- `PATCH /transactions/:id` — update transaction.
- `DELETE /transactions/:id` — delete transaction.

Example create request:

```json
{
  "title": "Gaji bulanan",
  "amount": 7300000,
  "type": "INCOME",
  "date": "2026-10-01",
  "categoryId": "existing-category-id",
  "note": "Gaji bulan Oktober"
}
```

### Budgets

- `GET /budgets?month=2026-10` — list budgets for a month, including category name/color, spent amount, remaining amount, and usage percentage.
- `PUT /budgets` — upsert budget for a category/month pair.

Example request:

```json
{
  "categoryId": "existing-expense-category-id",
  "month": "2026-10",
  "limitAmount": 1000000
}
```

Budget response fields should include `categoryId`, `categoryName`, `categoryColor`, `month`, `limitAmount`, `spentAmount`, `remainingAmount`, and `usagePercentage`.

### Dashboard

- `GET /dashboard/summary?month=2026-10`
- `GET /dashboard/category-breakdown?month=2026-10`
- `GET /dashboard/monthly-trend?months=6`

Summary response example:

```json
{
  "month": "2026-10",
  "totalIncome": 7300000,
  "totalExpense": 2450000,
  "netCashFlow": 4850000,
  "transactionCount": 18
}
```

These numbers are illustrative only; calculate all values from the database.

### HTTP and error handling

- Use appropriate HTTP status codes (`200`, `201`, `204`, `400`, `404`, `409` where appropriate).
- Return clear, consistent error messages.
- Handle missing entities, duplicate categories, invalid input, and attempts to delete referenced categories.
- Do not leak stack traces to the frontend.
- Validate query parameters and DTOs.
- Configure a global `ValidationPipe` with `whitelist: true`, `transform: true`, and `forbidNonWhitelisted: true`.

## 6. Business logic

- `totalIncome`: sum of `INCOME` transactions in selected month.
- `totalExpense`: sum of `EXPENSE` transactions in selected month.
- `netCashFlow = totalIncome - totalExpense`.
- `transactionCount`: number of transactions in selected month.
- Category breakdown: sum expense amounts grouped by expense category, descending by amount.
- Monthly trend: income and expenses grouped by calendar month for the requested number of months; return zero values for months with no transactions.
- Budget `spentAmount`: sum of expense transactions for the matching category and month.
- `remainingAmount = limitAmount - spentAmount`; allow negative values if over budget.
- `usagePercentage = spentAmount / limitAmount * 100`; guard against invalid zero limits (limits must be positive).
- Monthly queries use start-of-month inclusive and start-of-next-month exclusive.
- Ensure date filtering and aggregation are tested for month boundaries.

## 7. Frontend UX requirements

Build a clean, responsive dashboard with a simple sidebar or top navigation. Use Bootstrap 5 and consistent spacing. Avoid excessive visual decoration.

### Dashboard page

- Month selector.
- Four summary cards: total income, total expenses, net cash flow, transaction count.
- Expense category doughnut chart.
- Six-month income-versus-expense chart.
- Budget progress list.
- Recent transactions table.
- Loading states, empty states, and visible API error states.

### Transactions page

- Table with date, title, category, type, amount, and actions.
- Create/edit form using a modal or dedicated form.
- Category dropdown filtered by transaction type.
- Month/type/category filters.
- Confirmation before deletion.
- Currency formatting in Indonesian locale (`id-ID`, `IDR`).
- Display positive values with type labels/colors rather than relying on signed amounts alone.

### Categories page

- List categories with name, type, and color.
- Create/edit form.
- Confirm before delete.
- Display a useful message if deletion is blocked because the category is referenced.

### Budgets page

- Month selector.
- Form to set a category's budget.
- List category, budget limit, spent, remaining, and usage progress.
- Highlight over-budget categories accessibly, with text as well as color.

### Shared frontend behavior

- Use Axios in a centralized API client module.
- Keep API calls out of large view components by creating API service files.
- Define TypeScript types for API responses and request payloads.
- Use a reusable currency formatter.
- Show loading and error feedback for network calls.
- Do not hardcode fake dashboard totals. Dashboard figures must come from the backend.
- Avoid storing secrets in the frontend.
- Use an `.env.example` for frontend API base URL if configured through Vite.

## 8. Seed data

Create idempotent seed logic for default categories such as:

Income:
- Gaji
- Bonus
- Penghasilan Lain

Expenses:
- Makanan
- Transportasi
- Tempat Tinggal
- Tagihan
- Keluarga
- Langganan
- Kesehatan
- Lain-lain

Add a small set of demo transactions and a few budgets. Use clear demo titles (for example, `[DEMO] Gaji bulanan`) and document how to remove/reset demo data. Do not create duplicate rows when seeding more than once.

## 9. Implementation and execution plan

Work through these steps and verify each one before continuing.

### Step 1 — Inspect workspace

- Check the current directory and existing files before creating anything.
- If the workspace is empty, create `backend` and `frontend`.
- If project files already exist, preserve useful work and integrate with it rather than blindly overwriting it.
- Confirm Node.js and npm versions.

### Step 2 — Generate and configure applications

- Create NestJS backend and Vue 3 + TypeScript + Vite frontend.
- Install dependencies.
- Use compatible package versions.
- Create `.gitignore` entries for `node_modules`, build outputs, local `.env` files, and SQLite database files, while keeping `.env.example` files tracked.

### Step 3 — Implement database

- Add Prisma schema and migration.
- Configure Prisma 6 and SQLite correctly.
- Implement `PrismaModule` and `PrismaService` lifecycle handling.
- Implement an idempotent seed script and ensure it can be executed with a documented npm script.
- Run migration and seed; inspect the result.

### Step 4 — Implement backend

- Implement DTOs, controllers, services, and modules for categories, transactions, budgets, and dashboard.
- Add validation, correct status codes, error handling, and business rules.
- Keep calculations in backend services.
- Ensure all API paths match the documented contract.

### Step 5 — Implement frontend

- Implement routing, shared layout/navigation, API client, types, and all four pages.
- Connect all UI to real API endpoints.
- Include loading, empty, error, and success states.
- Ensure forms validate data and display server-side validation errors.
- Make the UI responsive and usable at common desktop and mobile widths.

### Step 6 — Verify end-to-end

Run relevant commands in both projects:
- Install dependencies successfully.
- Generate Prisma Client.
- Apply migration.
- Run seed.
- Run backend build/type check.
- Run frontend build/type check.
- Run available tests.
- Start backend and frontend and verify they respond.
- Smoke-test key endpoints: categories, create/list/update/delete transaction, set/list budget, and dashboard summary.
- Verify totals with known test data and check month-boundary behavior.
- Fix every error discovered and repeat verification.

Do not claim the app is launch-ready if build, migration, or basic smoke tests fail. If a specific environment restriction prevents a command, report the exact limitation and provide the next actionable command.

### Step 7 — Launch

- Start backend on `http://localhost:3000`.
- Start frontend on `http://localhost:5173` (or document the actual Vite URL).
- Keep both processes running if the environment supports long-running processes.
- If it does not, provide exact commands to launch each in a separate terminal.
- Confirm the URL to open in the browser.

## 10. Suggested scripts

Add scripts that make the project straightforward to operate. Adapt to the generated package versions, but preserve equivalent functionality.

Backend scripts:
- `start:dev`
- `build`
- `start`
- `db:migrate`
- `db:seed`
- `db:studio` (optional)

Frontend scripts:
- `dev`
- `build`
- `preview`

Root-level scripts or a small helper may be added if they make starting both apps easier without adding unnecessary tooling. Do not make Docker a requirement for this local SQLite MVP.

## 11. README requirements

The README must document:

1. Prerequisites and versions.
2. Initial installation.
3. Environment variable setup.
4. Database migration and seed commands.
5. How to launch backend and frontend in separate terminals.
6. Local URLs.
7. API endpoint summary.
8. How to reset the local database and reseed safely.
9. Troubleshooting for port conflicts, Prisma Client generation, migration errors, CORS, and frontend API URL configuration.

## 12. Acceptance criteria

The work is complete only when:

- [ ] The project can be installed from the README instructions.
- [ ] SQLite migrations complete successfully.
- [ ] Seed can run repeatedly without duplicate rows.
- [ ] Backend starts and serves `/api/v1` endpoints.
- [ ] Frontend starts and loads in the browser.
- [ ] Categories can be listed and managed.
- [ ] Transactions can be created, listed, edited, and deleted.
- [ ] Monthly summary numbers update correctly after transaction changes.
- [ ] Budgets can be created/updated and show accurate utilization.
- [ ] Charts are backed by real API responses.
- [ ] Invalid data and API failures show useful messages.
- [ ] Build/type checks pass, and any tests that exist pass.
- [ ] README accurately reflects the commands that were actually verified.

## 13. Instructions to the coding agent

- Implement the full working app, not just a design mockup or a plan.
- Prefer simple, readable code over premature abstraction.
- Do not add authentication or unrelated features.
- Do not invent successful command output.
- Run commands and inspect their actual output.
- Fix errors rather than merely listing them.
- Keep package versions compatible and avoid mixing Prisma major versions.
- Do not overwrite user files without inspecting them.
- At the end, provide a concise summary of files/features created, commands run, tests/builds that passed or failed, any remaining limitations, and the exact local URL(s) to open.
