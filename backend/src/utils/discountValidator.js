/**
 * DealFlow360 — Strict Governance Discount Boundary Validator
 *
 * Rules:
 *  - 0.00%  to 5.00%  -> No additional approval required. Sales Rep authorized to submit directly. (Status: sent_to_customer)
 *  - 5.01%  to 25.00% -> Requires Sales Manager approval. (Status: pending_approval)
 *  - 25.01% to 50.00% -> Requires Sales Manager + Finance Operations approval. (Status: pending_approval)
 *  - 50.01%+          -> Prohibited by company policy. (Blocked with 400 error)
 */

function validateDiscountBoundary(discountPct) {
  const pct = Math.round(Number(discountPct || 0) * 100) / 100;

  if (isNaN(pct) || pct < 0) {
    return {
      allowed: false,
      status: 400,
      message: 'Discount percentage must be a non-negative number.',
    };
  }

  if (pct > 50.0) {
    return {
      allowed: false,
      status: 400,
      discountPct: pct,
      message: `Discount of ${pct}% exceeds maximum allowable limit of 50.00%. Quotation cannot be submitted.`,
    };
  }

  if (pct <= 5.0) {
    return {
      allowed: true,
      requiresApproval: false,
      discountPct: pct,
      requiredLevels: [],
      targetStatus: 'sent_to_customer',
      wording: 'No additional approval required. Sales Rep authorized to submit directly.',
    };
  }

  if (pct > 5.0 && pct <= 25.0) {
    return {
      allowed: true,
      requiresApproval: true,
      discountPct: pct,
      requiredLevels: ['sales_manager'],
      targetStatus: 'pending_approval',
      wording: 'Requires Sales Manager approval.',
    };
  }

  if (pct > 25.0 && pct <= 50.0) {
    return {
      allowed: true,
      requiresApproval: true,
      discountPct: pct,
      requiredLevels: ['sales_manager', 'finance_ops'],
      targetStatus: 'pending_approval',
      wording: 'Requires Sales Manager + Finance Operations approval.',
    };
  }
}

module.exports = {
  validateDiscountBoundary,
};
