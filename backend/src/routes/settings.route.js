const express = require('express');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// System Settings State
let systemSettings = {
  company: {
    company_name: 'DealFlow360 Enterprises Ltd.',
    tax_id: 'GSTIN27AAACD4521E1Z5',
    address: '100 Innovation Tower, Tech Park, Suite 400, San Francisco, CA 94105',
    contact_email: 'support@dealflow360.com',
    contact_phone: '+1 (800) 555-0199',
    website: 'https://dealflow360.com',
    currency_code: 'USD',
  },
  tax: {
    tax_name: 'GST / Sales Tax',
    default_tax_rate: 18.0,
    calculation_method: 'exclusive', // 'exclusive' or 'inclusive'
    enable_tier_exemptions: true,
    tax_number_format: 'XX-XXXXXXX',
  },
  currency: {
    base_currency: 'USD',
    currency_symbol: '$',
    decimal_places: 2,
    enable_multi_currency: true,
    auto_sync_rates: true,
    supported_currencies: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'],
  },
  security: {
    session_timeout_minutes: 30,
    password_min_length: 12,
    require_2fa: true,
    password_expiry_days: 90,
    max_login_attempts: 5,
    ip_whitelisting_enabled: false,
    allowed_ips: '192.168.1.1, 10.0.0.1',
  },
};

// --- GET SYSTEM SETTINGS ---
router.get('/', authenticateJWT, (req, res) => {
  res.json(systemSettings);
});

// --- UPDATE SYSTEM SETTINGS ---
const updateSettings = (req, res) => {
  const { company, tax, currency, security } = req.body || {};
  if (company) systemSettings.company = { ...systemSettings.company, ...company };
  if (tax) systemSettings.tax = { ...systemSettings.tax, ...tax };
  if (currency) systemSettings.currency = { ...systemSettings.currency, ...currency };
  if (security) systemSettings.security = { ...systemSettings.security, ...security };

  res.json({ message: 'System settings updated successfully.', settings: systemSettings });
};

router.put('/', authenticateJWT, authorizeRoles('admin'), updateSettings);
router.post('/', authenticateJWT, authorizeRoles('admin'), updateSettings);

module.exports = router;
