import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Building2,
  Receipt,
  Coins,
  Save,
  RotateCcw,
  RefreshCw,
  CheckCircle2,
  Lock,
  Globe,
  Mail,
  Phone,
  MapPin,
  Percent,
  DollarSign,
  Clock,
  Shield,
  Key,
} from 'lucide-react';
import apiClient from '../../../services/apiClient';

export default function SystemSettingsTab() {
  const [activeTab, setActiveTab] = useState('company'); // 'company', 'tax', 'currency', 'security'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [form, setForm] = useState({
    company: {
      company_name: 'DealFlow360 Enterprises Ltd.',
      tax_id: 'GSTIN27AAACD4521E1Z5',
      address: '100 Innovation Tower, Tech Park, Suite 400, San Francisco, CA 94105',
      contact_email: 'support@dealflow360.com',
      contact_phone: '+1 (800) 555-0199',
      website: 'https://dealflow360.com',
    },
    tax: {
      tax_name: 'GST / Sales Tax',
      default_tax_rate: 18.0,
      calculation_method: 'exclusive',
      enable_tier_exemptions: true,
      tax_number_format: 'XX-XXXXXXX',
    },
    currency: {
      base_currency: 'USD',
      currency_symbol: '$',
      decimal_places: 2,
      enable_multi_currency: true,
      auto_sync_rates: true,
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
  });

  // Fetch settings from API
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/settings');
      if (res && typeof res === 'object') {
        setForm((prev) => ({
          company: { ...prev.company, ...(res.company || {}) },
          tax: { ...prev.tax, ...(res.tax || {}) },
          currency: { ...prev.currency, ...(res.currency || {}) },
          security: { ...prev.security, ...(res.security || {}) },
        }));
      }
    } catch (err) {
      console.warn('Failed to load settings from API:', err.message);
    } finally {
      setTimeout(() => setLoading(false), 200);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save Settings
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post('/settings', form);
      toast.success('System settings saved successfully!');
    } catch (err) {
      toast.error('Failed to save system settings.');
    } finally {
      setSaving(false);
    }
  };

  // Helper change handler
  const handleNestedChange = (section, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl font-bold tracking-tight">System Settings & Platform Configuration</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Configure core corporate identity, multi-currency engines, tax rules, invoice parameters, and security policies.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchSettings}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reset</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {/* NAVIGATION SUB-TABS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
          <button
            onClick={() => setActiveTab('company')}
            className={`px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              activeTab === 'company'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Company Information</span>
          </button>

          <button
            onClick={() => setActiveTab('tax')}
            className={`px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              activeTab === 'tax'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Tax Configuration</span>
          </button>

          <button
            onClick={() => setActiveTab('currency')}
            className={`px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              activeTab === 'currency'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Currency Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              activeTab === 'security'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Security Settings</span>
          </button>
        </div>
      </div>

      {/* FORM SECTION CONTENT */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Loading system settings...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* TAB 1: COMPANY INFORMATION */}
          {activeTab === 'company' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <span>Company Identity & Legal Details</span>
                </h2>
                <p className="text-xs text-slate-500">Corporate information displayed on quotations, invoices, and customer communications.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company Legal Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.company.company_name}
                      onChange={(e) => handleNestedChange('company', 'company_name', e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50"
                      placeholder="e.g. DealFlow360 Enterprises Inc."
                      required
                    />
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tax Registration ID / GSTIN</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.company.tax_id}
                      onChange={(e) => handleNestedChange('company', 'tax_id', e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50 font-mono"
                      placeholder="e.g. GSTIN27AAACD4521E1Z5"
                    />
                    <Receipt className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Primary Support Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={form.company.contact_email}
                      onChange={(e) => handleNestedChange('company', 'contact_email', e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50"
                      placeholder="support@company.com"
                      required
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Telephone</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.company.contact_phone}
                      onChange={(e) => handleNestedChange('company', 'contact_phone', e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50"
                      placeholder="+1 (800) 555-0199"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Website URL</label>
                  <div className="relative">
                    <input
                      type="url"
                      value={form.company.website}
                      onChange={(e) => handleNestedChange('company', 'website', e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50"
                      placeholder="https://company.com"
                    />
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Physical Business Address</label>
                  <div className="relative">
                    <textarea
                      rows={3}
                      value={form.company.address}
                      onChange={(e) => handleNestedChange('company', 'address', e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50"
                      placeholder="Enter full registered address..."
                    />
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TAX CONFIGURATION */}
          {activeTab === 'tax' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Receipt className="w-5 h-5 text-indigo-600" />
                  <span>Tax System & Calculation Rules</span>
                </h2>
                <p className="text-xs text-slate-500">Define global default tax rates, tax calculation method, and customer tier exemption rules.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tax Label / Name</label>
                  <input
                    type="text"
                    value={form.tax.tax_name}
                    onChange={(e) => handleNestedChange('tax', 'tax_name', e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50"
                    placeholder="e.g. GST, VAT, Sales Tax"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Default Tax Rate (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={form.tax.default_tax_rate}
                      onChange={(e) => handleNestedChange('tax', 'default_tax_rate', parseFloat(e.target.value) || 0)}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50"
                      required
                    />
                    <Percent className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tax Calculation Method</label>
                  <select
                    value={form.tax.calculation_method}
                    onChange={(e) => handleNestedChange('tax', 'calculation_method', e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50"
                  >
                    <option value="exclusive">Exclusive (Add Tax on top of quotation total)</option>
                    <option value="inclusive">Inclusive (Prices include applicable tax)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tax Invoice Format Mask</label>
                  <input
                    type="text"
                    value={form.tax.tax_number_format}
                    onChange={(e) => handleNestedChange('tax', 'tax_number_format', e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50"
                    placeholder="XX-XXXXXXX"
                  />
                </div>

                <div className="md:col-span-2 pt-2 border-t border-slate-100">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.tax.enable_tier_exemptions}
                      onChange={(e) => handleNestedChange('tax', 'enable_tier_exemptions', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800">Enable Customer Tier Tax Exemptions</span>
                      <p className="text-[11px] text-slate-500">Allow specific customer tiers (e.g. Platinum Enterprise) to qualify for tax exemptions.</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CURRENCY SETTINGS */}
          {activeTab === 'currency' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Coins className="w-5 h-5 text-indigo-600" />
                  <span>Currency & Multi-currency Engines</span>
                </h2>
                <p className="text-xs text-slate-500">Configure base reporting currency, display symbols, decimal precision, and exchange rate sync.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Base Currency Code</label>
                  <select
                    value={form.currency.base_currency}
                    onChange={(e) => handleNestedChange('currency', 'base_currency', e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50"
                  >
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="CAD">CAD (C$) - Canadian Dollar</option>
                    <option value="AUD">AUD (A$) - Australian Dollar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Currency Display Symbol</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.currency.currency_symbol}
                      onChange={(e) => handleNestedChange('currency', 'currency_symbol', e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50 font-mono"
                      required
                    />
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price Decimal Places</label>
                  <select
                    value={form.currency.decimal_places}
                    onChange={(e) => handleNestedChange('currency', 'decimal_places', parseInt(e.target.value))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50"
                  >
                    <option value={0}>0 (e.g. $1,250)</option>
                    <option value={2}>2 (e.g. $1,250.00)</option>
                    <option value={3}>3 (e.g. $1,250.000)</option>
                    <option value={4}>4 (e.g. $1,250.0000)</option>
                  </select>
                </div>

                <div className="space-y-4 pt-2 border-t border-slate-100 md:col-span-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.currency.enable_multi_currency}
                      onChange={(e) => handleNestedChange('currency', 'enable_multi_currency', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800">Enable Multi-Currency Quotations</span>
                      <p className="text-[11px] text-slate-500">Allow sales reps to issue quotations in customer local currencies.</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.currency.auto_sync_rates}
                      onChange={(e) => handleNestedChange('currency', 'auto_sync_rates', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800">Automatic Daily Exchange Rate Sync</span>
                      <p className="text-[11px] text-slate-500">Fetch real-time central bank exchange rates daily for revenue reporting.</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY SETTINGS */}
          {activeTab === 'security' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-indigo-600" />
                  <span>Security Policies & Authentication Rules</span>
                </h2>
                <p className="text-xs text-slate-500">Configure password policies, session timeouts, mandatory 2FA, and IP whitelisting rules.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">User Session Timeout (Minutes)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="5"
                      max="1440"
                      value={form.security.session_timeout_minutes}
                      onChange={(e) => handleNestedChange('security', 'session_timeout_minutes', parseInt(e.target.value) || 30)}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50"
                      required
                    />
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Minimum Password Length</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="8"
                      max="32"
                      value={form.security.password_min_length}
                      onChange={(e) => handleNestedChange('security', 'password_min_length', parseInt(e.target.value) || 8)}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50"
                      required
                    />
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password Expiry Cycle (Days)</label>
                  <input
                    type="number"
                    min="0"
                    max="365"
                    value={form.security.password_expiry_days}
                    onChange={(e) => handleNestedChange('security', 'password_expiry_days', parseInt(e.target.value) || 90)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Set to 0 to disable password expiration.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Failed Login Attempts</label>
                  <input
                    type="number"
                    min="3"
                    max="10"
                    value={form.security.max_login_attempts}
                    onChange={(e) => handleNestedChange('security', 'max_login_attempts', parseInt(e.target.value) || 5)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50"
                  />
                </div>

                <div className="md:col-span-2 pt-2 border-t border-slate-100 space-y-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.security.require_2fa}
                      onChange={(e) => handleNestedChange('security', 'require_2fa', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800">Require Two-Factor Authentication (2FA)</span>
                      <p className="text-[11px] text-slate-500">Enforce mandatory TOTP 2FA for all Admin, Sales Manager, and Finance roles.</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.security.ip_whitelisting_enabled}
                      onChange={(e) => handleNestedChange('security', 'ip_whitelisting_enabled', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800">Enable IP Address Whitelisting</span>
                      <p className="text-[11px] text-slate-500">Restrict administrative login access to specified corporate IP addresses.</p>
                    </div>
                  </label>

                  {form.security.ip_whitelisting_enabled && (
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Allowed IP Addresses (Comma-separated)</label>
                      <input
                        type="text"
                        value={form.security.allowed_ips}
                        onChange={(e) => handleNestedChange('security', 'allowed_ips', e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50"
                        placeholder="192.168.1.1, 10.0.0.1"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SAVE BUTTON BAR */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={fetchSettings}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
            >
              Cancel / Reset
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
