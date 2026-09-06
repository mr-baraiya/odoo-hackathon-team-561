import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/apiClient';
import toast from 'react-hot-toast';
import { Inbox, FileText, ArrowRight, User, Calendar, CheckCircle2, Clock } from 'lucide-react';

export default function SalesRepQuotationRequestsTab({ onConvertSuccess, onNavigateTab }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [convertingId, setConvertingId] = useState(null);

  const fetchQuotationRequests = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/sales-rep/quotation-requests');
      const data = Array.isArray(res) ? res : (res?.data || []);
      setRequests(data);
    } catch (err) {
      console.error('Failed to fetch quotation requests:', err);
      toast.error('Failed to load quotation requests from DB');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotationRequests();
  }, []);

  const handleConvertRequest = async (reqId) => {
    setConvertingId(reqId);
    try {
      const res = await apiClient.post(`/sales-rep/quotations/${reqId}/convert-request`);
      toast.success(res?.message || res?.data?.message || 'Quotation request converted to official draft quotation!');
      if (onConvertSuccess) onConvertSuccess();
      if (onNavigateTab) onNavigateTab('quotations');
      fetchQuotationRequests();
    } catch (err) {
      console.error('Failed to convert quotation request:', err);
      toast.error('Failed to convert quotation request');
    } finally {
      setConvertingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-800 text-xs font-bold mb-1">
            <Inbox className="w-3.5 h-3.5 text-amber-600" />
            <span>Customer Request Inbox</span>
          </div>
          <h3 className="text-base font-bold text-slate-900">Customer Initial Quotation Requests</h3>
          <p className="text-xs text-slate-500">
            Review initial commercial requests submitted by customers through the Customer Portal and accept them to generate official draft quotations.
          </p>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="py-12 text-center text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-2xl">
          Loading customer quotation requests from PostgreSQL database...
        </div>
      ) : requests.length === 0 ? (
        <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs font-medium space-y-2">
          <Clock className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-700">No pending customer quotation requests.</p>
          <p className="text-slate-500">New requests submitted by customers will appear here automatically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider">Customer Request</span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{req.quote_number}</h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                    Pending Acceptance
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customer Account:</span>
                    <span className="font-bold text-slate-900">{req.company_name || 'Customer'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contact:</span>
                    <span className="font-semibold text-slate-800">{req.primary_contact_name || req.primary_contact_email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estimated Total:</span>
                    <span className="font-bold text-emerald-700">${Number(req.total_amount || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleConvertRequest(req.id)}
                disabled={convertingId === req.id}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>{convertingId === req.id ? 'Converting to Official Quotation...' : 'Accept & Prepare Official Quotation'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
