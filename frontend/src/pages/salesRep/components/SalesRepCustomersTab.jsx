import React, { useState } from 'react';
import apiClient from '../../../services/apiClient';
import toast from 'react-hot-toast';
import {
  Users,
  Search,
  Phone,
  Mail,
  MessageSquare,
  Award,
  Send,
  X,
  History,
  FileText,
  CreditCard,
  ShieldAlert,
  Download,
  Sparkles,
} from 'lucide-react';
import { exportInvoicePDF } from '../../../utils/invoicePdfGenerator';
import {
  generateEmailMagicLinkTemplate,
  generateWhatsAppMagicLinkTemplate,
} from '../../../utils/communicationTemplates';

export default function SalesRepCustomersTab({ customers = [], onRefresh }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [whatsappCustomer, setWhatsappCustomer] = useState(null);
  const [whatsappMsg, setWhatsappMsg] = useState('');
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

  const [emailCustomer, setEmailCustomer] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // History modal state
  const [historyCustomer, setHistoryCustomer] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Create Customer Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newTier, setNewTier] = useState('gold');
  const [isCreating, setIsCreating] = useState(false);

  const filteredCustomers = customers.filter(
    (c) =>
      c.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.primary_contact_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenHistory = async (cust) => {
    setHistoryCustomer(cust);
    setLoadingHistory(true);
    try {
      const res = await apiClient.get(`/sales-rep/customers/${cust.id}/history`);
      setHistoryData(res?.data || res);
    } catch (err) {
      console.error('Failed to load customer history:', err);
      toast.error('Failed to load customer history.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newCompany.trim()) {
      toast.error('Company name is required');
      return;
    }

    setIsCreating(true);
    try {
      const payload = {
        company_name: newCompany,
        primary_contact_name: newContactName || 'Primary Contact',
        primary_contact_email: newEmail || 'contact@company.com',
        primary_contact_phone: newPhone || '+919876543210',
        tier_code: newTier,
      };

      const res = await apiClient.post('/customers', payload);
      const created = res?.data || res;

      toast.success(`Customer "${created.company_name || newCompany}" created in DB!`);
      setShowCreateModal(false);
      setNewCompany('');
      setNewContactName('');
      setNewEmail('');
      setNewPhone('');

      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error('Failed to create customer:', err);
      toast.error('Failed to create customer account.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSendWhatsApp = async (e) => {
    if (e) e.preventDefault();
    if (!whatsappCustomer) return;

    if (!whatsappMsg.trim()) {
      toast.error('Please enter a WhatsApp message before sending.');
      return;
    }

    try {
      setIsSendingWhatsApp(true);
      const payload = {
        to: whatsappCustomer.primary_contact_phone || '+919876543210',
        message: whatsappMsg,
        customer_id: whatsappCustomer.id,
      };

      console.log(
        '%c[WHATSAPP-DIRECT-SEND] Dispatching WhatsApp payload:',
        'background: #059669; color: white; font-weight: bold; padding: 3px 6px; border-radius: 4px;',
        payload
      );

      const res = await apiClient.post('/whatsapp/send', payload).catch(async (err) => {
        console.warn('%c[WHATSAPP-WARN] Primary route failed, fallback:', 'color: orange; font-weight: bold;', err.message);
        return await apiClient.post('/sales-rep/send-whatsapp-to-rep', {
          message: `[To: ${whatsappCustomer.company_name}] ${whatsappMsg}`,
        });
      });

      console.log(
        '%c[WHATSAPP-SUCCESS] WhatsApp dispatched successfully:',
        'background: #10b981; color: white; font-weight: bold; padding: 3px 6px; border-radius: 4px;',
        res
      );
      toast.success(res?.message || res?.data?.message || `WhatsApp message dispatched to ${whatsappCustomer.company_name}!`);

      await apiClient.post('/audit', {
        entity_type: 'whatsapp',
        entity_id: String(whatsappCustomer.id),
        action: 'WHATSAPP_DISPATCHED',
        reason: `Dispatched WhatsApp message to ${whatsappCustomer.company_name}`,
      }).catch(() => {});

      setWhatsappCustomer(null);
      setWhatsappMsg('');
    } catch (err) {
      console.error('%c[WHATSAPP-ERROR] Exception in handleSendWhatsApp:', 'background: #ef4444; color: white; font-weight: bold;', err);
      toast.error('Failed to dispatch WhatsApp message.');
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const handleSendEmail = async (e) => {
    if (e) e.preventDefault();
    if (!emailCustomer) return;

    if (!emailBody.trim()) {
      toast.error('Please enter email body content before sending.');
      return;
    }

    try {
      setIsSendingEmail(true);
      const payload = {
        to: emailCustomer.primary_contact_email,
        subject: emailSubject || `DealFlow360 Quotation & Order Proposal Update — ${emailCustomer.company_name}`,
        body: emailBody,
        customer_id: emailCustomer.id,
      };

      console.log(
        '%c[EMAIL-DIRECT-SEND] Dispatching Email payload:',
        'background: #4f46e5; color: white; font-weight: bold; padding: 3px 6px; border-radius: 4px;',
        payload
      );

      const res = await apiClient.post('/email/send', payload).catch(async (err) => {
        console.warn('%c[EMAIL-WARN] Primary route failed, fallback:', 'color: orange; font-weight: bold;', err.message);
        return await apiClient.post('/sales-rep/send-email', {
          to: emailCustomer.primary_contact_email,
          subject: emailSubject,
          text: emailBody,
        });
      });

      console.log(
        '%c[EMAIL-SUCCESS] Email dispatched successfully:',
        'background: #6366f1; color: white; font-weight: bold; padding: 3px 6px; border-radius: 4px;',
        res
      );
      toast.success(res?.message || res?.data?.message || `Email dispatched to ${emailCustomer.primary_contact_email}!`);

      await apiClient.post('/audit', {
        entity_type: 'email',
        entity_id: String(emailCustomer.id),
        action: 'EMAIL_DISPATCHED',
        reason: `Dispatched Email to ${emailCustomer.primary_contact_email}`,
      }).catch(() => {});

      setEmailCustomer(null);
      setEmailSubject('');
      setEmailBody('');
    } catch (err) {
      console.error('%c[EMAIL-ERROR] Exception in handleSendEmail:', 'background: #ef4444; color: white; font-weight: bold;', err);
      toast.error('Failed to dispatch Email.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleAttachMagicLink = async (targetType) => {
    const cust = targetType === 'whatsapp' ? whatsappCustomer : emailCustomer;
    if (!cust) return;

    try {
      const emailToUse = cust.primary_contact_email || 'mayankpathar49@gmail.com';
      console.log(`%c[MAGIC-LINK] Generating magic link for ${cust.company_name} (${emailToUse})...`, 'background: #8b5cf6; color: white; font-weight: bold; padding: 2px 6px;');
      const res = await apiClient.post('/auth/magic-link', { email: emailToUse, skipNotify: true });
      const magicUrl = res?.magicUrl || res?.data?.magicUrl || `http://localhost:5173/m/${res?.shortCode || res?.data?.shortCode || 'token'}`;

      if (targetType === 'whatsapp') {
        const { message } = generateWhatsAppMagicLinkTemplate({
          companyName: cust.company_name,
          contactName: cust.primary_contact_name,
          magicUrl,
        });
        setWhatsappMsg(message);
      } else {
        const { subject, body } = generateEmailMagicLinkTemplate({
          companyName: cust.company_name,
          contactName: cust.primary_contact_name,
          contactEmail: cust.primary_contact_email,
          magicUrl,
        });
        setEmailSubject(subject);
        setEmailBody(body);
      }

      toast.success(`Magic login link generated & template loaded for ${cust.company_name}!`);
    } catch (err) {
      console.error('[MAGIC-LINK] Failed to generate magic link:', err);
      toast.error('Could not generate magic link for customer.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Action Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assigned customer accounts, tiers or contact names..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
          />
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <Users className="w-4 h-4" />
          <span>+ Create Customer Account</span>
        </button>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => (
          <div
            key={cust.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{cust.company_name}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{cust.primary_contact_name}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                  {cust.tier_label || 'Gold'} Tier
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{cust.primary_contact_email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{cust.primary_contact_phone || '+919876543210'}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-3">
                <span className="text-slate-500">Tier Discount Ceiling:</span>
                <span className="font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  Max {cust.discount_ceiling_pct || 15}% Off
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-col space-y-2">
              <button
                onClick={() => handleOpenHistory(cust)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <History className="w-3.5 h-3.5" />
                <span>View Quotation & Order History</span>
              </button>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    console.log(
                      '%c[WHATSAPP-POPUP-OPEN] Clicked WhatsApp button for:',
                      'background: #059669; color: white; font-weight: bold; padding: 3px 6px; border-radius: 4px;',
                      cust.company_name,
                      cust
                    );
                    setWhatsappCustomer(cust);
                    setWhatsappMsg(
                      `Hello ${cust.primary_contact_name || 'Customer'}, here is the latest quotation and order update for ${cust.company_name}. Please let us know if you need any assistance!`
                    );
                  }}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={() => {
                    console.log(
                      '%c[EMAIL-POPUP-OPEN] Clicked Email button for:',
                      'background: #4f46e5; color: white; font-weight: bold; padding: 3px 6px; border-radius: 4px;',
                      cust.company_name,
                      cust
                    );
                    setEmailCustomer(cust);
                    setEmailSubject(`DealFlow360 Quotation & Order Proposal Update — ${cust.company_name}`);
                    setEmailBody(
                      `Dear ${cust.primary_contact_name || 'Customer'},\n\nWe have updated your quotation and account details for ${cust.company_name} on DealFlow360.\n\nPlease review your active proposal at your convenience.\n\nBest regards,\nSales Representative`
                    );
                  }}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-600" />
                  <span>Email</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Quotation & Order History Modal */}
      {historyCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 border border-slate-200 shadow-xl space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{historyCustomer.company_name} — Account History</h3>
                <p className="text-xs text-slate-500">Contact: {historyCustomer.primary_contact_name} ({historyCustomer.primary_contact_email})</p>
              </div>
              <button
                onClick={() => setHistoryCustomer(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingHistory ? (
              <div className="py-12 text-center text-xs text-slate-500 font-bold">
                Loading quotation and order history from DB...
              </div>
            ) : (
              <div className="space-y-6">
                {/* Quotations List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>Customer Quotations History</span>
                  </h4>

                  {historyData?.quotations?.length === 0 ? (
                    <div className="p-4 bg-slate-50 text-slate-500 text-xs rounded-xl border border-slate-200">
                      No quotations recorded for this customer.
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-3">Quote #</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Discount</th>
                            <th className="p-3 text-right">Total Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {historyData?.quotations?.map((q) => (
                            <tr key={q.id} className="hover:bg-slate-50">
                              <td className="p-3 font-bold text-indigo-600">{q.quote_number}</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-800 border border-slate-200">
                                  {q.status?.replace(/_/g, ' ')}
                                </span>
                              </td>
                              <td className="p-3 text-slate-600">{q.order_level_discount_pct || 0}%</td>
                              <td className="p-3 font-bold text-slate-900 text-right">${Number(q.total_amount || 0).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Invoices & Payment Status */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>Invoices & Payment Status</span>
                  </h4>

                  {historyData?.invoices?.length === 0 ? (
                    <div className="p-4 bg-slate-50 text-slate-500 text-xs rounded-xl border border-slate-200">
                      No invoices or payment records for this customer.
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-3">Invoice #</th>
                            <th className="p-3">Quote #</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Paid / Due</th>
                            <th className="p-3 text-right">PDF Invoice</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {historyData?.invoices?.map((inv) => (
                            <tr key={inv.id} className="hover:bg-slate-50">
                              <td className="p-3 font-bold text-slate-900">{inv.invoice_number}</td>
                              <td className="p-3 text-indigo-600 font-semibold">{inv.quote_number}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                  inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                                }`}>
                                  {inv.status}
                                </span>
                              </td>
                              <td className="p-3 font-bold text-slate-900 text-right">
                                ${Number(inv.amount_paid || 0).toLocaleString()} / ${Number(inv.amount_due || 0).toLocaleString()}
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => exportInvoicePDF(inv)}
                                  className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md text-[11px] font-bold flex items-center space-x-1 ml-auto cursor-pointer"
                                  title="Download PDF Invoice"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>PDF</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WhatsApp Direct Send Pop-Up Modal */}
      {whatsappCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Send WhatsApp Message</h3>
                  <p className="text-xs text-slate-500">{whatsappCustomer.company_name} — {whatsappCustomer.primary_contact_name}</p>
                </div>
              </div>
              <button
                onClick={() => setWhatsappCustomer(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-100 p-3 rounded-xl text-xs space-y-1">
              <p><strong>Recipient Contact:</strong> {whatsappCustomer.primary_contact_name}</p>
              <p><strong>WhatsApp Number:</strong> <span className="font-mono text-emerald-800 font-bold">{whatsappCustomer.primary_contact_phone || '+919876543210'}</span></p>
            </div>

            <form onSubmit={handleSendWhatsApp} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    WhatsApp Message Content <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAttachMagicLink('whatsapp')}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>+ Attach Magic Login Link</span>
                  </button>
                </div>
                <textarea
                  rows={5}
                  required
                  value={whatsappMsg}
                  onChange={(e) => setWhatsappMsg(e.target.value)}
                  placeholder={`Type your WhatsApp quotation, negotiation, or order update message for ${whatsappCustomer.company_name}...`}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-sans"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWhatsappCustomer(null)}
                  className="px-3.5 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <a
                  href={`https://wa.me/${(whatsappCustomer.primary_contact_phone || '919876543210').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMsg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Open WhatsApp Web</span>
                </a>
                <button
                  type="submit"
                  disabled={isSendingWhatsApp}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingWhatsApp ? 'Sending...' : 'Direct Send WhatsApp'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Customer Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Create Customer Account</h3>
                  <p className="text-[11px] text-slate-500">Save directly to PostgreSQL database</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Company / Organization Name *</label>
                <input
                  type="text"
                  required
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="e.g. Apex Industrial Systems"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Primary Contact Name</label>
                <input
                  type="text"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="contact@apex.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Customer Tier</label>
                <select
                  value={newTier}
                  onChange={(e) => setNewTier(e.target.value)}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-xl text-xs font-medium focus:border-indigo-600 focus:outline-none"
                >
                  <option value="silver" className="bg-white text-slate-900">Silver Tier (10% max disc)</option>
                  <option value="gold" className="bg-white text-slate-900">Gold Tier (15% max disc)</option>
                  <option value="platinum" className="bg-white text-slate-900">Platinum Tier (25% max disc)</option>
                  <option value="enterprise" className="bg-white text-slate-900">Enterprise Tier (35% max disc)</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {isCreating ? 'Creating...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Direct Send Pop-Up Modal */}
      {emailCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Send Direct Email</h3>
                  <p className="text-xs text-slate-500">{emailCustomer.company_name} — {emailCustomer.primary_contact_name}</p>
                </div>
              </div>
              <button
                onClick={() => setEmailCustomer(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-indigo-50/60 border border-indigo-100 p-3 rounded-xl text-xs space-y-1">
              <p><strong>To:</strong> <span className="font-mono text-indigo-900 font-bold">{emailCustomer.primary_contact_email}</span></p>
              <p><strong>Recipient:</strong> {emailCustomer.primary_contact_name} ({emailCustomer.company_name})</p>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Subject line..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-sans text-slate-900"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Email Body Content <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAttachMagicLink('email')}
                    className="text-[11px] font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-lg border border-indigo-200 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>+ Attach Magic Login Link</span>
                  </button>
                </div>
                <textarea
                  rows={5}
                  required
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder={`Type your quotation, negotiation, or order update email message for ${emailCustomer.company_name}...`}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-sans text-slate-900"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEmailCustomer(null)}
                  className="px-3.5 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <a
                  href={`mailto:${emailCustomer.primary_contact_email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
                  className="px-3.5 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Open Mail App</span>
                </a>
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingEmail ? 'Sending...' : 'Direct Send Email'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

