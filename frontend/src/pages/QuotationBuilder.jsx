import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Trash2, 
  Lightbulb, 
  Save, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Package,
  Layers
} from 'lucide-react';
import { useData } from '../context/DataContext';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import CustomerContact from '../components/common/CustomerContact';
import DiscountInput from '../components/special/DiscountInput';
import UpsellPanel from '../components/special/UpsellPanel';
import { formatCurrency, calculateMargin } from '../utils/helpers';

const QuotationBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { quotations, products, addQuotation, updateQuotationStatus } = useData();

  const existingQuote = quotations.find(q => q.id === id);

  const [customer, setCustomer] = useState('ABC Company');
  const [cartItems, setCartItems] = useState([
    { id: 'PROD-001', product: 'Laptop Pro 15"', qty: 20, price: 500, cost: 350, discount: 0, category: 'Hardware' },
    { id: 'PROD-002', product: 'Monitor 27" 4K', qty: 10, price: 300, cost: 200, discount: 0, category: 'Hardware' }
  ]);
  const [overallDiscount, setOverallDiscount] = useState(10);
  const [showUpsell, setShowUpsell] = useState(true);
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    if (existingQuote) {
      setCustomer(existingQuote.customer);
      setCartItems(existingQuote.items || []);
      setOverallDiscount(existingQuote.overallDiscountPercent || 0);
    }
  }, [existingQuote]);

  // Catalog filtering
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  // Cart operations
  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id || item.product === product.name);
      if (existing) {
        return prev.map(item => 
          (item.id === product.id || item.product === product.name)
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [...prev, {
        id: product.id,
        product: product.name,
        qty: 1,
        price: product.price,
        cost: product.cost || product.price * 0.7,
        discount: 0,
        category: product.category
      }];
    });
  };

  const updateCartQty = (idx, newQty) => {
    if (newQty <= 0) return removeFromCart(idx);
    setCartItems(prev => prev.map((item, i) => i === idx ? { ...item, qty: newQty } : item));
  };

  const removeFromCart = (idx) => {
    setCartItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddUpsell = (upsellItem) => {
    setCartItems(prev => [
      ...prev,
      {
        id: upsellItem.id,
        product: upsellItem.name,
        qty: 1,
        price: upsellItem.priceAdd,
        cost: upsellItem.priceAdd * 0.6,
        discount: 0,
        category: upsellItem.category
      }
    ]);
  };

  // Pricing calculations
  const rawSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const discountAmount = Math.round(rawSubtotal * (overallDiscount / 100));
  const finalTotal = rawSubtotal - discountAmount;
  const marginPercent = calculateMargin(cartItems, overallDiscount);
  const isHighRisk = overallDiscount > 12 || marginPercent < 20;

  const handleSaveDraft = () => {
    addQuotation({
      customer,
      amount: rawSubtotal,
      discountAmount,
      overallDiscountPercent: overallDiscount,
      total: finalTotal,
      status: 'draft',
      margin: marginPercent,
      riskScore: isHighRisk ? 'high' : 'low',
      items: cartItems
    });
    alert('Quotation saved as Draft!');
    navigate('/quotations');
  };

  const handleSubmitApproval = () => {
    addQuotation({
      customer,
      amount: rawSubtotal,
      discountAmount,
      overallDiscountPercent: overallDiscount,
      total: finalTotal,
      status: 'pending_approval',
      margin: marginPercent,
      riskScore: isHighRisk ? 'high' : 'low',
      items: cartItems,
      riskReason: isHighRisk ? `Discount ${overallDiscount}% exceeds policy. Margin: ${marginPercent}%` : 'Standard approval workflow'
    });
    alert(`Quotation ${isHighRisk ? 'flagged and submitted for Approval!' : 'submitted successfully!'}`);
    navigate('/approvals');
  };

  return (
    <Layout>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-bordercolor shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/quotations')}>
            Back
          </Button>
          <div className="h-4 w-px bg-bordercolor"></div>
          <div>
            <h1 className="text-base font-bold text-textmain flex items-center gap-2">
              Quotation Builder: <span className="text-accent">{id || 'New Quote'}</span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-textsub">Customer:</span>
              <CustomerContact name={customer} email="customer@abc.com" phone="+919876543210" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={Lightbulb}
            onClick={() => setShowUpsell(!showUpsell)}
          >
            {showUpsell ? 'Hide Upsell' : 'Show Upsell'}
          </Button>
          <Button variant="outline" size="sm" icon={Save} onClick={handleSaveDraft}>
            Save Draft
          </Button>
          <Button variant="success" size="sm" icon={Send} onClick={handleSubmitApproval}>
            Submit for Approval
          </Button>
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Product Catalog (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card title="Product Catalog Selection">
            {/* Search & Category filter */}
            <div className="space-y-3 mb-4">
              <Input
                icon={Search}
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-textsub shrink-0">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full text-xs bg-hoverbg border border-bordercolor rounded-lg px-2.5 py-1.5 font-medium text-textmain focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Service">Services</option>
                  <option value="Subscription">Subscriptions</option>
                </select>
              </div>
            </div>

            {/* Product Cards List */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="p-3 bg-white border border-bordercolor rounded-xl hover:border-primary/40 transition-all flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div>
                    <div className="text-xs font-bold text-textmain">{prod.name}</div>
                    <div className="text-[11px] text-textsub mt-0.5">
                      {prod.category} • In Stock: {prod.inStock} units
                    </div>
                    <div className="text-xs font-bold text-primary mt-1">
                      {formatCurrency(prod.price)}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Plus}
                    onClick={() => addToCart(prod)}
                  >
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Cart Summary & Margin Calculation (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Toggleable Upsell Panel */}
          {showUpsell && (
            <UpsellPanel onAddUpsell={handleAddUpsell} />
          )}

          <Card title="Quotation Cart & Pricing Summary">
            {/* Cart Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-bordercolor bg-hoverbg/60 text-textsub uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Price</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bordercolor">
                  {cartItems.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-textsub">
                        Cart is empty. Select items from the product catalog.
                      </td>
                    </tr>
                  ) : (
                    cartItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-hoverbg/40">
                        <td className="py-3 px-3">
                          <span className="font-semibold text-textmain block">{item.product}</span>
                          <span className="text-[10px] text-textsub">{item.category}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center gap-1 bg-white border border-bordercolor rounded-md px-1 py-0.5">
                            <button 
                              onClick={() => updateCartQty(idx, item.qty - 1)} 
                              className="px-1.5 text-textsub hover:text-textmain font-bold"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-bold">{item.qty}</span>
                            <button 
                              onClick={() => updateCartQty(idx, item.qty + 1)} 
                              className="px-1.5 text-textsub hover:text-textmain font-bold"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-textmain">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-textmain">
                          {formatCurrency(item.price * item.qty)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => removeFromCart(idx)}
                            className="p-1 text-gray-400 hover:text-rose-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Calculations & Discount Section */}
            {cartItems.length > 0 && (
              <div className="mt-6 pt-4 border-t border-bordercolor space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <DiscountInput
                    value={overallDiscount}
                    onChange={setOverallDiscount}
                    maxAllowed={12}
                  />

                  <div className="bg-hoverbg p-4 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between text-textsub">
                      <span>List Price Subtotal:</span>
                      <span className="font-medium text-textmain">{formatCurrency(rawSubtotal)}</span>
                    </div>
                    <div className="flex justify-between text-rose-600">
                      <span>Discount ({overallDiscount}%):</span>
                      <span className="font-medium">-{formatCurrency(discountAmount)}</span>
                    </div>
                    <div className="border-t border-bordercolor pt-2 flex justify-between text-sm font-bold text-textmain">
                      <span>Final Total:</span>
                      <span className="text-primary text-base">{formatCurrency(finalTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Margin Badge */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-bordercolor bg-surface">
                  <span className="text-xs font-semibold text-textsub">Blended Margin Estimation:</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${marginPercent >= 20 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {marginPercent}% Margin
                    </span>
                    {marginPercent >= 20 ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        🟢 Healthy Deal
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        🔴 Low Margin Alert
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default QuotationBuilder;
