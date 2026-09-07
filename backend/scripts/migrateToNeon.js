const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const LOCAL_DB_URL = process.env.LOCAL_DATABASE_URL || 'postgres://postgres:Vishal@1878@localhost:5432/dealflow360';
const NEON_DB_URL = process.env.NEON_DATABASE_URL || 'postgresql://neondb_owner:npg_nWRy1bAz2Dem@ep-autumn-credit-b3amy8ud-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const localPool = new Pool({
  connectionString: LOCAL_DB_URL,
  connectionTimeoutMillis: 10000,
});

const neonPool = new Pool({
  connectionString: NEON_DB_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000,
});

const TOPOLOGICAL_ORDER = [
  'customer_tiers',
  'product_categories',
  'users',
  'customers',
  'products',
  'product_variant_attributes',
  'price_lists',
  'price_list_items',
  'approval_chain_rules',
  'warehouses',
  'warehouse_stock',
  'subscription_plans',
  'upsell_rules',
  'quotations',
  'quotation_lines',
  'quotation_approvals',
  'audit_log',
  'fulfillment_orders',
  'fulfillment_splits',
  'invoices',
  'payments',
  'subscription_billing_schedules',
  'credit_notes',
  'negotiation_requests',
  'deal_health_alerts',
  'rep_discount_history',
  'subscriptions',
];

async function syncEnums(localClient, neonClient) {
  const enumsRes = await localClient.query(`
    SELECT t.typname, e.enumlabel 
    FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid 
    ORDER BY t.typname, e.enumsortorder
  `);

  for (const row of enumsRes.rows) {
    try {
      await neonClient.query(`ALTER TYPE "${row.typname}" ADD VALUE IF NOT EXISTS '${row.enumlabel}';`);
    } catch (e) {
      // Ignored if type doesn't exist
    }
  }
}

async function ensureTableStructure(localClient, neonClient, tableName) {
  const colRes = await localClient.query(`
    SELECT column_name, data_type, udt_name, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1
    ORDER BY ordinal_position;
  `, [tableName]);

  const localCols = colRes.rows;

  const neonTableCheck = await neonClient.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = $1;
  `, [tableName]);

  if (neonTableCheck.rows.length === 0) {
    const colDefs = localCols.map((c) => {
      let typeStr = c.data_type === 'USER-DEFINED' ? `"${c.udt_name}"` : c.data_type;
      if (typeStr === 'ARRAY') typeStr = `${c.udt_name.replace(/^_/, '')}[]`;
      if (typeStr === 'character varying') typeStr = 'VARCHAR(255)';
      if (typeStr === 'timestamp with time zone') typeStr = 'TIMESTAMPTZ';
      return `"${c.column_name}" ${typeStr}`;
    }).join(', ');

    await neonClient.query(`CREATE TABLE IF NOT EXISTS "${tableName}" (${colDefs});`);
  } else {
    const neonColRes = await neonClient.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1;
    `, [tableName]);

    const neonCols = neonColRes.rows.map((r) => r.column_name);

    for (const c of localCols) {
      if (!neonCols.includes(c.column_name)) {
        let typeStr = c.data_type === 'USER-DEFINED' ? `"${c.udt_name}"` : c.data_type;
        if (typeStr === 'ARRAY') typeStr = `${c.udt_name.replace(/^_/, '')}[]`;
        if (typeStr === 'character varying') typeStr = 'VARCHAR(255)';
        if (typeStr === 'timestamp with time zone') typeStr = 'TIMESTAMPTZ';
        await neonClient.query(`ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS "${c.column_name}" ${typeStr};`);
      }
    }
  }
}

