const Database = require('@/service/database');

/**
 * Generates the next serial number with decimal suffix for a recreated order
 * @param {DatabaseClient} db - Database client
 * @param {number} parentSerialNumber - The parent order's serial number
 * @returns {Promise<number>} The next serial number with decimal suffix
 */
async function generateNextRecreatedSerialNumber(db, parentSerialNumber) {
  // Extract the base integer part of the parent serial number
  // If parentSerialNumber is 330.1, we'll use 330 as the base
  const baseSerialNumber = Math.floor(Number(parentSerialNumber));

  // Find all existing orders with serial numbers that match the pattern: baseNumber.decimal
  // We'll query for serial numbers that start with the base number followed by a decimal point
  const existingRecreatedOrders = await db.queryAll(
    `
    SELECT serial_number::text as serial_text
    FROM orders
    WHERE serial_number::text LIKE $1 || '.%'
    ORDER BY serial_number::numeric DESC
    `,
    [baseSerialNumber.toString()],
  );

  // Extract the highest suffix from existing recreated orders
  const maxSuffix = existingRecreatedOrders.reduce((max, row) => {
    const serialText = row.serial_text;
    const parts = serialText.split('.');
    if (parts.length === 2) {
      const suffix = parseInt(parts[1], 10);
      if (!Number.isNaN(suffix) && suffix > max) {
        return suffix;
      }
    }
    return max;
  }, 0);

  // Generate the next suffix
  const nextSuffix = maxSuffix + 1;
  const newSerialNumber = parseFloat(`${baseSerialNumber}.${nextSuffix}`);

  return newSerialNumber;
}

/**
 * Creates a new order with remaining items that are not in the transaction
 * @param {DatabaseClient} db - Database client
 * @param {Object} order - Original order object
 * @param {Array} remainingItems - Array of order items not in transaction
 * @param {string} userId - User ID for created_by/updated_by
 * @returns {Object} New order object
 */
async function createOrderWithRemainingItems(db, order, remainingItems, userId) {

  // Calculate totals for remaining items
  const orderItems = remainingItems.map((item) => {
    const productDiscountedPrice = item.price - item.price * (item.discount / 100);
    const productSubTotal = productDiscountedPrice * item.quantity;
    const productTotal = productSubTotal + productSubTotal * (item.gst / 100);
    return { ...item, total: productTotal };
  });

  const sub_total = orderItems.reduce((acc, item) => acc + item.total, 0);
  let total = sub_total - sub_total * ((order.discount || 0) / 100);
  total -= order.cash_discount || 0;
  total += ((order.tax || 0) * total) / 100;
  total += (order.additional_charges || []).reduce((acc, charge) => acc + charge.amount, 0);

  // Generate serial number with decimal suffix based on parent order's serial number
  const newSerialNumber = await generateNextRecreatedSerialNumber(db, order.serial_number);

  // Create new order
  const newOrder = await db.queryOne(
    `
    INSERT INTO orders (
      serial_number,
      company_id, party_id, date, remark, sub_total, discount, cash_discount, tax,
      additional_charges, total, created_by, updated_by, is_black, delivery_address, order_type, order_source
    )
    VALUES (
      $1,
      $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
      $12, $13, $14, $15, $16, $17
    )
    RETURNING *
  `,
    [
      newSerialNumber,
      order.company_id,
      order.party_id,
      order.date,
      order.remark ? `${order.remark} (Auto-created from order #${order.serial_number})` : `Auto-created from order #${order.serial_number}`,
      sub_total,
      order.discount || 0,
      order.cash_discount || 0,
      order.tax || 0,
      order.additional_charges || [],
      total,
      userId,
      userId,
      order.is_black || false,
      order.delivery_address,
      order.order_type,
      'auto',
    ],
  );

  // Insert order items
  const pm = Database.parameter();
  const valueQuery = orderItems
    .map(
      (item) => `(${pm.i(newOrder.id)}, ${pm.i(item.product_id)}, ${pm.i(item.quantity)}, ${pm.i(
        item.price,
      )}, ${pm.i(item.discount)}, ${pm.i(item.gst)}, ${pm.i(
        item.total,
      )}, ${pm.i(item.remark || null)})`,
    )
    .join(',');

  await db.query(
    `
    INSERT INTO order_items (order_id, product_id, quantity, price, discount, gst, total, remark)
    VALUES ${valueQuery}
  `,
    pm.values,
  );

  return newOrder;
}

/**
 * Recalculates and updates the original order's subtotal and total based on remaining items
 * @param {DatabaseClient} db - Database client
 * @param {Object} order - Original order object
 */
