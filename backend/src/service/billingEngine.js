/**
 * DealFlow360 — Hybrid Billing & Mid-Cycle Proration Engine
 */

/**
 * Generates hybrid billing schedule separating one-time hardware/services from recurring subscription lines.
 * 
 * @param {Object} quotation - Quotation object with quotation_lines
 * @returns {Object} One-time invoices and recurring billing schedules
 */
function generateHybridBillingSchedule(quotation) {
  const lines = quotation.lines || quotation.quotation_lines || [];
  const oneTimeLines = [];
  const recurringLines = [];
  let oneTimeSubtotal = 0;
  let recurringMonthlyTotal = 0;

  lines.forEach((line) => {
    const isRecurring = Boolean(line.is_recurring || line.isRecurring || line.subscription_plan_id);
    const lineTotal = Number(line.line_total || line.lineTotal || 0);

    if (isRecurring) {
      recurringLines.push(line);
      recurringMonthlyTotal += lineTotal;
    } else {
      oneTimeLines.push(line);
      oneTimeSubtotal += lineTotal;
    }
  });

  // Generate upcoming 12-month billing schedule for recurring items
  const billingSchedule = [];
  const startDate = new Date();

  recurringLines.forEach((recLine) => {
    const cycle = (recLine.billing_cycle || recLine.cycle || 'monthly').toLowerCase();
    const cycleMonths = cycle === 'yearly' ? 12 : cycle === 'quarterly' ? 3 : 1;

    for (let i = 0; i < 4; i++) {
      const cycleStart = new Date(startDate);
      cycleStart.setMonth(cycleStart.getMonth() + i * cycleMonths);
      const cycleEnd = new Date(cycleStart);
      cycleEnd.setMonth(cycleEnd.getMonth() + cycleMonths);
      cycleEnd.setDate(cycleEnd.getDate() - 1);

      billingSchedule.push({
        lineId: recLine.id,
        productName: recLine.product_name || recLine.productName || 'Subscription Line',
        billingCycle: cycle,
        cycleIndex: i + 1,
        cycleStartDate: cycleStart.toISOString().split('T')[0],
        cycleEndDate: cycleEnd.toISOString().split('T')[0],
        scheduledAmount: Number(recLine.line_total || 0),
        status: i === 0 ? 'due_now' : 'scheduled',
      });
    }
  });

  return {
    quotationId: quotation.id,
    quoteNumber: quotation.quote_number || quotation.quoteNumber,
    oneTimeSummary: {
      lineCount: oneTimeLines.length,
      amountDueNow: Number(oneTimeSubtotal.toFixed(2)),
      lines: oneTimeLines,
    },
    recurringSummary: {
      lineCount: recurringLines.length,
      recurringMonthlyAmount: Number(recurringMonthlyTotal.toFixed(2)),
      lines: recurringLines,
    },
    upcomingBillingSchedule: billingSchedule,
  };
}

/**
 * Calculates mid-cycle proration when quantity or subscription plan changes.
 * 
 * @param {Object} params
 * @param {number} params.originalMonthlyPrice
 * @param {number} params.newMonthlyPrice
 * @param {number} params.daysInCycle - e.g. 30
 * @param {number} params.daysRemaining - e.g. 18
 * @returns {Object} Prorated amount and adjustment summary
 */
function calculateMidCycleProration({ originalMonthlyPrice, newMonthlyPrice, daysInCycle = 30, daysRemaining = 15 }) {
  const dailyOriginalRate = originalMonthlyPrice / daysInCycle;
  const dailyNewRate = newMonthlyPrice / daysInCycle;

  const unusedOriginalValue = Number((dailyOriginalRate * daysRemaining).toFixed(2));
  const newPeriodCharge = Number((dailyNewRate * daysRemaining).toFixed(2));
  const netAdjustment = Number((newPeriodCharge - unusedOriginalValue).toFixed(2));

  return {
    originalMonthlyPrice,
    newMonthlyPrice,
    daysInCycle,
    daysRemaining,
    unusedOriginalCredit: unusedOriginalValue,
    newPeriodCharge,
    netProratedAdjustment: netAdjustment, // positive = customer owes balance, negative = credit note due
    requiresCreditNote: netAdjustment < 0,
    creditNoteAmount: netAdjustment < 0 ? Math.abs(netAdjustment) : 0,
    requiresAdditionalInvoice: netAdjustment > 0,
    additionalInvoiceAmount: netAdjustment > 0 ? netAdjustment : 0,
  };
}

/**
 * Generates Credit Note record upon subscription cancellation or partial refund.
 * 
 * @param {Object} params
 * @param {string} params.quotationLineId
 * @param {number} params.unearnedAmount
 * @param {string} params.reason - 'cancellation' | 'partial_refund' | 'downgrade'
 * @returns {Object} Credit note payload
 */
function triggerSubscriptionCreditNote({ quotationLineId, unearnedAmount, reason = 'cancellation', notes = '' }) {
  return {
    id: `cn_${Date.now()}`,
    quotationLineId,
    amount: Number(unearnedAmount.toFixed(2)),
    reason,
    notes: notes || `Automated credit note issued due to mid-cycle ${reason}.`,
    issuedAt: new Date().toISOString(),
  };
}

module.exports = {
  generateHybridBillingSchedule,
  calculateMidCycleProration,
  triggerSubscriptionCreditNote,
};
