/**
 * DealFlow360 — Live Upsell / Cross-Sell & Margin Impact Engine
 */

/**
 * Evaluates current quote items against upsell rules and active promotions to generate ranked recommendations.
 * 
 * @param {Array} currentCartLines - [{ productId, quantity, unitPrice, costPrice, discountPct }]
 * @param {Array} availableProducts - Catalog of products
 * @param {Array} upsellRules - [{ baseProductId, suggestedProductId, coPurchaseScore, minMarginPctRequired }]
 * @returns {Array} Ranked list of recommended upsell/cross-sell suggestions with live margin impact previews
 */
function getUpsellSuggestions({ currentCartLines = [], availableProducts = [], upsellRules = [] }) {
  const currentProductIds = new Set(currentCartLines.map((l) => l.productId));

  // Compute current cart totals and current overall margin
  let currentSubtotal = 0;
  let currentCost = 0;

  currentCartLines.forEach((line) => {
    const qty = Number(line.quantity || 1);
    const price = Number(line.unitPrice || line.price || 0);
    const cost = Number(line.costPrice || line.cost || 0);
    const disc = Number(line.discountPct || 0);

    const lineTotal = qty * price * (1 - disc / 100);
    const lineCost = qty * cost;

    currentSubtotal += lineTotal;
    currentCost += lineCost;
  });

  const currentMarginPct = currentSubtotal > 0 ? ((currentSubtotal - currentCost) / currentSubtotal) * 100 : 0;

  // Filter candidate recommendations based on cart co-purchases & active promotions
  const suggestionsMap = new Map();

  // 1. Rules-based suggestions
  upsellRules.forEach((rule) => {
    if (currentProductIds.has(rule.baseProductId) && !currentProductIds.has(rule.suggestedProductId)) {
      const targetProd = availableProducts.find((p) => p.id === rule.suggestedProductId);
      if (targetProd && targetProd.is_active !== false) {
        const prodCost = Number(targetProd.cost_price || targetProd.costPrice || 0);
        const prodPrice = Number(targetProd.base_price || targetProd.price || 0);
        const standaloneMargin = prodPrice > 0 ? ((prodPrice - prodCost) / prodPrice) * 100 : 0;

        if (standaloneMargin >= Number(rule.minMarginPctRequired || 0)) {
          suggestionsMap.set(targetProd.id, {
            product: targetProd,
            coPurchaseScore: Number(rule.coPurchaseScore || 1.0),
            isPromoted: Boolean(targetProd.is_promoted || targetProd.isPromoted),
            reason: 'Frequently bought together',
          });
        }
      }
    }
  });

  // 2. Promoted products fallback
  availableProducts.forEach((prod) => {
    if ((prod.is_promoted || prod.isPromoted) && !currentProductIds.has(prod.id) && !suggestionsMap.has(prod.id)) {
      suggestionsMap.set(prod.id, {
        product: prod,
        coPurchaseScore: 0.5,
        isPromoted: true,
        reason: 'Active Promotion',
      });
    }
  });

  // Calculate live margin delta if suggestion is added to quote
  const rankedSuggestions = Array.from(suggestionsMap.values()).map(({ product, coPurchaseScore, isPromoted, reason }) => {
    const prodCost = Number(product.cost_price || product.costPrice || 0);
    const prodPrice = Number(product.base_price || product.price || 0);

    const newSubtotal = currentSubtotal + prodPrice;
    const newCost = currentCost + prodCost;
    const newMarginPct = newSubtotal > 0 ? ((newSubtotal - newCost) / newSubtotal) * 100 : 0;

    const marginDeltaPct = Number((newMarginPct - currentMarginPct).toFixed(2));
    const isMarginPositive = marginDeltaPct >= 0;

    // Score rank priority
    const rankScore = (isPromoted ? 2.0 : 1.0) * coPurchaseScore * (isMarginPositive ? 1.2 : 0.8);

    return {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      categoryName: product.category_name || product.categoryName || 'Hardware',
      price: prodPrice,
      cost: prodCost,
      standaloneMarginPct: Number((((prodPrice - prodCost) / (prodPrice || 1)) * 100).toFixed(2)),
      marginDeltaPct,
      isMarginPositive,
      isPromoted,
      reason,
      rankScore: Number(rankScore.toFixed(3)),
    };
  });

  // Sort descending by rank score
  rankedSuggestions.sort((a, b) => b.rankScore - a.rankScore);

  return {
    currentMarginPct: Number(currentMarginPct.toFixed(2)),
    suggestions: rankedSuggestions.slice(0, 5), // Top 5 relevant suggestions
  };
}

module.exports = {
  getUpsellSuggestions,
};
