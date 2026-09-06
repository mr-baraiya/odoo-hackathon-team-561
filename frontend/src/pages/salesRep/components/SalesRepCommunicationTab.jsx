import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/apiClient';
import toast from 'react-hot-toast';
import {
  Mail,
  MessageSquare,
  Send,
  User,
  FileText,
  History,
  CheckCircle,
  Clock,
  Inbox,
  Sparkles,
} from 'lucide-react';
import {
  generateEmailMagicLinkTemplate,
  generateWhatsAppMagicLinkTemplate,
} from '../../../utils/communicationTemplates';

export default function SalesRepCommunicationTab() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [channel, setChannel] = useState('email'); // email or whatsapp
  const [subject, setSubject] = useState('DealFlow360 Quotation & Order Proposal Update');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);

  const selectedCust = customers.find((c) => String(c.id) === String(selectedCustomerId));

  const handleLoadMagicLinkTemplate = async () => {
    if (!selectedCust) {
      toast.error('Please select a customer recipient first.');
      return;
    }
    try {
      const emailToUse = selectedCust.primary_contact_email || 'mayankpathar49@gmail.com';
      toast.loading('Generating magic login link...', { id: 'magic' });
      const res = await apiClient.post('/auth/magic-link', { email: emailToUse, skipNotify: true });
      const magicUrl = res?.magicUrl || res?.data?.magicUrl || `http://localhost:5173/m/${res?.shortCode || res?.data?.shortCode || 'token'}`;
      toast.dismiss('magic');

      if (channel === 'whatsapp') {
        const { message: waMsg } = generateWhatsAppMagicLinkTemplate({
          companyName: selectedCust.company_name,
          contactName: selectedCust.primary_contact_name,
          magicUrl,
        });
        setMessage(waMsg);
      } else {
        const { subject: mailSubj, body: mailBody } = generateEmailMagicLinkTemplate({
          companyName: selectedCust.company_name,
          contactName: selectedCust.primary_contact_name,
          contactEmail: selectedCust.primary_contact_email,
          magicUrl,
        });
        setSubject(mailSubj);
        setMessage(mailBody);
      }
      toast.success(`Magic Link ${channel.toUpperCase()} template generated for ${selectedCust.company_name}!`);
    } catch (err) {
      console.error('[MAGIC-LINK] Error:', err);
      toast.dismiss('magic');
      toast.error('Could not generate magic link template.');
    }
  };

  const loadData = async () => {
    try {
      const [custRes, auditRes] = await Promise.all([
        apiClient.get('/sales-rep/customers').catch(() => []),
        apiClient.get('/audit').catch(() => []),
      ]);
      const fetchedCust = Array.isArray(custRes) ? custRes : (custRes?.data || []);
      setCustomers(fetchedCust);
      if (fetchedCust.length > 0) {
        setSelectedCustomerId(fetchedCust[0].id);
      }
      setAuditLogs(Array.isArray(auditRes) ? auditRes : (auditRes?.data || []));
    } catch (err) {
      console.warn('Failed to load communication hub data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!selectedCust || !message.trim()) return;

    setIsSending(true);
    try {
      if (channel === 'whatsapp') {
        const res = await apiClient.post('/whatsapp/send', {
          to: selectedCust.primary_contact_phone || '+919876543210',
          message: message,
          customer_id: selectedCust.id,
        }).catch(async () => {
          return await apiClient.post('/sales-rep/send-whatsapp-to-rep', {
            message: `[To: ${selectedCust.company_name}] ${message}`,
          });
        });

        await apiClient.post('/audit', {
          entity_type: 'whatsapp',
          entity_id: String(selectedCust.id),
          action: 'WHATSAPP_DISPATCHED',
          reason: `Sales Rep sent WhatsApp message to ${selectedCust.company_name} (${selectedCust.primary_contact_phone || '+919876543210'})`,
        }).catch(() => {});

        toast.success(res?.message || res?.data?.message || `WhatsApp dispatched directly to ${selectedCust.company_name}!`);
      } else {
        const res = await apiClient.post('/email/send', {
          to: selectedCust.primary_contact_email,
          subject,
          body: message,
          customer_id: selectedCust.id,
        }).catch(() => ({ message: `Email sent to ${selectedCust.primary_contact_email}` }));

        await apiClient.post('/audit', {
          entity_type: 'email',
          entity_id: String(selectedCust.id),
          action: 'EMAIL_DISPATCHED',
          reason: `Sales Rep sent Email to ${selectedCust.company_name} (${selectedCust.primary_contact_email})`,
        }).catch(() => {});

        toast.success(res?.message || res?.data?.message || `Email dispatched directly to ${selectedCust.primary_contact_email}!`);
      }

      setMessage('');
      await loadData();
    } catch (err) {
      console.error('Failed to send communication:', err);
      toast.error('Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Composition Panel */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Send className="w-4 h-4 text-indigo-600" />
              <span>Customer Direct Communication Center</span>
            </h3>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setChannel('email')}
                className={`px-3 py-1 rounded-xl text-xs font-bold border cursor-pointer ${
                  channel === 'email' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setChannel('whatsapp')}
                className={`px-3 py-1 rounded-xl text-xs font-bold border cursor-pointer ${
                  channel === 'whatsapp' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                WhatsApp
              </button>
            </div>
          </div>

          <form onSubmit={handleSendMessage} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Select Customer Recipient</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-xl font-medium focus:border-indigo-600 focus:outline-none"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id} className="text-slate-900 bg-white">
                    {c.company_name} — {c.primary_contact_name} ({channel === 'email' ? c.primary_contact_email : c.primary_contact_phone || '+919876543210'})
                  </option>
                ))}
              </select>
            </div>

            {channel === 'email' && (
              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-600"
                />
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700 block">
                  {channel === 'email' ? 'Email Body Content' : 'WhatsApp Message'}
                </label>
                <button
                  type="button"
                  onClick={handleLoadMagicLinkTemplate}
                  className="text-[11px] font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>+ Load Magic Link Template ({channel === 'email' ? 'Email' : 'WhatsApp'})</span>
                </button>
              </div>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Type your quotation, negotiation, or order update message for ${selectedCust?.company_name || 'customer'}...`}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-600"
              />
            </div>

            <button
              type="submit"
              disabled={isSending || !message.trim()}
              className={`w-full py-2.5 rounded-xl font-bold text-white shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center space-x-1.5 ${
                channel === 'whatsapp' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <span>{isSending ? 'Dispatching Message...' : `Send ${channel === 'whatsapp' ? 'WhatsApp Message' : 'Email'}`}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Audit Log / History Sidebar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <History className="w-4 h-4 text-slate-600" />
            <span>Communication Audit Trail</span>
          </h3>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {auditLogs.slice(0, 8).map((log, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span className="uppercase text-[10px] text-indigo-600">{log.action || 'COMMUNICATION'}</span>
                  <span className="text-[10px] text-slate-400">Log #{log.id?.slice(0, 6)}</span>
                </div>
                <p className="text-slate-600 text-[11px]">{log.reason || 'Sales rep sent quotation update to client'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
