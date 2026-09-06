import React, { useState } from 'react';
import {
  ShieldCheck,
  Mail,
  User,
  Award,
  MessageSquare,
  Send,
  X,
} from 'lucide-react';
import apiClient from '../../../services/apiClient';
import toast from 'react-hot-toast';

export default function CustomerHeader({
  customer = {},
  salesRep = {},
  onOpenWhatsAppModal,
}) {
  const companyName = customer?.company_name || 'Customer Account';
  const contactName = customer?.primary_contact_name || 'Customer User';
  const contactEmail = customer?.primary_contact_email || '';
  const tierLabel = customer?.tier_label || 'Standard';

  const repName = salesRep?.full_name || 'Account Manager';
  const repEmail = salesRep?.email || '';
  const repPhone = salesRep?.phone || '';

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState(`Inquiry regarding ${companyName}`);
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleSendEmail = async (e) => {
    if (e) e.preventDefault();
    if (!repEmail || !emailBody.trim()) return;

    try {
      setIsSendingEmail(true);
      const res = await apiClient.post('/email/send', {
        to: repEmail,
        subject: emailSubject || `Inquiry from ${companyName}`,
        body: emailBody,
        customer_id: customer.id,
      });

      toast.success(res?.message || res?.data?.message || `Email sent directly to ${repName} (${repEmail})!`);
      setShowEmailModal(false);
      setEmailBody('');
    } catch (err) {
      console.error('Error sending Email:', err);
      toast.error('Failed to send Email.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        {/* Left: Customer Info from DB */}
        <div className="flex items-start space-x-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl flex items-center justify-center font-extrabold text-xl shadow-md shrink-0">
            {companyName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2.5 mb-1.5 flex-wrap gap-y-1">
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3 text-indigo-600" />
                <span>Verified Customer</span>
              </span>
              {tierLabel && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wider">
                  <Award className="w-3 h-3 text-amber-600" />
                  <span>{tierLabel}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
              {companyName}
            </h1>

            <div className="flex items-center space-x-4 mt-1.5 text-xs text-slate-600 flex-wrap gap-y-1">
              {contactName && (
                <span className="flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-800">{contactName}</span>
                </span>
              )}
              {contactEmail && (
                <span className="flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{contactEmail}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Sales Rep from DB */}
        <div className="w-full lg:w-auto bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
              {repName.substring(0, 1).toUpperCase()}
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 block">
                Assigned Sales Representative
              </span>
              <h4 className="text-xs font-bold text-slate-900">{repName === 'Sales Manager' ? 'Sales Representative' : repName}</h4>
              {repPhone && (
                <p className="text-[11px] text-slate-600 font-mono">{repPhone}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {onOpenWhatsAppModal && (
              <button
                type="button"
                onClick={onOpenWhatsAppModal}
                className="flex-1 sm:flex-initial px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            )}
            {repEmail && (
              <button
                type="button"
                onClick={() => setShowEmailModal(true)}
                className="flex-1 sm:flex-initial px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Email Direct Send Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Send Email to {repName}</h3>
                  <p className="text-xs text-slate-500">{repEmail}</p>
                </div>
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
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
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Body Content <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder={`Type your inquiry or message for ${repName}...`}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingEmail || !emailBody.trim()}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
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
