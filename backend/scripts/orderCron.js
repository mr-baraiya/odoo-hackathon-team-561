// /* eslint-disable no-restricted-syntax */
// /* eslint-disable no-await-in-loop */
// /* eslint-disable no-plusplus */
// /* eslint-disable no-unused-vars */
// const { Client } = require('pg');

// const dbClient = new Client({
//   user: 'postgres',
//   host: '3.109.16.154',
//   database: 'c_manager',
//   password: '9925913386',
//   port: 5432,
// });

// async function findOrdersWithPendingStatusAndCreateNewOrders() {
//   await dbClient.connect();

//   try {
//     await dbClient.query('BEGIN');

//     const ordersResult = await dbClient.query(`
//       SELECT
//         o.id as order_id,
//         o.serial_number as order_serial,
//         o.status,
//         o.transaction_id,
//         o.is_black,
//         o.party_id,
//         o.company_id,
//         o.discount,
//         o.cash_discount,
//         o.tax,
//         o.additional_charges,
//         o.remark,
//         o.created_by,
//         o.updated_by,
//         o.created_at,
//         o.updated_at
//       FROM orders o
//       WHERE o.status in ('pending', 'completed')
//       ORDER BY o.serial_number DESC
//     `);

//     const orders = ordersResult.rows;
//     let mismatchedCount = 0;
//     const mismatchedOrderNumbers = [];
//     const matchingOrderNumbers = [];

//     if (orders.length === 0) {
//       return {
//         mismatchedCount: 0,
//         mismatchedOrderNumbers: [],
//         matchingOrderNumbers: [],
//         totalOrders: 0,
//       };
//     }
//     for (const order of orders) {

//       // Get order items
//       const orderItemsResult = await dbClient.query(
//         `
//         SELECT
//           oi.product_id,
//           oi.quantity,
//           oi.price,
//           oi.total,
//           oi.discount,
//           oi.gst,
//           oi.remark
//         FROM order_items oi
//         WHERE oi.order_id = $1
//         ORDER BY oi.product_id
//       `,
//         [order.order_id],
//       );

//       const orderItems = orderItemsResult.rows;
//       const orderLength = orderItems.length;

//       if (!order.transaction_id) {
//         await dbClient.query(
//           'UPDATE orders SET date = $1 WHERE id = $2',
//           [new Date(), order.order_id],
//         );
//       } else {
//         const transactionItemsResult = await dbClient.query(
//           `
//           SELECT
//             ti.product_id,
//             ti.quantity,
//             ti.price,
//             ti.total
//           FROM transaction_items ti
//           WHERE ti.transaction_id = $1
//           ORDER BY ti.product_id
//         `,
//           [order.transaction_id],
//         );

//         const transactionItems = transactionItemsResult.rows;
//         const transactionLength = transactionItems.length;

//         if (order.order_serial === 1499) {
//           console.log(orderItems, transactionItems);
//         }

//         const orderProductIds = orderItems
//           .map((item) => ({
//             product_id: item.product_id,
//             quantity: item.quantity,

//           }))
//           .sort();
//         const transactionProductIds = transactionItems
//           .map((item) => ({
//             product_id: item.product_id,
//             quantity: item.quantity,

//           }))
//           .sort();

//         const productsMatch = JSON.stringify(orderProductIds)
//           === JSON.stringify(transactionProductIds);
//         const lengthsMatch = orderLength === transactionLength;

//         if (productsMatch && lengthsMatch) {
//           matchingOrderNumbers.push(order.order_serial);
//         } else {
//           mismatchedCount++;
//           mismatchedOrderNumbers.push(order.order_serial);

//           const missingProducts = [];
//           const quantityMismatches = [];
//           for (const orderItem of orderItems) {
//             const transactionItem = transactionItems.find(
//               (ti) => ti.product_id === orderItem.product_id,
//             );

