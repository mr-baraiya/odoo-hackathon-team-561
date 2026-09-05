const { Client } = require('pg');
const fs = require('fs').promises;

const dataGetFromBackupDatabase = new Client({
  user: 'postgres',
  host: '3.109.16.154',
  database: 'c_manager_1',
  password: '7096413386',
  port: 5432,
});

const restoreDataToDatabase = new Client({
  user: 'postgres',
  host: '3.109.16.154',
  database: 'c_manager',
  password: '7096413386',
  port: 5432,
});

async function writeLog(filename, message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  await fs.appendFile(filename, logMessage);
  console.log(message);
}

async function restoreSingleOrder(orderId) {
  // Get full order data from backup database
  const orderResult = await dataGetFromBackupDatabase.query(
    `SELECT
      id, company_id, party_id, status, created_by, updated_by,
      created_at, updated_at, date, remark, transaction_id,
      sub_total, discount, cash_discount, tax, total,
      additional_charges, serial_number, is_black,
      delivery_address, order_type, associated_quotation_id,
      is_order_from_application
    FROM orders WHERE id = $1`,
    [orderId],
  );

  if (orderResult.rows.length === 0) {
    const errorMsg = `Order ${orderId} not found in backup database, skipping...`;
    await writeLog('orderfileerror.txt', errorMsg);
    throw new Error(errorMsg);
  }

  const order = orderResult.rows[0];

  // Insert order into restore database
  await restoreDataToDatabase.query(
    `INSERT INTO orders (
      id, company_id, party_id, status, created_by, updated_by,
      created_at, updated_at, date, remark, transaction_id,
      sub_total, discount, cash_discount, tax, total,
      additional_charges, serial_number, is_black,
      delivery_address, order_type, associated_quotation_id,
      is_order_from_application
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)`,
    [
      order.id,
      order.company_id,
      order.party_id,
      order.status,
      order.created_by,
      order.updated_by,
      order.created_at,
      order.updated_at,
      new Date(),
      order.remark,
      order.transaction_id,
      order.sub_total,
      order.discount,
      order.cash_discount,
      order.tax,
      order.total,
      order.additional_charges,
      order.serial_number,
      order.is_black,
      order.delivery_address,
      order.order_type,
      order.associated_quotation_id,
      order.is_order_from_application,
    ],
  );

  // Get order items from backup database
  const orderItemsResult = await dataGetFromBackupDatabase.query(
    `SELECT
      order_id, product_id, quantity, remark, discount,
      price, total, gst
    FROM order_items WHERE order_id = $1`,
    [orderId],
  );

  // Insert order items into restore database
  const insertItemPromises = orderItemsResult.rows.map((item) => restoreDataToDatabase.query(
    `INSERT INTO order_items (
      order_id, product_id, quantity, remark, discount,
      price, total, gst
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      item.order_id,
      item.product_id,
      item.quantity,
      item.remark,
      item.discount,
      item.price,
      item.total,
      item.gst,
    ],
  ));

  await Promise.all(insertItemPromises);

  const successMsg = `✓ Restored order ${orderId} (Serial: ${order.serial_number}) with ${orderItemsResult.rows.length} items`;
  await writeLog('orderfile.txt', successMsg);
  return { success: true, orderId, serialNumber: order.serial_number, itemCount: orderItemsResult.rows.length };
}

async function restoreOrdersAndItems(orderIds) {
  // Start a single transaction for all orders
  await restoreDataToDatabase.query('BEGIN');

  try {
    const results = await orderIds.reduce(async (accPromise, orderId) => {
      const acc = await accPromise;
      const result = await restoreSingleOrder(orderId);
      return {
        restored: acc.restored + 1,
        orders: [...acc.orders, result],
      };
    }, Promise.resolve({ restored: 0, orders: [] }));

    // Commit transaction if all orders succeeded
    await restoreDataToDatabase.query('COMMIT');
    const summaryMsg = `\n=== Restore Summary ===\nSuccessfully restored: ${results.restored} orders\nAll transactions committed successfully.`;
    await writeLog('orderfile.txt', summaryMsg);

    return results;
  } catch (error) {
    // Rollback all transactions if any error occurs
    await restoreDataToDatabase.query('ROLLBACK');
    const errorMsg = `\n=== Restore Failed ===\nError: ${error.message}\nAll transactions have been rolled back.`;
    await writeLog('orderfileerror.txt', errorMsg);
    throw error;
  }
}

async function getPendingOrdersAndPrintSerialNumbers() {
  // Initialize log files
  await fs.writeFile('orderfile.txt', '=== Order Restore Success Log ===\n');
  await fs.writeFile('orderfileerror.txt', '=== Order Restore Error Log ===\n');

  try {
    // Connect to both databases
    await dataGetFromBackupDatabase.connect();
    console.log('Connected to backup database');

    await restoreDataToDatabase.connect();
    console.log('Connected to restore database');

    // Get order IDs with pending status from backup database
    const pendingOrdersResult = await dataGetFromBackupDatabase.query(
      'SELECT id FROM orders WHERE status = $1',
      ['pending'],
    );

    const pendingOrderIds = pendingOrdersResult.rows.map((row) => row.id);
    console.log(`Found ${pendingOrderIds.length} pending orders in backup database\n`);

    // For each order ID, find serial_number in restore database
    const serialNumberPromises = pendingOrderIds.map(async (orderId) => {
      const orderResult = await restoreDataToDatabase.query(
        'SELECT serial_number FROM orders WHERE id = $1',
        [orderId],
      );

      if (orderResult.rows.length > 0) {
        const serialNumber = orderResult.rows[0].serial_number;
        console.log(`Order ID: ${orderId} -> Serial Number: ${serialNumber}`);
        return { orderId, serialNumber, found: true };
      }
      // print serial number of order from backup database
      const orderResultFromBackupDatabase = await dataGetFromBackupDatabase.query(
        'SELECT serial_number FROM orders WHERE id = $1',
        [orderId],
      );
      const backupSerialNumber = orderResultFromBackupDatabase.rows[0].serial_number;
      console.log(`Order ID: ${orderId} -> Serial Number from backup database: ${backupSerialNumber} (NOT FOUND in restore database)`);
      return { orderId, serialNumber: backupSerialNumber, found: false };
    });

    const results = await Promise.all(serialNumberPromises);

    // Count orders not found in restore database
    const notFoundOrders = results.filter((result) => !result.found);
    console.log('\n=== Summary ===');
    console.log(`Total pending orders: ${pendingOrderIds.length}`);
    console.log(`Orders found in restore database: ${results.filter((r) => r.found).length}`);
    console.log(`Orders NOT found in restore database: ${notFoundOrders.length}`);

    // Restore orders and their items
    if (notFoundOrders.length > 0) {
      console.log('\n=== Starting Restore Process ===');
      try {
        await restoreOrdersAndItems(notFoundOrders.map((o) => o.orderId));
      } catch (error) {
        const errorMsg = `\n=== Fatal Error in Restore Process ===\n${error.message}\nStack: ${error.stack}`;
        await writeLog('orderfileerror.txt', errorMsg);
        throw error;
      }
    } else {
      await writeLog('orderfile.txt', '\n=== No orders to restore. All pending orders already exist in restore database. ===');
    }

  } catch (error) {
    console.error('Error:', error);
    await writeLog('orderfileerror.txt', `\n=== Fatal Error ===\n${error.message}\nStack: ${error.stack}`);
  } finally {
    // Close connections
    await dataGetFromBackupDatabase.end();
    await restoreDataToDatabase.end();
    console.log('\nDatabase connections closed');
  }
}

// Run the function
getPendingOrdersAndPrintSerialNumbers();
