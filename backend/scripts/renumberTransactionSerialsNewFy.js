/**
 * Renumbers `transactions.serial_number` for a calendar date range at the start of
 * an Indian financial year (April–March), separately per company, transaction type,
 * and is_black (white = false, black = true). Serials become 1, 2, 3, … ordered by
 * created_at, date, id (creation order first; then bill date and id for ties).
 * Does not touch `stock_send` or `stock_receive`.
 *
 * Usage:
 *   node scripts/renumberTransactionSerialsNewFy.js --dry-run
 *   node scripts/renumberTransactionSerialsNewFy.js
 *   node scripts/renumberTransactionSerialsNewFy.js --from 2026-04-01 --to 2026-04-04 --company <uuid>
 *
 * Default date window (no flags): IST calendar 1–4 April 2026 (2026-04-01 .. 2026-04-04).
 *
 * Safety: by default aborts if any transaction exists in the same India FY and same
 * (company_id, type, is_black) with a calendar date (IST) after --to (would overlap new 1..n).
 * Pass --force to skip that check (only if you know there is no conflict).
 *
 * Connection: uses .env like the app (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT).
 * For AWS RDS and many managed Postgres instances, set DB_SSL=true (or PGSSLMODE=require).
 */

const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({
  path: path.join(__dirname, '../.env'),
  override: true,
});

const { indiaFyWindowSql } = require('../src/utils/indiaFinancialYear');

const IST = 'Asia/Kolkata';

/** SQL fragment: exclude stock transfers from renumbering. */
function excludeStockTransferTypes(alias) {
  return ` AND ${alias}.type NOT IN ('stock_send', 'stock_receive')`;
}

function parseArgs() {
  const argv = process.argv.slice(2);
  const out = {
    dryRun: false,
    force: false,
    from: '2026-04-01',
    to: '2026-04-04',
    fyRef: '2026-04-01',
    companyId: null,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--dry-run') out.dryRun = true;
    else if (a === '--force') out.force = true;
    else if (a === '--from') {
      out.from = argv[++i];
    } else if (a === '--to') {
      out.to = argv[++i];
    } else if (a === '--fy-ref') {
      out.fyRef = argv[++i];
    } else if (a === '--company') {
      out.companyId = argv[++i];
    } else if (a === '-h' || a === '--help') {
      console.log(`
Usage: node scripts/renumberTransactionSerialsNewFy.js [options]

  --from YYYY-MM-DD   First calendar day (IST) to include (default 2026-04-01)
  --to YYYY-MM-DD     Last calendar day (IST) to include (default 2026-04-04 = Apr 1–4 inclusive)
  --fy-ref YYYY-MM-DD Reference date for India FY window (default 2026-04-01)
  --company UUID      Only this company
  --dry-run           Print planned updates only
  --force             Skip "later same-FY same-group" safety check
  -h, --help          This text

  Env: DB_SSL=true or PGSSLMODE=require if Postgres expects SSL (common on RDS).
`);
      process.exit(0);
    }
  }
  return out;
}

function poolFromEnv() {
  return new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'c_manager',
    password: process.env.DB_PASSWORD || 'password',
    port: Number(process.env.DB_PORT) || 5432,
    ssl: { rejectUnauthorized: false },
  });
}