async function recalculateOriginalOrderTotals(db, order) {
  // Fetch remaining order items after deletion
  const remainingOrderItems = await db.queryAll(
    'SELECT * FROM order_items WHERE order_id = $1',
    [order.id],
  );

  // Calculate totals for remaining items
  const processedItems = remainingOrderItems.map((item) => {
    const productDiscountedPrice = item.price - item.price * (item.discount / 100);
    const productSubTotal = productDiscountedPrice * item.quantity;
    const productTotal = productSubTotal + productSubTotal * (item.gst / 100);
    return { ...item, total: productTotal };
  });

  // Calculate order totals
  const sub_total = processedItems.reduce((acc, item) => acc + item.total, 0);
  let total = sub_total - sub_total * ((order.discount || 0) / 100);
  total -= order.cash_discount || 0;
  total += ((order.tax || 0) * total) / 100;
  total += (order.additional_charges || []).reduce((acc, charge) => acc + (charge.amount || 0), 0);

  // Update the original order with new totals
  await db.query(
    'UPDATE orders SET sub_total = $1, total = $2 WHERE id = $3',
    [sub_total, total, order.id],
  );
}

/**
 * Checks for remaining items and creates a new order if needed
 * @param {DatabaseClient} db - Database client
 * @param {Object} order - Original order object
 * @param {string} userId - User ID
 * @returns {Object|null} New order if created, null otherwise
 */
async function checkAndCreateRemainingOrder(db, order, userId) {
  // Only process if order has a transaction
  if (!order.transaction_id) {
    return null;
  }

  // Fetch all order items
  const orderItems = await db.queryAll(
    'SELECT * FROM order_items WHERE order_id = $1',
    [order.id],
  );

  if (orderItems.length === 0) {
    return null;
  }

  // Fetch all transaction items
  const transactionItems = await db.queryAll(
    'SELECT * FROM transaction_items WHERE transaction_id = $1',
    [order.transaction_id],
  );

  if (transactionItems.length === 0) {
    return null;
  }

  // Aggregate transacted quantity per product
  const transactedQtyByProduct = transactionItems.reduce((acc, ti) => {
    const current = acc[ti.product_id] || 0;
    return {
      ...acc,
      [ti.product_id]: current + Number(ti.quantity || 0),
    };
  }, {});

  // Preserve original behaviour:
  // Only create a new order if at least one product from the original order or mismatch quantity products
  // exists in the related transaction.
  const hasMatchingItems = orderItems.some(
    (oi) => (transactedQtyByProduct[oi.product_id] || 0) > 0,
  );

  if (!hasMatchingItems) {
    return null;
  }

  // Build:
  // - newOrderItems: items (or partial quantities) that should move to the new order
  // - fullMoveProductIds: product_ids that move completely to the new order
  // - partialUpdates: per-product quantity (and total) that should remain on the original order
  const newOrderItems = [];
  const fullMoveProductIds = [];
  const partialUpdates = [];

  orderItems.forEach((oi) => {
    const originalQty = Number(oi.quantity || 0);
    const transactedQty = transactedQtyByProduct[oi.product_id] || 0;

    if (transactedQty <= 0) {
      // This product was not scanned at all in the transaction -> move entire line to new order
      newOrderItems.push({
        product_id: oi.product_id,
        quantity: originalQty,
        price: oi.price,
        discount: oi.discount,
        gst: oi.gst,
        remark: oi.remark,
      });
      fullMoveProductIds.push(oi.product_id);
      return;
    }

    if (transactedQty >= originalQty) {
      // Entire quantity is already scanned/covered by the transaction -> nothing to move
      return;
    }

    // Partially scanned:
    // - Keep the scanned quantity on the original order
    // - Move the remaining quantity to a new order
    const remainingQty = originalQty - transactedQty;
    if (remainingQty > 0) {
      newOrderItems.push({
        product_id: oi.product_id,
        quantity: remainingQty,
        price: oi.price,
        discount: oi.discount,
        gst: oi.gst,
        remark: oi.remark,
      });

      const productDiscountedPrice = oi.price - oi.price * (oi.discount / 100);
      const productSubTotal = productDiscountedPrice * transactedQty;
      const productTotal = productSubTotal + productSubTotal * (oi.gst / 100);

      partialUpdates.push({
        product_id: oi.product_id,
        quantity: transactedQty,
        total: productTotal,
      });
    }
  });

  // If nothing to move, do not create a new order
  if (newOrderItems.length === 0) {
    return null;
  }

  // Create the new order with remaining / unscanned quantities
  const newOrder = await createOrderWithRemainingItems(db, order, newOrderItems, userId);

  // Remove fully-moved items from the original order
  if (fullMoveProductIds.length > 0) {
    await db.query(
      'DELETE FROM order_items WHERE order_id = $1 AND product_id = ANY($2)',
      [order.id, fullMoveProductIds],
    );
  }

  // Apply partial quantity updates on the original order items
  // (keep only the scanned quantity on the original order)
  // eslint-disable-next-line no-restricted-syntax
  for (const item of partialUpdates) {
    // eslint-disable-next-line no-await-in-loop
    await db.query(
      'UPDATE order_items SET quantity = $1, total = $2 WHERE order_id = $3 AND product_id = $4',
      [item.quantity, item.total, order.id, item.product_id],
    );
  }

  // Recalculate and update the original order's subtotal and total
  await recalculateOriginalOrderTotals(db, order);

  return newOrder;
}

module.exports = {
  createOrderWithRemainingItems,
  recalculateOriginalOrderTotals,
  checkAndCreateRemainingOrder,
  generateNextRecreatedSerialNumber,
};