//             if (!transactionItem) {
//               missingProducts.push(orderItem.product_id);
//             } else if (orderItem.quantity !== transactionItem.quantity) {
//               const remainingQuantity = orderItem.quantity - transactionItem.quantity;
//               if (remainingQuantity > 0) {
//                 quantityMismatches.push({
//                   ...orderItem,
//                   quantity: remainingQuantity,
//                 });
//               }
//             }
//           }

//           if (missingProducts.length > 0 || quantityMismatches.length > 0) {
//             // Get full details of missing products
//             const missingProductDetails = orderItems.filter((item) => missingProducts.includes(item.product_id));

//             // Combine missing products and quantity mismatches
//             const allMissingItems = [
//               ...missingProductDetails,
//               ...quantityMismatches,
//             ];

//             // Calculate totals for new order following createOrder.js logic
//             const processedOrderItems = allMissingItems.map((item) => {
//               const productDiscountedPrice = item.price - item.price * (item.discount / 100);
//               const productSubTotal = productDiscountedPrice * item.quantity;
//               const productTotal = productSubTotal + productSubTotal * (item.gst / 100);
//               return { ...item, total: productTotal };
//             });

//             const sub_total = processedOrderItems.reduce(
//               (acc, item) => acc + item.total,
//               0,
//             );

//             let total = sub_total - sub_total * ((order.discount || 0) / 100);
//             total -= order.cash_discount || 0;
//             total += ((order.tax || 0) * total) / 100;
//             total += (order.additional_charges || []).reduce(
//               (acc, charge) => acc + (charge.amount || 0),
//               0,
//             );

//             try {
//               // Insert the new order following createOrder.js logic
//               const newOrderResult = await dbClient.query(
//                 `
//                 INSERT INTO orders (
//                   serial_number,
//                   company_id, party_id, date, remark, sub_total, discount, cash_discount, tax,
//                   additional_charges, total, created_by, updated_by, is_black , created_at
//                 )
//                 VALUES (
//                   (SELECT COALESCE(MAX(serial_number), 0) + 1 FROM orders),
//                   $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
//                 )
//                 RETURNING *
//               `,
//                 [
//                   order.company_id,
//                   order.party_id,
//                   new Date(), // date
//                   `${order.remark} `
//                     + 'Auto-generated from incomplete order '
//                     + `(${order.order_serial})`,
//                   sub_total,
//                   order.discount || 0,
//                   order.cash_discount || 0,
//                   order.tax || 0,
//                   order.additional_charges || [],
//                   total,
//                   order.created_by,
//                   order.updated_by,
//                   order.is_black,
//                   order.created_at,
//                 ],
//               );

//               console.log(order);

//               const newOrder = newOrderResult.rows[0];

//               // Insert order items for the new order following createOrder.js logic
//               const orderItemValues = processedOrderItems
//                 .map(
//                   (item, index) => `($${index * 8 + 1}, $${index * 8 + 2}, $${
//                     index * 8 + 3
//                   }, $${index * 8 + 4}, $${index * 8 + 5}, $${
//                     index * 8 + 6
//                   }, $${index * 8 + 7}, $${index * 8 + 8})`,
//                 )
//                 .join(', ');

//               const orderItemParams = [];
//               processedOrderItems.forEach((item) => {
//                 orderItemParams.push(
//                   newOrder.id, // order_id
//                   item.product_id, // product_id
//                   item.quantity, // quantity
//                   item.price, // price
//                   item.discount || 0, // discount
//                   item.gst || 0, // gst
//                   item.total, // total
//                   item.remark || null, // remark
//                 );
//               });

//               await dbClient.query(
//                 `
//                 INSERT INTO order_items (order_id, product_id, quantity, price, discount, gst, total, remark)
//                 VALUES ${orderItemValues}
//               `,
//                 orderItemParams,
//               );