async function main() {
  const opts = parseArgs();
  const pool = poolFromEnv();
  const client = await pool.connect();

  const fyRefPlaceholder = '$1';
  const fySqlT = indiaFyWindowSql('t.date', fyRefPlaceholder);
  const dayExprT = `(t.date AT TIME ZONE '${IST}')::date`;

  try {
    const baseParams = [opts.fyRef];
    let companyClauseT = '';
    if (opts.companyId) {
      companyClauseT = ' AND t.company_id = $2::uuid';
      baseParams.push(opts.companyId);
    }

    const fromParam = opts.from;
    const toParam = opts.to;
    const rangeParamStart = baseParams.length + 1;
    const rangeParamEnd = baseParams.length + 2;

    const inRangeClauseT = `${dayExprT} BETWEEN $${rangeParamStart}::date AND $${rangeParamEnd}::date`;

    if (!opts.force) {
      const companyClauseLt = companyClauseT.replace(/t\./g, 'lt.');
      const laterCheckSql = `
        SELECT DISTINCT lt.company_id::text, lt.type, lt.is_black
        FROM transactions lt
        WHERE ${indiaFyWindowSql('lt.date', fyRefPlaceholder)}
          ${companyClauseLt}
          ${excludeStockTransferTypes('lt')}
          AND (lt.date AT TIME ZONE '${IST}')::date > $${rangeParamEnd}::date
          AND EXISTS (
            SELECT 1 FROM transactions w
            WHERE w.company_id = lt.company_id
              AND w.type = lt.type
              AND w.is_black = lt.is_black
              AND ${indiaFyWindowSql('w.date', fyRefPlaceholder)}
              ${excludeStockTransferTypes('w')}
              AND (w.date AT TIME ZONE '${IST}')::date BETWEEN $${rangeParamStart}::date AND $${rangeParamEnd}::date
          )
      `;
      const laterParams = [...baseParams, fromParam, toParam];
      const laterRes = await client.query(laterCheckSql, laterParams);
      if (laterRes.rows.length > 0) {
        console.error(
          'Abort: same FY has transactions after --to for a (company, type, is_black) that also has rows in the renumber window. Fix manually or use --force.\n',
          laterRes.rows,
        );
        process.exitCode = 1;
        return;
      }
    }

    const listSql = `
      WITH numbered AS (
        SELECT
          t.id,
          ROW_NUMBER() OVER (
            PARTITION BY t.company_id, t.type, t.is_black
            ORDER BY t.created_at ASC NULLS LAST, t.date ASC, t.id ASC
          )::int AS new_serial
        FROM transactions t
        WHERE ${fySqlT}
          ${companyClauseT}
          ${excludeStockTransferTypes('t')}
          AND ${inRangeClauseT}
      )
      SELECT n.id, n.new_serial, t.serial_number AS old_serial,
             t.company_id::text, t.type, t.is_black,
             ${dayExprT} AS bill_day_ist
      FROM numbered n
      JOIN transactions t ON t.id = n.id
      ORDER BY t.company_id, t.type, t.is_black, n.new_serial
    `;
    const listParams = [...baseParams, fromParam, toParam];
    const planned = await client.query(listSql, listParams);

    if (planned.rows.length === 0) {
      console.log('No transactions in range.');
      return;
    }

    const changes = planned.rows.filter((r) => r.old_serial !== r.new_serial);
    console.log(
      `Planned: ${planned.rows.length} row(s) in window, ${changes.length} serial change(s). (White = is_black false, black = is_black true.)`,
    );
    for (const r of planned.rows) {
      const channel = r.is_black ? 'black' : 'white';
      console.log(
        `  ${r.company_id.slice(0, 8)}… ${r.type} ${channel} day=${r.bill_day_ist} id=${r.id} ${r.old_serial} -> ${r.new_serial}`,
      );
    }

    if (opts.dryRun) {
      console.log('\nDry run: no updates applied.');
      return;
    }

    if (changes.length === 0) {
      console.log('Nothing to update.');
      return;
    }

    await client.query('BEGIN');
    const updateSql = `
      WITH numbered AS (
        SELECT
          t.id,
          ROW_NUMBER() OVER (
            PARTITION BY t.company_id, t.type, t.is_black
            ORDER BY t.created_at ASC NULLS LAST, t.date ASC, t.id ASC
          )::int AS new_serial
        FROM transactions t
        WHERE ${fySqlT}
          ${companyClauseT}
          ${excludeStockTransferTypes('t')}
          AND ${inRangeClauseT}
      )
      UPDATE transactions tr
      SET serial_number = n.new_serial
      FROM numbered n
      WHERE tr.id = n.id
    `;
    const upd = await client.query(updateSql, listParams);
    await client.query('COMMIT');
    console.log(`\nUpdated ${upd.rowCount} row(s).`);
  } catch (e) {
    await client.query('ROLLBACK').catch(() => { });
    console.error(e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
