import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, CreditCard, CheckCircle2, DollarSign, Printer } from 'lucide-react';
import { useData } from '../context/DataContext';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import CustomerContact from '../components/common/CustomerContact';
import { formatCurrency } from '../utils/helpers';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoices, recordInvoicePaymentAction } = useData();

  const invoice = invoices.find(i => i.id === id) || invoices[0];
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Wire Transfer');

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleConfirmPayment = () => {
    recordInvoicePaymentAction(invoice.id);
    setIsPaymentModalOpen(false);
    alert(`Payment of ${formatCurrency(invoice.total)} recorded for Invoice ${invoice.id}!`);
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-bordercolor shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/invoices')}>
            Back to Invoices
          </Button>
          <div className="h-4 w-px bg-bordercolor"></div>
          <div>
            <h1 className="text-base font-bold text-textmain flex items-center gap-2">
              Invoice Statement: <span className="text-accent">{invoice.id}</span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <CustomerContact name={invoice.customer} email={invoice.customerEmail} phone={invoice.customerPhone} />
              <span className="text-xs text-textsub">• Due Date: {invoice.dueDate}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge status={invoice.status} />
          <Button variant="outline" size="sm" icon={Download} onClick={handleDownloadPDF}>
            Download PDF / Print
          </Button>
          {invoice.status === 'Unpaid' && (
            <Button variant="success" size="sm" icon={CreditCard} onClick={() => setIsPaymentModalOpen(true)}>
              Record Payment
            </Button>
          )}
        </div>
      </div>

      {/* Printable Invoice Container */}
      <Card className="print:p-0 print:border-none print:shadow-none">
        {/* Invoice Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-bordercolor">
          <div>
            <div className="flex items-center gap-2 font-bold text-xl text-primary">
              <div className="w-8 h-8 rounded-lg bg-primary text-accent flex items-center justify-center font-black">
                360
              </div>
              DealFlow360 Inc.
            </div>
            <p className="text-xs text-textsub mt-1">100 Tech Plaza, Suite 800, San Francisco, CA 94107</p>
            <p className="text-xs text-textsub">Tax ID: US-987654321</p>
          </div>

          <div className="text-right">
            <h2 className="text-2xl font-black text-primary uppercase">INVOICE</h2>
            <p className="text-xs font-bold text-textmain mt-1">#{invoice.id}</p>
            <p className="text-xs text-textsub">Issue Date: {invoice.date}</p>
            <p className="text-xs text-textsub">Due Date: {invoice.dueDate}</p>
          </div>
        </div>

        {/* Bill To Info */}
        <div className="grid grid-cols-2 gap-6 py-6 border-b border-bordercolor">
          <div>
            <span className="text-xs font-semibold text-textsub uppercase tracking-wider block mb-1">Billed To:</span>
            <h3 className="text-sm font-bold text-textmain">{invoice.customer}</h3>
            <p className="text-xs text-textsub">{invoice.customerEmail}</p>
            <p className="text-xs text-textsub">{invoice.customerPhone}</p>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-textsub uppercase tracking-wider block mb-1">Payment Status:</span>
            <Badge status={invoice.status} className="text-sm px-3 py-1" />
          </div>
        </div>

        {/* Invoice Line Items Table */}
        <div className="py-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-hoverbg border-b border-bordercolor text-textsub uppercase font-semibold">
                <th className="py-3 px-3">Item Description</th>
                <th className="py-3 px-3 text-center">Qty</th>
                <th className="py-3 px-3 text-right">Unit Price</th>
                <th className="py-3 px-3 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bordercolor">
              {invoice.items && invoice.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-3 font-semibold text-textmain">{item.description}</td>
                  <td className="py-3 px-3 text-center font-bold text-textmain">{item.qty}</td>
                  <td className="py-3 px-3 text-right font-medium text-textsub">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-3 px-3 text-right font-bold text-textmain">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Subtotal & Total Summary */}
          <div className="mt-6 flex justify-end">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-textsub">
                <span>Subtotal:</span>
                <span className="font-semibold text-textmain">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-textsub">
                <span>Tax (0%):</span>
                <span className="font-semibold text-textmain">$0</span>
              </div>
              <div className="border-t border-bordercolor pt-2 flex justify-between text-sm font-bold text-textmain">
                <span>Total Due:</span>
                <span className="text-primary text-base">{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={`Record Payment for Invoice ${invoice.id}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>Cancel</Button>
            <Button variant="success" icon={CheckCircle2} onClick={handleConfirmPayment}>Confirm Settlement</Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-textmain mb-1">Select Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border border-bordercolor rounded-lg p-2 bg-white text-textmain focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Wire Transfer">Bank Wire Transfer (ACH)</option>
              <option value="Credit Card">Corporate Credit Card (Visa/Mastercard)</option>
              <option value="Cheque">Corporate Cheque</option>
            </select>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
            <p className="font-bold text-emerald-900">Total Settlement Amount: {formatCurrency(invoice.total)}</p>
            <p className="text-emerald-700 text-[11px] mt-0.5">Recording this payment will immediately update Accounts Receivable balances.</p>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default InvoiceDetail;