//               // Delete the missing products from the original order
//               const deleteOrderItemsQuery = `
//                 DELETE FROM order_items
//                 WHERE order_id = $1 AND product_id = ANY($2)
//               `;

//               await dbClient.query(deleteOrderItemsQuery, [
//                 order.order_id,
//                 missingProducts,
//               ]);

//               // Update quantities for items with quantity mismatches
//               for (const mismatch of quantityMismatches) {
//                 const transactionItem = transactionItems.find(
//                   (ti) => ti.product_id === mismatch.product_id,
//                 );
//                 if (transactionItem) {
//                   const productDiscountedPrice = mismatch.price - mismatch.price * (mismatch.discount / 100);
//                   const productSubTotal = productDiscountedPrice * transactionItem.quantity;
//                   const productTotal = productSubTotal + productSubTotal * (mismatch.gst / 100);
//                   await dbClient.query(
//                     'UPDATE order_items SET quantity = $1 , total=$2 WHERE order_id = $3 AND product_id = $4',
//                     [
//                       transactionItem.quantity,
//                       productTotal,
//                       order.order_id,
//                       mismatch.product_id,
//                     ],
//                   );
//                 }
//               }

//               console.log(`   ✅ New order created: ${newOrder.serial_number}`);

//               // Recalculate and update the old order's sub_total and total
//               const remainingOrderItemsResult = await dbClient.query(
//                 `
//                 SELECT
//                   product_id,
//                   quantity,
//                   price,
//                   discount,
//                   gst
//                 FROM order_items
//                 WHERE order_id = $1
//                 `,
//                 [order.order_id],
//               );
//               const remainingOrderItems = remainingOrderItemsResult.rows;
//               const recalculatedOrderItems = remainingOrderItems.map((item) => {
//                 const productDiscountedPrice = item.price - item.price * (item.discount / 100);
//                 const productSubTotal = productDiscountedPrice * item.quantity;
//                 const productTotal = productSubTotal + productSubTotal * (item.gst / 100);
//                 return { ...item, total: productTotal };
//               });
//               const new_sub_total = recalculatedOrderItems.reduce(
//                 (acc, item) => acc + item.total,
//                 0,
//               );
//               let new_total = new_sub_total - new_sub_total * ((order.discount || 0) / 100);
//               new_total -= order.cash_discount || 0;
//               new_total += ((order.tax || 0) * new_total) / 100;
//               new_total += (order.additional_charges || []).reduce(
//                 (acc, charge) => acc + (charge.amount || 0),
//                 0,
//               );

//               console.log(new_sub_total, new_total, order.serial_number);
//               // Update the old order with new totals based on remaining items
//               await dbClient.query(
//                 `
//                 UPDATE orders
//                 SET
//                 sub_total = $1, total = $2,
//                 status = COALESCE(CASE WHEN status = 'pending' THEN 'out_for_delivery' ELSE null END, status)
//                 WHERE id = $3
//                 `,
//                 [new_sub_total, new_total, order.order_id],
//               );
//               console.log(new_sub_total, new_total, order.serial_number);
//               console.log(
//                 `   ✅ Updated old order ${order.order_serial}: sub_total ${order.sub_total} → ${new_sub_total}, total ${order.total} → ${new_total}`,
//               );
//             } catch (error) {
//               console.log(`   ❌ Error creating new order: ${error}`);
//             }
//           }
//         }
//       }
//     }
//     await dbClient.query('COMMIT');

//     return {
//       mismatchedCount,
//       mismatchedOrderNumbers,
//       matchingOrderNumbers,
//       totalOrders: orders.length,
//     };
//   } catch (error) {
//     console.error('❌ Error:', error.message);
//     await dbClient.query('ROLLBACK');
//     console.error(error.stack);
//     return {
//       mismatchedCount: 0,
//       mismatchedOrderNumbers: [],
//       matchingOrderNumbers: [],
//       totalOrders: 0,
//     };
//   } finally {
//     await dbClient.end();
//   }
// }

