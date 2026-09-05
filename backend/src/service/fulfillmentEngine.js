/**
 * DealFlow360 — Multi-Warehouse Fulfillment & Backorder Consolidation Engine
 */

/**
 * Calculates optimal warehouse stock allocation for quotation lines.
 * 
 * @param {Array} lineItems - [{ lineId, productId, productName, quantityNeeded }]
 * @param {Array} warehouses - [{ id, name, shippingCostWeight, stockMap: { productId: qtyOnHand } }]
 * @param {Object} [overrideSplits] - Optional manual override splits: { lineId: [{ warehouseId, quantity }] }
 * @returns {Object} Calculated fulfillment plan, backorders, and total shipping cost estimate
 */
function calculateFulfillmentSplits(lineItems = [], warehouses = [], overrideSplits = null) {
  let isManualOverride = Boolean(overrideSplits && Object.keys(overrideSplits).length > 0);
  const splits = [];
  const backorders = [];
  let totalEstimatedShipmentCost = 0;
  let totalShipmentCount = 0;

  // Sort warehouses by shipping weight (cost efficiency priority)
  const sortedWarehouses = [...warehouses].sort((a, b) => (a.shippingCostWeight || 1) - (b.shippingCostWeight || 1));

  lineItems.forEach((line) => {
    const lineId = line.lineId || line.id;
    const productId = line.productId;
    const qtyNeeded = Number(line.quantity || 1);

    if (isManualOverride && overrideSplits[lineId]) {
      let fulfilledCount = 0;
      overrideSplits[lineId].forEach((userSplit) => {
        const wh = warehouses.find((w) => w.id === userSplit.warehouseId) || { name: 'Custom Depot', shippingCostWeight: 1 };
        const qtyToFulfill = Math.min(qtyNeeded - fulfilledCount, Number(userSplit.quantity || 0));
        if (qtyToFulfill > 0) {
          fulfilledCount += qtyToFulfill;
          const cost = Number((qtyToFulfill * 15 * (wh.shippingCostWeight || 1.0)).toFixed(2));
          totalEstimatedShipmentCost += cost;
          totalShipmentCount += 1;

          splits.push({
            quotationLineId: lineId,
            productId,
            productName: line.productName || 'Product',
            warehouseId: userSplit.warehouseId,
            warehouseName: wh.name,
            quantityFulfilled: qtyToFulfill,
            quantityBackordered: 0,
            estimatedShipmentCost: cost,
          });
        }
      });

      const remainingBackorder = qtyNeeded - fulfilledCount;
      if (remainingBackorder > 0) {
        backorders.push({
          quotationLineId: lineId,
          productId,
          productName: line.productName || 'Product',
          quantityBackordered: remainingBackorder,
          reason: 'Manual split incomplete stock',
        });
      }
    } else {
      // Auto Greedy Splitting algorithm across sorted warehouses
      let remainingQty = qtyNeeded;

      for (const wh of sortedWarehouses) {
        if (remainingQty <= 0) break;

        const stockAvailable = wh.stockMap?.[productId] ?? wh.quantityOnHand ?? 0;
        if (stockAvailable > 0) {
          const qtyToTake = Math.min(remainingQty, stockAvailable);
          remainingQty -= qtyToTake;

          const cost = Number((qtyToTake * 12.5 * (wh.shippingCostWeight || 1.0)).toFixed(2));
          totalEstimatedShipmentCost += cost;
          totalShipmentCount += 1;

          splits.push({
            quotationLineId: lineId,
            productId,
            productName: line.productName || 'Product',
            warehouseId: wh.id,
            warehouseName: wh.name,
            quantityFulfilled: qtyToTake,
            quantityBackordered: 0,
            estimatedShipmentCost: cost,
          });
        }
      }

      if (remainingQty > 0) {
        backorders.push({
          quotationLineId: lineId,
          productId,
          productName: line.productName || 'Product',
          quantityBackordered: remainingQty,
          reason: 'Insufficient stock across warehouses',
        });
      }
    }
  });

  const overallStatus = backorders.length > 0
    ? (splits.length > 0 ? 'partially_fulfilled' : 'backordered')
    : 'fulfilled';

  return {
    status: overallStatus,
    isManualOverride,
    totalShipmentCount,
    totalEstimatedShipmentCost: Number(totalEstimatedShipmentCost.toFixed(2)),
    fulfillmentSplits: splits,
    backorders,
    hasBackorders: backorders.length > 0,
    consolidationPrompt: backorders.length > 0 ? 'New stock detected! Consolidate remaining backorders into nearest primary warehouse.' : null,
  };
}

module.exports = {
  calculateFulfillmentSplits,
};
