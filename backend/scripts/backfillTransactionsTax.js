/**
 * Backfills transactions from line items (matches transaction.service.js):
 * - tax: sum of GST on discounted line price × qty
 * - sub_total: sum of (discounted line amount × qty) excluding GST
 *
 * If `tax` is still numeric(5,2), widens it to numeric(12,2) first (otherwise values > 999.99 overflow).
 *
 * Usage: node scripts/backfillTransactionsTax.js
 * Requires .env with DB_* (same as other scripts in this folder).
 *
 * SSL: RDS / many cloud Postgres hosts require TLS. SSL is used when any of:
 *   DB_SSL=true, PGSSLMODE=require (or verify-*), or DB_HOST is not localhost.
 * Disable with DB_SSL=false when connecting to a local server without TLS.
 */

const { Client } = require('pg');
const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '../.env'),
  override: true,
});

function pgSslOption() {
  if (process.env.DB_SSL === 'false' || process.env.DB_SSL === '0') {
    return false;
  }
  const mode = (process.env.PGSSLMODE || '').toLowerCase();
  if (['require', 'verify-ca', 'verify-full'].includes(mode)) {
    return { rejectUnauthorized: false };
  }
  if (process.env.DB_SSL === 'true' || process.env.DB_SSL === '1') {
    return { rejectUnauthorized: false };
  }
  const host = process.env.DB_HOST || 'localhost';
  const isLocal = ['localhost', '127.0.0.1', '::1'].includes(host);
  if (!isLocal) {
    return { rejectUnauthorized: false };
  }
  return false;
}

const client = new Client({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'c_manager',
  password: process.env.DB_PASSWORD || 'password',
  port: Number(process.env.DB_PORT) || 5432,
  ssl: pgSslOption(),
});

async function ensureTaxColumnWidth() {
  const { rows } = await client.query(`
    SELECT numeric_precision AS p, numeric_scale AS s
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'transactions'
      AND column_name = 'tax'
  `);
  if (!rows.length) {
    throw new Error('Column transactions.tax not found');
  }
  const prec = rows[0].p != null ? Number(rows[0].p) : 0;
  if (prec < 12) {
    await client.query(
      'ALTER TABLE transactions ALTER COLUMN tax TYPE numeric(12, 2)',
    );
    console.log(
      `Widened transactions.tax to numeric(12,2) (was numeric(${prec},${rows[0].s})).\n`,
    );
  }
}

async function main() {
  await client.connect();
  console.log('Connected.\n');

  await ensureTaxColumnWidth();

  console.log('Backfilling transactions.tax and sub_total from transaction_items…\n');

  const sql = `
    UPDATE transactions t
    SET
      tax = sub.line_tax,
      sub_total = sub.line_net_ex_gst
    FROM (
      SELECT
        ti.transaction_id,
        ROUND(
          COALESCE(
            SUM(
              (ti.price - (ti.price * ti.discount / 100.0)) * (ti.gst / 100.0) * ti.quantity
            ),
            0
          )::numeric,
          2
        ) AS line_tax,
        ROUND(
          COALESCE(
            SUM(
              (ti.price - (ti.price * ti.discount / 100.0)) * ti.quantity
            ),
            0
          )::numeric,
          2
        ) AS line_net_ex_gst
      FROM transaction_items ti
      GROUP BY ti.transaction_id
    ) sub
    WHERE t.id = sub.transaction_id
  `;

  const result = await client.query(sql);
  console.log(`Updated tax + sub_total on ${result.rowCount} transaction(s).`);

  const zeroItems = await client.query(`
    SELECT COUNT(*)::int AS c
    FROM transactions t
    WHERE NOT EXISTS (SELECT 1 FROM transaction_items ti WHERE ti.transaction_id = t.id)
  `);
  console.log(
    `Transactions with no line items (unchanged): ${zeroItems.rows[0].c}`,
  );

  await client.end();
  console.log('\nDone.');
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { main };