// // findOrdersWithPendingStatusAndCreateNewOrders()
// //   .then((result) => {
// //     process.exit(0);
// //   })
// //   .catch((error) => {
// //     console.error("\n❌ Script failed:", error);
// //     process.exit(1);
// //   });
// // findOrdersWithPendingStatusAndCreateNewOrders();
// module.exports = {
//   findOrdersWithPendingStatusAndCreateNewOrders,
// };

/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable no-unused-vars */

const Database = require('@/service/database');

// Helper function to get remark statistics
async function getRemarkStats(dbClient) {
  const remarkCheckResult = await dbClient.query(`
    SELECT COUNT(*) as total_orders,
      COUNT(CASE WHEN remark IS NOT NULL AND remark != '' THEN 1 END) as orders_with_remarks
    FROM orders
    WHERE status in ('pending', 'completed')
  `);
  return remarkCheckResult.rows[0];
}

// Helper function to get all orders with pending or completed status
async function getAllOrders(dbClient) {
  const ordersResult = await dbClient.query(`
    SELECT
      o.id as order_id,
      o.serial_number as order_serial,
      o.status,
      o.transaction_id,
      o.is_black,
      o.party_id,
      o.company_id,
      o.discount,
      o.cash_discount,
      o.tax,
      o.additional_charges,
      o.remark
    FROM orders o
    WHERE o.status in ('pending', 'completed')
    ORDER BY o.serial_number DESC
  `);
  return ordersResult.rows;
}

// Helper function to get order items for a specific order
async function getOrderItems(dbClient, orderId) {
  const orderItemsResult = await dbClient.query(
    `
    SELECT
      oi.product_id,
      oi.quantity,
      oi.price,
      oi.total,
      oi.discount,
      oi.gst,
      oi.remark
    FROM order_items oi
    WHERE oi.order_id = $1
    ORDER BY oi.product_id
  `,
    [orderId],
  );
  return orderItemsResult.rows;
}

// Helper function to get transaction items for a specific transaction
async function getTransactionItems(dbClient, transactionId) {
  const transactionItemsResult = await dbClient.query(
    `
    SELECT
      ti.product_id,
      ti.quantity,
      ti.price,
      ti.total
    FROM transaction_items ti
    WHERE ti.transaction_id = $1
    ORDER BY ti.product_id
  `,
    [transactionId],
  );
  return transactionItemsResult.rows;
}

// Helper function to compare order items with transaction items
function compareOrderAndTransactionItems(orderItems, transactionItems) {
  const orderProductIds = orderItems
    .map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
    }))
    .sort();

  const transactionProductIds = transactionItems
    .map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
    }))
    .sort();

  const productsMatch = JSON.stringify(orderProductIds) === JSON.stringify(transactionProductIds);
  const lengthsMatch = orderItems.length === transactionItems.length;

  return { productsMatch, lengthsMatch };
}

// Helper function to find missing products and quantity mismatches
function findMissingAndMismatchedItems(orderItems, transactionItems) {
  const missingProducts = [];
  const quantityMismatches = [];

  for (const orderItem of orderItems) {
    const transactionItem = transactionItems.find(
      (ti) => ti.product_id === orderItem.product_id,
    );

    if (!transactionItem) {
      missingProducts.push(orderItem.product_id);
    } else if (orderItem.quantity !== transactionItem.quantity) {
      const remainingQuantity = orderItem.quantity - transactionItem.quantity;
      if (remainingQuantity > 0) {
        quantityMismatches.push({
          ...orderItem,
          quantity: remainingQuantity,
        });
      }
    }
  }

  return { missingProducts, quantityMismatches };
}

// Helper function to calculate item totals
function calculateItemTotals(items) {
  return items.map((item) => {
    const productDiscountedPrice = item.price - item.price * (item.discount / 100);
    const productSubTotal = productDiscountedPrice * item.quantity;
    const productTotal = productSubTotal + productSubTotal * (item.gst / 100);
    return { ...item, total: productTotal };
  });
}

