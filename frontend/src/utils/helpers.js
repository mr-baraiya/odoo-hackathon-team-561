export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export const calculateMargin = (items = [], overallDiscountPercent = 0) => {
  if (!items || items.length === 0) return 0;

  let totalRevenue = 0;
  let totalCost = 0;

  items.forEach(item => {
    const listPrice = item.price * item.qty;
    const itemDiscount = item.discount || 0;
    const itemRev = listPrice * (1 - itemDiscount / 100);
    // estimated cost is 70% of list price by default if cost not given
    const itemCost = (item.cost || (item.price * 0.7)) * item.qty;

    totalRevenue += itemRev;
    totalCost += itemCost;
  });

  const finalRevenue = totalRevenue * (1 - overallDiscountPercent / 100);
  if (finalRevenue <= 0) return 0;

  const margin = ((finalRevenue - totalCost) / finalRevenue) * 100;
  return Math.round(margin * 10) / 10;
};