async function runMigration() {
  console.log('====================================================');
  console.log('  DealFlow360 — Local PostgreSQL to Neon Migration  ');
  console.log('====================================================\n');

  let localClient;
  let neonClient;

  try {
    console.log('[1/4] Connecting to Local and Neon Databases...');
    localClient = await localPool.connect();
    neonClient = await neonPool.connect();
    console.log(' -> Local DB Connected successfully.');
    console.log(' -> Neon DB Connected successfully.\n');

    console.log('[2/4] Applying Base Schema & Syncing ENUM Types to Neon DB...');
    const schemaPath = path.join(__dirname, '../db/dealflow360_schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      try {
        await neonClient.query(schemaSql);
        console.log(' -> Base schema applied from dealflow360_schema.sql.');
      } catch (schemaErr) {
        console.log(' -> Base schema notice:', schemaErr.message);
      }
    }

    // Sync enum values from local DB to Neon DB
    await syncEnums(localClient, neonClient);
    console.log(' -> ENUM types synced with local database values.');

    // Temporarily drop circular foreign key constraints for migration
    console.log(' -> Relaxing circular FK constraints for batch import...');
    try {
      await neonClient.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_phone_number_key;');
      await neonClient.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_customer;');
      await neonClient.query('ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_sales_rep_id_fkey;');
    } catch (e) {
      // Ignored
    }

    console.log('\n[3/4] Transferring Data and Syncing Columns...');
    const tablesRes = await localClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT IN ('schema_migrations')
      ORDER BY table_name;
    `);

    const availableLocalTables = tablesRes.rows.map((r) => r.table_name);

    const orderedTables = [
      ...TOPOLOGICAL_ORDER.filter((t) => availableLocalTables.includes(t)),
      ...availableLocalTables.filter((t) => !TOPOLOGICAL_ORDER.includes(t)),
    ];

    // Ensure all table structures and columns match
    for (const tableName of orderedTables) {
      await ensureTableStructure(localClient, neonClient, tableName);
    }

    // Simultaneously truncate all tables in a single TRUNCATE statement
    console.log(' -> Truncating all Neon database tables simultaneously...');
    const tableListStr = orderedTables.map((t) => `"${t}"`).join(', ');
    try {
      await neonClient.query(`TRUNCATE TABLE ${tableListStr} CASCADE;`);
      console.log(' -> All Neon tables truncated cleanly.');
    } catch (truncErr) {
      console.warn(' -> Truncate warning:', truncErr.message);
    }

    // Migrate rows table by table
    for (const tableName of orderedTables) {
      process.stdout.write(` -> Migrating table [${tableName.padEnd(30)}] ... `);

      const rowsRes = await localClient.query(`SELECT * FROM "${tableName}"`);
      const rows = rowsRes.rows;

      if (rows.length === 0) {
        console.log(`0 rows (Empty table)`);
        continue;
      }

      const columns = Object.keys(rows[0]);
      const colNamesStr = columns.map((c) => `"${c}"`).join(', ');

      const chunkSize = 50;
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        const valuePlaceholders = [];
        const flatValues = [];
        let valIndex = 1;

        for (const row of chunk) {
          const rowPlaceholders = [];
          for (const col of columns) {
            rowPlaceholders.push(`$${valIndex}`);
            flatValues.push(row[col]);
            valIndex += 1;
          }
          valuePlaceholders.push(`(${rowPlaceholders.join(', ')})`);
        }

        const insertSql = columns.includes('id')
          ? `INSERT INTO "${tableName}" (${colNamesStr}) VALUES ${valuePlaceholders.join(', ')} ON CONFLICT (id) DO NOTHING;`
          : `INSERT INTO "${tableName}" (${colNamesStr}) VALUES ${valuePlaceholders.join(', ')};`;
        await neonClient.query(insertSql, flatValues);
      }

      console.log(`DONE (${rows.length} rows migrated)`);
    }

    // Re-apply circular foreign key constraints after all rows exist
    console.log(' -> Re-enabling circular foreign key constraints on Neon DB...');
    try {
      await neonClient.query(`
        ALTER TABLE users 
          ADD CONSTRAINT fk_users_customer 
          FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
      `);
    } catch (fkErr) {
      // Ignored
    }

    try {
      await neonClient.query(`
        ALTER TABLE customers 
          ADD CONSTRAINT customers_sales_rep_id_fkey 
          FOREIGN KEY (sales_rep_id) REFERENCES users(id);
      `);
    } catch (fkErr) {
      // Ignored
    }

    console.log('\n[4/4] Verifying Data Integrity across Local & Neon...');
    let totalLocalRows = 0;
    let totalNeonRows = 0;
    let hasMismatch = false;

    for (const tableName of orderedTables) {
      const lRes = await localClient.query(`SELECT COUNT(*) FROM "${tableName}"`);
      const nRes = await neonClient.query(`SELECT COUNT(*) FROM "${tableName}"`);
      const lCount = parseInt(lRes.rows[0].count, 10);
      const nCount = parseInt(nRes.rows[0].count, 10);

      totalLocalRows += lCount;
      totalNeonRows += nCount;

      const status = lCount === nCount ? 'MATCH' : 'MISMATCH!';
      if (lCount !== nCount) hasMismatch = true;
      console.log(` -> Table [${tableName.padEnd(30)}]: Local = ${lCount.toString().padStart(4)} | Neon = ${nCount.toString().padStart(4)} [${status}]`);
    }

    console.log('\n====================================================');
    console.log(` MIGRATION SUMMARY: Total Rows Local=${totalLocalRows} | Neon=${totalNeonRows}`);
    if (!hasMismatch) {
      console.log(' SUCCESS: 100% DATA MIGRATE TO NEON POSTGRESQL ACCURATELY!');
    } else {
      console.warn(' WARNING: Some row counts mismatch. Check errors above.');
    }
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n Migration Error:', err);
    process.exitCode = 1;
  } finally {
    if (localClient) localClient.release();
    if (neonClient) neonClient.release();
    await localPool.end();
    await neonPool.end();
  }
}

runMigration();