// Helper function to calculate order totals
function calculateOrderTotals(processedOrderItems, order) {
  const sub_total = processedOrderItems.reduce((acc, item) => acc + item.total, 0);

  let total = sub_total - sub_total * ((order.discount || 0) / 100);
  total -= order.cash_discount || 0;
  total += ((order.tax || 0) * total) / 100;
  total += (order.additional_charges || []).reduce(
    (acc, charge) => acc + (charge.amount || 0),
    0,
  );

  return { sub_total, total };
}

// Helper function to create a new order
async function createNewOrder(dbClient, order, processedOrderItems, sub_total, total) {
  const newOrderResult = await dbClient.query(
    `
    INSERT INTO orders (
      serial_number,
      company_id, party_id, date, remark, sub_total, discount, cash_discount, tax,
      additional_charges, total, created_by, updated_by, is_black , created_at
    )
    VALUES (
      (SELECT COALESCE(MAX(serial_number), 0) + 1 FROM orders),
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
    )
    RETURNING *
  `,
    [
      order.company_id,
      order.party_id,
      new Date(),
      `${order.remark ? `${order.remark}` : ''}`,
      sub_total,
      order.discount || 0,
      order.cash_discount || 0,
      order.tax || 0,
      order.additional_charges || [],
      total,
      order.created_by,
      order.updated_by,
      order.is_black,
      order.created_at,
    ],
  );

  return newOrderResult.rows[0];
}

// Helper function to insert order items
async function insertOrderItems(dbClient, newOrder, processedOrderItems) {
  const orderItemValues = processedOrderItems
    .map(
      (item, index) => `($${index * 8 + 1}, $${index * 8 + 2}, $${
        index * 8 + 3
      }, $${index * 8 + 4}, $${index * 8 + 5}, $${
        index * 8 + 6
      }, $${index * 8 + 7}, $${index * 8 + 8})`,
    )
    .join(', ');

  const orderItemParams = [];
  processedOrderItems.forEach((item) => {
    orderItemParams.push(
      newOrder.id,
      item.product_id,
      item.quantity,
      item.price,
      item.discount || 0,
      item.gst || 0,
      item.total,
      item.remark || null,
    );
  });

  await dbClient.query(
    `
    INSERT INTO order_items (order_id, product_id, quantity, price, discount, gst, total, remark)
    VALUES ${orderItemValues}
  `,
    orderItemParams,
  );
}

// Helper function to update old order after creating new one
async function updateOldOrderAfterSplit(dbClient, order, missingProducts, quantityMismatches, transactionItems) {
  // Delete missing products from old order
  if (missingProducts.length > 0) {
    await dbClient.query(
      'DELETE FROM order_items WHERE order_id = $1 AND product_id = ANY($2)',
      [order.order_id, missingProducts],
    );
  }

  // Update quantities for items with quantity mismatches
  for (const mismatch of quantityMismatches) {
    const transactionItem = transactionItems.find(
      (ti) => ti.product_id === mismatch.product_id,
    );
    if (transactionItem) {
      const productDiscountedPrice = mismatch.price - mismatch.price * (mismatch.discount / 100);
      const productSubTotal = productDiscountedPrice * transactionItem.quantity;
      const productTotal = productSubTotal + productSubTotal * (mismatch.gst / 100);
      await dbClient.query(
        'UPDATE order_items SET quantity = $1 , total=$2 WHERE order_id = $3 AND product_id = $4',
        [transactionItem.quantity, productTotal, order.order_id, mismatch.product_id],
      );
    }
  }

  // Recalculate totals for remaining items
  const remainingOrderItems = await getOrderItems(dbClient, order.order_id);
  const recalculatedOrderItems = calculateItemTotals(remainingOrderItems);
  const { sub_total: new_sub_total, total: new_total } = calculateOrderTotals(recalculatedOrderItems, order);

  // Update the old order with new totals
  await dbClient.query(
    `
    UPDATE orders
    SET
    sub_total = $1, total = $2,
    status = COALESCE(CASE WHEN status = 'pending' THEN 'out_for_delivery' ELSE null END, status)
    WHERE id = $3
    `,
    [new_sub_total, new_total, order.order_id],
  );

  return { new_sub_total, new_total };
}

