/**
 * Update product purchase_price and hsn_code from an Excel file.
 *
 * Expected Excel columns:
 * - Product ID
 * - HSN Code
 * - Purchase Price
 *
 * Usage:
 *   node scripts/updateProductHsnAndPurchasePriceFromExcel.js
 *
 * Update EXCEL_FILE_PATH and SHEET_NAME below before running.
 *
 * Requires .env with DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 */

/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { Client } = require('pg');

require('dotenv').config({
  path: path.join(__dirname, '../.env'),
  override: true,
});

const EXCEL_FILE_PATH = 'p1.xlsx';
const SHEET_NAME = 'Sheet1';
const LOG_FILE_PATH = path.join(__dirname, 'product_hsn_purchase_price_upload.log.txt');

const EXCEL_COLUMNS = {
  productId: 'Product ID',
  hsnCode: 'HSN Code',
  purchasePrice: 'Purchase Price',
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function writeErrorLog(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(LOG_FILE_PATH, line, 'utf8');
}

function getExcelConfig() {
  const filePath = path.resolve(EXCEL_FILE_PATH);

  if (!fs.existsSync(filePath)) {
    console.error(`Excel file not found: ${filePath}`);
    process.exit(1);
  }

  return { filePath, sheetName: SHEET_NAME };
}

function normalizeCell(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function parsePurchasePrice(value, rowNumber) {
  const raw = normalizeCell(value);
  if (raw === '') {
    throw new Error(`Row ${rowNumber}: Purchase Price is required`);
  }

  const purchasePrice = Number(raw.replace(/,/g, ''));
  if (Number.isNaN(purchasePrice) || purchasePrice < 0) {
    throw new Error(`Row ${rowNumber}: Invalid Purchase Price "${value}"`);
  }

  return purchasePrice;
}

function readExcelRows(filePath, sheetName) {
  const workbook = XLSX.readFile(filePath, { cellDates: false });
  const targetSheetName = sheetName || workbook.SheetNames[0];

  if (!workbook.SheetNames.includes(targetSheetName)) {
    throw new Error(
      `Sheet "${targetSheetName}" not found. Available sheets: ${workbook.SheetNames.join(', ')}`,
    );
  }

  const worksheet = workbook.Sheets[targetSheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (rows.length === 0) {
    throw new Error(`Sheet "${targetSheetName}" is empty`);
  }

  const firstRow = rows[0];
  const missingColumns = Object.values(EXCEL_COLUMNS).filter((column) => !(column in firstRow));
  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
  }

  const parsedRows = [];
  const errors = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const productId = normalizeCell(row[EXCEL_COLUMNS.productId]);
    const hsnCode = normalizeCell(row[EXCEL_COLUMNS.hsnCode]);
    const purchasePriceRaw = row[EXCEL_COLUMNS.purchasePrice];

    if (!productId && !hsnCode && normalizeCell(purchasePriceRaw) === '') {
      return;
    }

    try {
      if (!productId) {
        throw new Error(`Row ${rowNumber}: Product ID is required`);
      }

      if (!UUID_REGEX.test(productId)) {
        throw new Error(`Row ${rowNumber}: Invalid Product ID "${productId}"`);
      }

      if (!hsnCode) {
        throw new Error(`Row ${rowNumber}: HSN Code is required`);
      }

      parsedRows.push({
        rowNumber,
        productId,
        hsnCode,
        purchasePrice: parsePurchasePrice(purchasePriceRaw, rowNumber),
      });
    } catch (error) {
      errors.push(error.message);
    }
  });

  if (errors.length > 0) {
    throw new Error(`Excel validation errors:\n${errors.join('\n')}`);
  }

  if (parsedRows.length === 0) {
    throw new Error('No valid rows found in Excel sheet');
  }

  return { rows: parsedRows, sheetName: targetSheetName };
}

async function updateProduct(client, row) {
  const result = await client.query(
    `
      UPDATE products
      SET
        hsn_code = $1,
        purchase_price = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `,
    [row.hsnCode, row.purchasePrice, row.productId],
  );

  if (result.rowCount === 0) {
    throw new Error(`Product not found for Product ID ${row.productId}`);
  }
}

async function main() {
  const { filePath, sheetName } = getExcelConfig();
  const { rows, sheetName: resolvedSheetName } = readExcelRows(filePath, sheetName);

  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'c_manager',
    password: process.env.DB_PASSWORD || 'password',
    port: Number(process.env.DB_PORT) || 5432,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  await client.connect();
  console.log(`Connected to database: ${process.env.DB_NAME || 'c_manager'}`);
  console.log(`Reading sheet "${resolvedSheetName}" from ${filePath}`);
  console.log(`Found ${rows.length} rows to update`);
  console.log(`Error log file: ${LOG_FILE_PATH}\n`);

  let successCount = 0;
  let errorCount = 0;

  try {
    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];

      try {
        await updateProduct(client, row);
        successCount += 1;
        console.log(
          `${index + 1}/${rows.length} Updated product ${row.productId} | HSN: ${row.hsnCode} | Purchase Price: ${row.purchasePrice}`,
        );
      } catch (error) {
        errorCount += 1;
        const errorMessage = `${index + 1}/${rows.length} FAILED | Row ${row.rowNumber} | Product ID: ${row.productId} | Error: ${error.message}`;
        console.error(errorMessage);
        writeErrorLog(errorMessage);
      }
    }
  } finally {
    await client.end();
  }

  console.log('\nDone.');
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  if (errorCount > 0) {
    console.log(`Error log file: ${LOG_FILE_PATH}`);
  }

  if (errorCount > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    const errorMessage = `Script failed: ${error.message}`;
    console.error(errorMessage);
    writeErrorLog(errorMessage);
    process.exit(1);
  });
}

module.exports = { readExcelRows, updateProduct };
