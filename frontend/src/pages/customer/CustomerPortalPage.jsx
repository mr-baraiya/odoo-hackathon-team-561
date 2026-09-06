import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useDealFlow } from '../../context/DealFlowContext';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/auth.service';
import productService from '../../services/product.service';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Package,
  CreditCard,
  Bell,
  ShoppingBag,
  RefreshCw,
} from 'lucide-react';

// Sub-components
import CustomerHeader from './components/CustomerHeader';
import CustomerDashboardTab from './components/CustomerDashboardTab';
import CustomerCatalogTab from './components/CustomerCatalogTab';
import CustomerQuotationsTab from './components/CustomerQuotationsTab';
import CustomerNegotiationTab from './components/CustomerNegotiationTab';
import CustomerOrdersTab from './components/CustomerOrdersTab';
import CustomerInvoicesTab from './components/CustomerInvoicesTab';
import CustomerNotificationsTab from './components/CustomerNotificationsTab';

export default function CustomerPortalPage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { loginUser } = useAuth();
  const {
    getPortalSummary,
    getPortalQuotations,
    getPortalQuote,
    submitNegotiation,
    confirmPortalQuotation,
    getPortalOrders,
    getPortalInvoices,
    payPortalInvoice,
    getPortalNotifications,
    sendWhatsAppToRep,
    createPortalQuotation,
    rejectPortalQuotation,
    products: contextProducts,
    categories: contextCategories,
    currentUser,
  } = useDealFlow();

  // Tab State
  const [activeTab, setActiveTab] = useState(id ? 'quotations' : 'dashboard');

  // Data from DB
  const [summaryData, setSummaryData] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected quote detail
  const [selectedQuoteDetail, setSelectedQuoteDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // WhatsApp Modal
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsAppMessage, setWhatsAppMessage] = useState('');
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  // Auto-verify Magic Link Token if present
  useEffect(() => {
    const magicToken = searchParams.get('magicToken') || searchParams.get('token');
    if (magicToken) {
      (async () => {
        try {
          const res = await authService.verifyMagicLink(magicToken);
          if (res?.token && res?.user) {
            loginUser(res.user, res.token);
            toast.success(`Welcome ${res.user.full_name || res.user.email}!`);
            searchParams.delete('magicToken');
            searchParams.delete('token');
            setSearchParams(searchParams);
          }
        } catch {
          toast.error('Invalid or expired magic link.');
        }
      })();
    }
  }, [searchParams]);

  // Load all portal data from DB
  const loadPortalData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, quotesRes, ordersRes, invoicesRes, notifRes, prodRes, catRes] =
        await Promise.allSettled([
          getPortalSummary(),
          getPortalQuotations('all'),
          getPortalOrders(),
          getPortalInvoices(),
          getPortalNotifications(),
          productService.getProducts(),
          productService.getCategories(),
        ]);

      if (sumRes.status === 'fulfilled' && sumRes.value) setSummaryData(sumRes.value);
      if (quotesRes.status === 'fulfilled' && Array.isArray(quotesRes.value)) setQuotations(quotesRes.value);
      if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value)) setOrders(ordersRes.value);
      if (invoicesRes.status === 'fulfilled' && Array.isArray(invoicesRes.value)) setInvoices(invoicesRes.value);
      if (notifRes.status === 'fulfilled' && Array.isArray(notifRes.value)) setNotifications(notifRes.value);
      if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value)) setProducts(prodRes.value);
      else if (Array.isArray(contextProducts)) setProducts(contextProducts);
      if (catRes.status === 'fulfilled' && Array.isArray(catRes.value)) setCategories(catRes.value);
      else if (Array.isArray(contextCategories)) setCategories(contextCategories);
    } catch (err) {
      console.error('Error loading Customer Portal data:', err);
      toast.error('Failed to load portal data from database.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPortalData();
  }, []);

  // If quote ID in URL
  useEffect(() => {
    if (id) {
      fetchQuoteDetail(id);
      setActiveTab('quotations');
    }
  }, [id]);

  // Fetch single quotation detail
  const fetchQuoteDetail = async (quoteId) => {
    if (!quoteId) {
      setSelectedQuoteDetail(null);
      return;
    }
    setLoadingDetail(true);
    try {
      const detail = await getPortalQuote(quoteId);
      setSelectedQuoteDetail(detail);
    } catch (err) {
      console.error('Error fetching quote detail:', err);
      toast.error('Could not fetch quotation details.');
    } finally {
      setLoadingDetail(false);
    }
  };

  // Confirm quotation
  const handleConfirmQuotation = async (quoteId) => {
    try {
      const res = await confirmPortalQuotation(quoteId);
      toast.success(res?.message || 'Quotation confirmed! Order processing started.');
      await loadPortalData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to confirm quotation.');
    }
  };

  // Reject quotation
  const handleRejectQuotation = async (quoteId, reason) => {
    try {
      const res = await rejectPortalQuotation(quoteId, reason);
      toast.success(res?.message || 'Quotation proposal rejected.');
      await loadPortalData();
      if (quoteId) await fetchQuoteDetail(quoteId);
    } catch (err) {
      toast.error('Failed to reject quotation.');
    }
  };

  // Open negotiation
  const handleOpenNegotiation = (quote) => {
    fetchQuoteDetail(quote.id || quote.quote_number);
    setActiveTab('negotiation');
  };

  // Submit negotiation
  const handleSubmitNegotiation = async (payload) => {
    try {
      const res = await submitNegotiation(payload);
      toast.success(res?.message || 'Counter-proposal submitted to sales manager!');
      await loadPortalData();
      if (payload.quotationId) await fetchQuoteDetail(payload.quotationId);
    } catch (err) {
      toast.error('Failed to submit negotiation request.');
    }
  };

  // Pay invoice
  const handlePayInvoice = async (invoiceId, paymentData) => {
    try {
      const res = await payPortalInvoice(invoiceId, paymentData);
      toast.success(res?.message || 'Payment processed successfully!');
      await loadPortalData();
    } catch (err) {
      toast.error('Failed to process payment.');
    }
  };

  // Send WhatsApp
  const handleSendWhatsApp = async (e) => {
    e.preventDefault();
    if (!whatsAppMessage.trim()) {
      toast.error('Please enter a message.');
      return;
    }
    setSendingWhatsApp(true);
    try {
      const res = await sendWhatsAppToRep({ message: whatsAppMessage });
      toast.success(res?.message || 'WhatsApp message sent to your account manager!');
      setWhatsAppMessage('');
      setShowWhatsAppModal(false);
    } catch (err) {
      toast.error('Failed to send WhatsApp message.');
    } finally {
      setSendingWhatsApp(false);
    }
  };

  // Derived data from DB
  const customer = summaryData?.customer || {};
  const salesRep = summaryData?.sales_rep || {};
  const summary = summaryData?.summary || {};

  const TABS = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'catalog', label: 'Product Catalog', icon: ShoppingBag },
    { key: 'quotations', label: `Proposals (${quotations.length})`, icon: FileText },
    { key: 'negotiation', label: 'Negotiation', icon: MessageSquare },
    { key: 'orders', label: `Orders (${orders.length})`, icon: Package },
    { key: 'invoices', label: `Invoices (${invoices.length})`, icon: CreditCard },
    { key: 'notifications', label: 'Notifications', icon: Bell },
  ];

  if (loading && !summaryData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs text-slate-500 font-semibold">
            Loading Customer Portal from database...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* CUSTOMER HEADER — fully from DB */}
        <CustomerHeader
          customer={customer}
          salesRep={salesRep}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenWhatsAppModal={() => setShowWhatsAppModal(true)}
        />

        {/* NAVIGATION TABS */}
        <div className="border-b border-slate-200 flex items-center space-x-1 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.key
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/60 rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT */}
        <div>
          {activeTab === 'dashboard' && (
            <CustomerDashboardTab
              summary={summary}
              recentQuotations={quotations.slice(0, 5)}
              recentNotifications={notifications.slice(0, 5)}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'catalog' && (
            <CustomerCatalogTab
              products={products}
              categories={categories}
              customerTierCeiling={Number(summaryData?.customer?.discount_ceiling_pct || 18)}
              onRequestQuote={async (target, param2 = 1, param3 = 10) => {
                let lineItems = [];
                let discountPct = 0;
                let summaryText = '';

                if (Array.isArray(target)) {
                  // Multi-product quote basket array
                  lineItems = target;
                  discountPct = Number(param2 || 0);
                  summaryText = `${lineItems.length} products (${lineItems.reduce((a, b) => a + b.quantity, 0)} total units)`;
                } else {
                  // Single product direct request
                  const requestedQty = Number(param2 || 1);
                  discountPct = Number(param3 || 0);
                  lineItems = [{ product_id: target.id, quantity: requestedQty, unit_price: target.base_price || target.price || 0 }];
                  summaryText = `${requestedQty}x "${target.name}"`;
                }

                try {
                  const res = await createPortalQuotation({
                    orderDiscountPct: discountPct,
                    lineItems,
                    notes: `Customer requested quotation proposal for ${summaryText} with ${discountPct}% requested discount`,
                  });
                  toast.success(res?.message || `Quotation proposal created for ${summaryText} (${discountPct}% disc)!`);
                  await loadPortalData();
                  setActiveTab('quotations');
                } catch (err) {
                  toast.error(err?.response?.data?.message || 'Failed to create quotation.');
                }
              }}
            />
          )}

          {activeTab === 'quotations' && (
            <CustomerQuotationsTab
              quotations={quotations}
              onConfirmQuotation={handleConfirmQuotation}
              onRejectQuotation={handleRejectQuotation}
              onOpenNegotiation={handleOpenNegotiation}
              onFetchDetail={fetchQuoteDetail}
            />
          )}

          {activeTab === 'negotiation' && (
            <CustomerNegotiationTab
              quotations={quotations}
              selectedQuoteDetail={selectedQuoteDetail}
              onSelectQuote={fetchQuoteDetail}
              onSubmitNegotiation={handleSubmitNegotiation}
              onRejectQuotation={handleRejectQuotation}
              currentUser={currentUser}
              onTabSwitch={setActiveTab}
              customerTierCeiling={Number(summaryData?.customer?.discount_ceiling_pct || 18)}
            />
          )}

          {activeTab === 'orders' && (
            <CustomerOrdersTab orders={orders} />
          )}

          {activeTab === 'invoices' && (
            <CustomerInvoicesTab
              invoices={invoices}
              onPayInvoice={handlePayInvoice}
            />
          )}

          {activeTab === 'notifications' && (
            <CustomerNotificationsTab notifications={notifications} />
          )}
        </div>
      </div>

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSendWhatsApp}
            className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <span>Message Your Account Manager</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowWhatsAppModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Send a WhatsApp message to <strong>{salesRep?.full_name || 'your sales rep'}</strong>{' '}
              ({salesRep?.phone || 'N/A'}).
            </p>
            <textarea
              required
              rows="4"
              value={whatsAppMessage}
              onChange={(e) => setWhatsAppMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowWhatsAppModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sendingWhatsApp}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50"
              >
                {sendingWhatsApp ? 'Sending...' : 'Send via WhatsApp'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
