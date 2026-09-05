const { indiaFyWindowSql } = require('@/utils/indiaFinancialYear');

const PURCHASE_TYPE = 'purchase';

function isPurchaseType(type) {
  return type === PURCHASE_TYPE;
}

function normalizePurchaseSerialNumber(value) {
  if (value === undefined || value === null || value === '') return null;

  const normalized = String(value).trim();

  return normalized || null;
}

function accountSerialAsText(alias) {
  if (alias) {
    return `${alias}.serial_number::text`;
  }

  return 'serial_number::text';
}

function effectiveSerialAlias(alias) {
  if (alias) {
    return `COALESCE(${alias}.serial_number::text, ${alias}.purchase_serial_number)`;
  }

  return 'COALESCE(serial_number::text, purchase_serial_number)';
}

function formatTransactionForResponse(transaction) {
  if (!transaction) return transaction;

  const formatted = { ...transaction };

  if (formatted.serial_number == null && formatted.purchase_serial_number != null) {
    formatted.serial_number = formatted.purchase_serial_number;
  }

  delete formatted.purchase_serial_number;

  return formatted;
}

function formatTransactionsForResponse(transactions) {
  if (Array.isArray(transactions)) {
    return transactions.map(formatTransactionForResponse);
  }

  return formatTransactionForResponse(transactions);
}

async function getNextSerialNumber(db, { type, is_black, company_id, date }) {
  if (isPurchaseType(type)) {
    return null;
  }

  const maxSerialResult = await db.queryOne(
    `
      SELECT COALESCE(MAX(serial_number), 0) + 1 AS next_serial
      FROM transactions
      WHERE type = $1 AND is_black = $2 AND company_id = $3
      AND ${indiaFyWindowSql('date', '$4')}
    `,
    [type, is_black, company_id, date],
  );

  return maxSerialResult.next_serial;
}

async function checkSerialNumberExists(db, {
  company_id,
  serial_number,
  type,
  is_black,
  date,
  excludeId,
}) {
  const normalizedSerialNumber = isPurchaseType(type)
    ? normalizePurchaseSerialNumber(serial_number)
    : serial_number;

  if (normalizedSerialNumber == null) return false;

  const column = isPurchaseType(type) ? 'purchase_serial_number' : 'serial_number';
  const fy = indiaFyWindowSql('date', '$5');
  const excludeClause = excludeId ? 'AND id != $6' : '';
  const params = [company_id, normalizedSerialNumber, type, is_black, date];

  if (excludeId) params.push(excludeId);

  const existing = await db.queryOne(
    `
      SELECT id
      FROM transactions
      WHERE company_id = $1
        AND ${column} = $2
        AND type = $3
        AND is_black = $4
        AND ${fy}
        ${excludeClause}
    `,
    params,
  );

  return !!existing;
}

module.exports = {
  PURCHASE_TYPE,
  isPurchaseType,
  normalizePurchaseSerialNumber,
  accountSerialAsText,
  effectiveSerialAlias,
  formatTransactionForResponse,
  formatTransactionsForResponse,
  getNextSerialNumber,
  checkSerialNumberExists,
};
