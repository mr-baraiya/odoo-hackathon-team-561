# DealFlow360 — Database Migrations & Schemas

This directory contains the database migrations, SQL schemas, and database scripts for DealFlow360.

---

## Quick Reference Commands

From the `backend/` directory:

```bash
# Run all pending migrations
npm run dbmate

# Check migration status
npm run db:status

# Rollback last migration
npm run db:down
```

---

## Migration Files

- `migrations/20260905000000_dealflow360_init.sql`: Creates database tables, primary/foreign keys, indexes, and constraints.
- `migrations/20260905000001_dealflow360_seed.sql`: Inserts initial system seed records (Users, Tiers, Customers, Products, Warehouses, Quotes).

---

## Detailed Documentation

For full database schema documentation, ER details, table breakdown, and seed ID conventions, refer to the root database README:

`../../database/README.md`
