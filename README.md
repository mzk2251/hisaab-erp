# Hisaab ERP

A full-stack accounting ERP inspired by [Hisaab.pk](https://hisaab.pk/) — built with **React**, **Node/Express**, and **PostgreSQL**.

## Modules

| Module | Status |
|--------|--------|
| Dashboard | ✅ Summary stats |
| Sales (Customers, Orders) | ✅ API + list views |
| Purchases (Suppliers, POs) | ✅ API + list views |
| Inventory (Items, Locations) | ✅ API + list views |
| General Ledger (COA, Journals) | ✅ API + list views |
| CRM (Leads) | ✅ API + list views |
| Manufacturing (Work Orders) | ✅ API + list views |
| Fixed Assets | ✅ API + list views |
| Payroll / HR | ✅ API + list views |
| Reports (Trial Balance) | ✅ Basic report |
| Invoices, Stock Transfers | 🔜 Next iteration |

## Tech Stack

- **Frontend:** React 19, Vite, React Router
- **Backend:** Node.js, Express, TypeScript, Prisma ORM
- **Database:** PostgreSQL 16 (Docker)

## Quick Start

### Prerequisites

- Node.js 20+
- Docker Desktop (for PostgreSQL)

### Setup

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Start PostgreSQL
npm run db:up

# 4. Run migrations and seed demo data
npm run db:migrate
npm run db:seed

# 5. Start dev servers (API + frontend)
npm run dev
```

- **Frontend:** http://localhost:5173
- **API:** http://localhost:4000/api

### Demo Login

| Field | Value |
|-------|-------|
| Company Code | `DEMO` |
| Email | `admin@demo.com` |
| Password | `admin123` |

## Project Structure

```
hisaab-erp/
├── backend/          # Express API + Prisma
│   ├── prisma/       # Database schema & seed
│   └── src/
│       ├── routes/   # Module API routes
│       └── middleware/
├── frontend/         # React SPA
│   └── src/
│       ├── pages/    # Module pages
│       └── layouts/  # App shell
└── docker-compose.yml
```

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API + frontend |
| `npm run db:up` | Start PostgreSQL container |
| `npm run db:migrate` | Apply database migrations |
| `npm run db:seed` | Load demo data |
| `npm run db:studio` | Open Prisma Studio |

## Roadmap

1. Transaction forms (invoices, GRN, delivery notes)
2. Pakistan tax compliance (SRB, PRA, withholding)
3. Bank reconciliation
4. Multi-currency transactions
5. User roles & permissions UI
6. Document attachments & email
