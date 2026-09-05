/**
 * Indian numbering: groups of 2 after the last 3 digits (e.g. 4251000.12 → 42,51,000.12)
 * @param {number|string} value
 * @returns {string}
 */
function formatIndianAmount(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return '0.00';
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  const [intPart, decPart = '00'] = abs.toFixed(2).split('.');
  if (intPart.length <= 3) {
    return `${sign}${intPart}.${decPart}`;
  }
  let last = intPart.slice(-3);
  let rest = intPart.slice(0, -3);
  while (rest.length > 0) {
    const chunk = rest.slice(-2);
    rest = rest.slice(0, -2);
    last = `${chunk},${last}`;
  }
  return `${sign}${last}.${decPart}`;
}

function formatToINR(number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(number);
}

module.exports = {
  formatIndianAmount,
  formatToINR,
};

