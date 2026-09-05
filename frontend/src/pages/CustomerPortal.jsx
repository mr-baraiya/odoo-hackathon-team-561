import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, CheckCircle, Send, Package, HelpCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import CustomerPortalLayout from '../components/layout/CustomerPortalLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import CustomerContact from '../components/common/CustomerContact';
import { formatCurrency } from '../utils/helpers';

const CustomerPortal = () => {
  const { quoteId = 'Q-1042' } = useParams();
  const navigate = useNavigate();
  const { quotations, submitCounterOffer, updateQuotationStatus } = useData();

  const quote = quotations.find(q => q.id === quoteId) || quotations[0];

  const [counterDiscount, setCounterDiscount] = useState(15);
  const [counterMessage, setCounterMessage] = useState('');
  const [commentModalItem, setCommentModalItem] = useState(null);
  const [itemComments, setItemComments] = useState({
    'Laptop Pro 15"': 'Can we upgrade RAM to 32GB?',
    'Monitor 27" 4K': 'Includes HDMI cables?'
  });
  const [activeTab, setActiveTab] = useState('quote'); // 'quote' | 'catalog'

  const handleAddComment = (item) => {
    setCommentModalItem(item);
  };

  const handleSaveComment = (commentText) => {
    if (commentModalItem) {
      setItemComments(prev => ({ ...prev, [commentModalItem.product]: commentText }));
    }
    setCommentModalItem(null);
  };

  const handleSubmitCounter = () => {
    if (!counterDiscount) return alert('Please enter a counter discount percentage');
    submitCounterOffer(quote.id, counterDiscount, counterMessage);
    alert(`Counter discount request of ${counterDiscount}% submitted! Sales Rep Rahul Sharma will review your proposal.`);
  };

  const handleConfirmQuotation = () => {
    updateQuotationStatus(quote.id, 'confirmed');
    alert(`Thank you! Quotation ${quote.id} confirmed. Our fulfillment team is preparing order dispatch.`);
  };

  return (
    <CustomerPortalLayout quote={quote}>
      {/* Portal Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-bordercolor shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/')}>
            Back to Dashboard
          </Button>
          <div className="h-4 w-px bg-bordercolor"></div>
          <div>
            <h1 className="text-base font-bold text-textmain flex items-center gap-2">
              Proposal: <span className="text-accent">{quote.id}</span>
            </h1>
            <p className="text-xs text-textsub">Status: <Badge status={quote.status} /></p>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('quote')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'quote' ? 'bg-primary text-white' : 'bg-hoverbg text-textsub hover:text-textmain'
            }`}
          >
            My Proposal
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'catalog' ? 'bg-primary text-white' : 'bg-hoverbg text-textsub hover:text-textmain'
            }`}
          >
            Browse Products
          </button>
        </div>
      </div>

      {activeTab === 'quote' ? (
        <div className="space-y-6">
          {/* Line Items Table */}
          <Card title="Quotation Line Items & Specifications">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-hoverbg border-b border-bordercolor text-textsub uppercase font-semibold">
                    <th className="py-3 px-3">Product</th>
                    <th className="py-3 px-3 text-center">Qty</th>
                    <th className="py-3 px-3 text-right">Unit Price</th>
                    <th className="py-3 px-3 text-right">Total</th>
                    <th className="py-3 px-3 text-center">Line Comment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bordercolor">
                  {quote.items && quote.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-hoverbg/40">
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-textmain block">{item.product}</span>
                        <span className="text-[11px] text-textsub">{item.category}</span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-textmain">{item.qty}</td>
                      <td className="py-3.5 px-3 text-right font-medium text-textsub">{formatCurrency(item.price)}</td>
                      <td className="py-3.5 px-3 text-right font-bold text-textmain">{formatCurrency(item.price * item.qty)}</td>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleAddComment(item)}
                          className="p-1 text-primary hover:bg-hoverbg rounded inline-flex items-center gap-1 text-xs"
                          title="Add comment"
                        >
                          <MessageSquare className="w-4 h-4 text-emerald-600" />
                          {itemComments[item.product] && (
                            <span className="text-[10px] text-emerald-700 font-medium truncate max-w-[100px]">
                              {itemComments[item.product]}
                            </span>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pricing Breakdown */}
            <div className="mt-6 pt-4 border-t border-bordercolor flex justify-end">
              <div className="w-72 space-y-2 text-xs">
                <div className="flex justify-between text-textsub">
                  <span>Current Subtotal:</span>
                  <span className="font-semibold text-textmain">{formatCurrency(quote.amount)}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>Your Applied Discount ({quote.overallDiscountPercent}%):</span>
                  <span className="font-semibold">-{formatCurrency(quote.discountAmount)}</span>
                </div>
                <div className="border-t border-bordercolor pt-2 flex justify-between text-sm font-bold text-textmain">
                  <span>Final Total Amount:</span>
                  <span className="text-primary text-base">{formatCurrency(quote.total)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Counter Discount Proposal Card */}
          <Card title="Propose Counter Discount or Modification">
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-textmain mb-1">Requested Counter Discount (%)</label>
                  <input
                    type="number"
                    value={counterDiscount}
                    onChange={(e) => setCounterDiscount(Number(e.target.value))}
                    placeholder="e.g. 15"
                    className="w-full border border-bordercolor rounded-lg px-3 py-2 text-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-textmain mb-1">Message / Business Justification</label>
                  <input
                    type="text"
                    value={counterMessage}
                    onChange={(e) => setCounterMessage(e.target.value)}
                    placeholder="e.g. We are placing an additional order next month if we get 15%..."
                    className="w-full border border-bordercolor rounded-lg px-3 py-2 text-sm text-textmain focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" icon={Send} onClick={handleSubmitCounter}>
                  Submit Counter Request
                </Button>
                <Button variant="success" icon={CheckCircle} onClick={handleConfirmQuotation}>
                  Confirm Quotation
                </Button>
              </div>
            </div>
          </Card>

          {/* Contact Support Footer Box */}
          <div className="p-4 bg-hoverbg border border-bordercolor rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-xs font-bold text-textmain">Need assistance with this quote?</p>
                <p className="text-[11px] text-textsub">Your assigned account manager is available via direct Email support.</p>
              </div>
            </div>
            <CustomerContact name="Rahul Sharma (Rep)" phone="+919876543210" email="rep@dealflow.com" showName={false} />
          </div>
        </div>
      ) : (
        /* Browse Products Catalog Section */
        <Card title="Company Product Catalog">
          <p className="text-xs text-textsub mb-4">Request additional items to be added to your official quotation proposal.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border border-bordercolor rounded-xl bg-hoverbg/40">
              <span className="font-bold text-sm text-textmain block">Universal Docking Station</span>
              <p className="text-xs text-textsub mt-1">Dual 4K display output & 100W PD charging</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-bold text-primary">$120.00</span>
                <Button size="sm" variant="outline" onClick={() => alert('Request sent to sales rep!')}>
                  + Request to Add
                </Button>
              </div>
            </div>

            <div className="p-4 border border-bordercolor rounded-xl bg-hoverbg/40">
              <span className="font-bold text-sm text-textmain block">Extended 3-Year Onsite Warranty</span>
              <p className="text-xs text-textsub mt-1">Zero-deductible next-day replacement SLA</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-bold text-primary">$150.00</span>
                <Button size="sm" variant="outline" onClick={() => alert('Request sent to sales rep!')}>
                  + Request to Add
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Item Comment Modal */}
      <Modal
        isOpen={!!commentModalItem}
        onClose={() => setCommentModalItem(null)}
        title={`Add Comment for ${commentModalItem?.product}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setCommentModalItem(null)}>Cancel</Button>
            <Button variant="success" onClick={() => handleSaveComment(document.getElementById('item-comment-box')?.value || '')}>Save Comment</Button>
          </>
        }
      >
        <textarea
          id="item-comment-box"
          rows="3"
          defaultValue={commentModalItem ? itemComments[commentModalItem.product] || '' : ''}
          placeholder="Type specific questions or requests for this line item..."
          className="w-full text-xs p-2.5 border border-bordercolor rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        ></textarea>
      </Modal>
    </CustomerPortalLayout>
  );
};

export default CustomerPortal;
