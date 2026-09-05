/**
 * DealFlow360 — Blended Discount Risk Score & Approval Routing Engine
 */

const CUSTOMER_TIER_CEILINGS = {
  bronze: 5.0,
  silver: 10.0,
  gold: 15.0,
  platinum: 25.0,
};

const CATEGORY_DEFAULT_CEILINGS = {
  hardware: 15.0,
  service: 10.0,
  subscription: 20.0,
  other: 10.0,
};

/**
 * Calculates line-level margins, discount excesses, blended risk score, and required approval routing chain.
 * 
 * @param {Object} params
 * @param {string} params.customerTierCode - 'bronze' | 'silver' | 'gold' | 'platinum'
 * @param {Array} params.lineItems - Array of { productId, categoryType, categoryCeilingPct, unitPrice, costPrice, quantity, discountPct }
 * @param {number} [params.orderDiscountPct=0] - Additional order-level discount %
 * @returns {Object} Calculated metrics and routing decisions
 */
function calculateBlendedRiskScore({ customerTierCode = 'silver', lineItems = [], orderDiscountPct = 0 }) {
  const tierCeiling = CUSTOMER_TIER_CEILINGS[customerTierCode.toLowerCase()] ?? 10.0;

  let subtotal = 0;
  let totalDiscountAmount = 0;
  let totalCost = 0;
  let weightedExcessSum = 0;
  let hasLineViolation = false;

  const processedLines = lineItems.map((line) => {
    const qty = Number(line.quantity || 1);
    const unitPrice = Number(line.unitPrice || line.price || 0);
    const costPrice = Number(line.costPrice || line.cost || 0);
    const discountPct = Number(line.discountPct || 0);
    const categoryType = (line.categoryType || 'other').toLowerCase();

    const categoryCeiling = Number(line.categoryCeilingPct ?? CATEGORY_DEFAULT_CEILINGS[categoryType] ?? 10.0);

    const grossLineTotal = qty * unitPrice;
    const discountAmount = grossLineTotal * (discountPct / 100);
    const lineTotal = grossLineTotal - discountAmount;
    const totalLineCost = qty * costPrice;

    // Line Margin calculation
    const marginPct = lineTotal > 0 ? Number((((lineTotal - totalLineCost) / lineTotal) * 100).toFixed(2)) : 0;

    // Excess discount calculation over category & tier limits
    const catExcess = Math.max(0, discountPct - categoryCeiling);
    const tierExcess = Math.max(0, discountPct - tierCeiling);
    const lineExcess = Math.max(catExcess, tierExcess);

    if (lineExcess > 0) {
      hasLineViolation = true;
    }

    subtotal += grossLineTotal;
    totalDiscountAmount += discountAmount;
    totalCost += totalLineCost;

    return {
      ...line,
      quantity: qty,
      unitPrice,
      costPrice,
      discountPct,
      categoryCeilingPct: categoryCeiling,
      grossLineTotal,
      discountAmount,
      lineTotal,
      marginPct,
      lineExcess,
    };
  });

  const grandSubtotal = subtotal;
  const orderDiscountAmount = (grandSubtotal - totalDiscountAmount) * (orderDiscountPct / 100);
  const finalDiscountAmount = totalDiscountAmount + orderDiscountAmount;
  const finalTotalAmount = grandSubtotal - finalDiscountAmount;
  const overallMarginPct = finalTotalAmount > 0 ? Number((((finalTotalAmount - totalCost) / finalTotalAmount) * 100).toFixed(2)) : 0;

  // Weighted blended risk score calculation across all lines
  processedLines.forEach((line) => {
    const weight = grandSubtotal > 0 ? line.lineTotal / grandSubtotal : 0;
    weightedExcessSum += line.lineExcess * weight;
  });

  const orderTierExcess = Math.max(0, orderDiscountPct - tierCeiling);
  const blendedRiskScore = Number((weightedExcessSum * 10 + orderTierExcess * 5).toFixed(2));

  // Determine Approval Routing Steps
  let requiresApproval = false;
  let approvalLevels = [];
  let suggestedStatus = 'approved';

  if (blendedRiskScore > 15 || blendedRiskScore > 20 || (hasLineViolation && blendedRiskScore > 10)) {
    requiresApproval = true;
    approvalLevels = ['sales_manager', 'finance_ops'];
    suggestedStatus = 'pending_approval';
  } else if (blendedRiskScore > 0 || hasLineViolation || orderDiscountPct > 0) {
    requiresApproval = true;
    approvalLevels = ['sales_manager'];
    suggestedStatus = 'pending_approval';
  } else {
    requiresApproval = false;
    approvalLevels = [];
    suggestedStatus = 'approved';
  }

  return {
    customerTierCode,
    customerTierCeilingPct: tierCeiling,
    subtotal: grandSubtotal,
    totalDiscountAmount: finalDiscountAmount,
    totalAmount: finalTotalAmount,
    overallMarginPct,
    blendedRiskScore,
    requiresApproval,
    approvalLevels,
    suggestedStatus,
    processedLines,
  };
}

module.exports = {
  calculateBlendedRiskScore,
  CUSTOMER_TIER_CEILINGS,
  CATEGORY_DEFAULT_CEILINGS,
};