// Helper function to process a single order
async function processOrder(dbClient, order, mismatchedOrderNumbers, matchingOrderNumbers) {
  const orderItems = await getOrderItems(dbClient, order.order_id);

  if (!order.transaction_id) {
    await dbClient.query('UPDATE orders SET date = $1 WHERE id = $2', [new Date(), order.order_id]);
    return;
  }

  const transactionItems = await getTransactionItems(dbClient, order.transaction_id);
  const { productsMatch, lengthsMatch } = compareOrderAndTransactionItems(orderItems, transactionItems);

  if (productsMatch && lengthsMatch) {
    matchingOrderNumbers.push(order.order_serial);
  } else {
    mismatchedOrderNumbers.push(order.order_serial);
    const { missingProducts, quantityMismatches } = findMissingAndMismatchedItems(orderItems, transactionItems);

    if (missingProducts.length > 0 || quantityMismatches.length > 0) {
      const missingProductDetails = orderItems.filter((item) => missingProducts.includes(item.product_id));
      const allMissingItems = [...missingProductDetails, ...quantityMismatches];
      const processedOrderItems = calculateItemTotals(allMissingItems);
      const { sub_total, total } = calculateOrderTotals(processedOrderItems, order);

      try {
        const newOrder = await createNewOrder(dbClient, order, processedOrderItems, sub_total, total);
        await insertOrderItems(dbClient, newOrder, processedOrderItems);
        const { new_sub_total, new_total } = await updateOldOrderAfterSplit(dbClient, order, missingProducts, quantityMismatches, transactionItems);

        console.log(`   ✅ New order created: ${newOrder.serial_number}`);
        console.log(`   ✅ Updated old order ${order.order_serial}: sub_total ${order.sub_total} → ${new_sub_total}, total ${order.total} → ${new_total}`);
      } catch (error) {
        console.log(`   ❌ Error creating new order: ${error}`);
      }
    }
  }
}

async function findOrdersWithPendingStatusAndCreateNewOrders() {
  const dbClient = await Database.getConnection();

  try {
    await dbClient.query('BEGIN');

    const remarkStats = await getRemarkStats(dbClient);
    const orders = await getAllOrders(dbClient);
    let mismatchedCount = 0;
    const mismatchedOrderNumbers = [];
    const matchingOrderNumbers = [];

    if (orders.length === 0) {
      return {
        mismatchedCount: 0,
        mismatchedOrderNumbers: [],
        matchingOrderNumbers: [],
        totalOrders: 0,
      };
    }
    for (const order of orders) {
      await processOrder(dbClient, order, mismatchedOrderNumbers, matchingOrderNumbers);
      mismatchedCount = mismatchedOrderNumbers.length;
    }
    await dbClient.query('COMMIT');

    return {
      mismatchedCount,
      mismatchedOrderNumbers,
      matchingOrderNumbers,
      totalOrders: orders.length,
    };
  } catch (error) {
    console.error('❌ Error:', error.message);
    await dbClient.query('ROLLBACK');
    console.error(error.stack);
    return {
      mismatchedCount: 0,
      mismatchedOrderNumbers: [],
      matchingOrderNumbers: [],
      totalOrders: 0,
    };
  } finally {
    dbClient.release();
  }
}

findOrdersWithPendingStatusAndCreateNewOrders();

module.exports = findOrdersWithPendingStatusAndCreateNewOrders;
