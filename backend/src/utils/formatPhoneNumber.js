/**
 * Format phone number for SMS API (91XXXXXXXXXX format)
 */
exports.formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) throw new Error('Phone number is required');
  let formatted = phoneNumber.toString().replace(/[\s\-\(\)\+]/g, '');

  if (formatted.startsWith('0')) formatted = formatted.slice(1);
  if (!formatted.startsWith('91')) formatted = `91${formatted}`;
  return formatted;
};
