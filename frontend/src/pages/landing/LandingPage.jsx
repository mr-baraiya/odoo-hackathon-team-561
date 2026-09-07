import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Edit3,
  ShieldCheck,
  Send,
  Eye,
  RefreshCw,
  Package,
  Truck,
  Receipt,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Zap,
  HelpCircle
} from "lucide-react";

export default function LandingPage() {
  const [activeStepIndex, setActiveStepIndex] = useState(2); // Default to Discount & Approval Governance step
  const [activePhase, setActivePhase] = useState("approvals");

  // Workflow steps corresponding to user's exact flow chart
  const workflowSteps = [
    {
      id: "request",
      phase: "quoting",
      num: "01",
      title: "Quotation Request",
      actor: "Customer",
      actorBadge: "bg-blue-50 text-blue-700 border-blue-200",
      icon: FileText,
      shortDesc: "Customer submits RFQ or price request via Portal or WhatsApp.",
      painPoint: "Slow response times, manual data entry, lost sales leads due to delay.",
      solution: "Instant quote request capture via portal & automated customer profile lookup.",
      metric: "Instant Lead Capture",
      details: [
        "Inbound request automatically assigned to the designated Sales Rep.",
        "Customer pricing tier & historical purchase frequency retrieved instantly.",
        "Initial cart items pre-checked for baseline availability."
      ]
    },
    {
      id: "quote_draft",
      phase: "quoting",
      num: "02",
      title: "Official Quotation",
      actor: "Sales Representative",
      actorBadge: "bg-indigo-50 text-indigo-700 border-indigo-200",
      icon: Edit3,
      shortDesc: "Sales Rep drafts official quote with item pricing & volume discounts.",
      painPoint: "Inconsistent line-item pricing, unapproved custom discounts, formula errors.",
      solution: "Standardized Quotation Builder with real-time margin impact calculation & product ceilings.",
      metric: "100% Accurate Pricing",
      details: [
        "Real-time margin delta preview before quotation lock.",
        "Automatic cross-sell & upsell co-purchase suggestions.",
        "Enforces product tier pricing rules and baseline profit margins."
      ]
    },
    {
      id: "approval",
      phase: "approvals",
      num: "03",
      title: "Discount / Approval",
      actor: "Sales Manager",
      actorBadge: "bg-amber-50 text-amber-700 border-amber-200",
      icon: ShieldCheck,
      shortDesc: "Engine evaluates blended risk score and routes for manager approval.",
      painPoint: "Quotes stuck in email threads for days waiting for manager sign-off.",
      solution: "Automated risk scoring routes high-discount quotes to dual-approval queues instantly.",
      metric: "90% Faster Approvals",
      details: [
        "Blended risk score calculated from customer tier, total discount, and margin floor.",
        "Low-risk quotes auto-approved; high-risk quotes routed to Sales Manager / Finance Ops.",
        "One-click mobile/portal approval with complete audit trail."
      ]
    },
    {
      id: "send",
      phase: "approvals",
      num: "04",
      title: "Send to Customer",
      actor: "Sales Representative",
      actorBadge: "bg-indigo-50 text-indigo-700 border-indigo-200",
      icon: Send,
      shortDesc: "Official quotation delivered via interactive portal link & WhatsApp bot.",
      painPoint: "Static PDF emails get buried, lost in spam, or lack interactive options.",
      solution: "Dynamic, secure portal link sent instantly with real-time view tracking.",
      metric: "Instant Delivery & Alerts",
      details: [
        "Customer receives interactive magic link and instant WhatsApp message.",
        "Sales rep gets read receipts when the customer opens the quotation.",
        "Includes breakdown of hardware, recurring services, and terms."
      ]
    },
    {
      id: "review",
      phase: "negotiation",
      num: "05",
      title: "Customer Review",
      actor: "Customer",
      actorBadge: "bg-blue-50 text-blue-700 border-blue-200",
      icon: Eye,
      shortDesc: "Customer evaluates pricing and chooses Accept, Reject, or Negotiate.",
      painPoint: "Opaque review process; reps have no visibility into customer intent.",
      solution: "Self-service customer portal with options to Accept, Negotiate, or request callbacks.",
      metric: "Full Pipeline Transparency",
      details: [
        "Customer can review itemized breakdown, taxes, and estimated delivery dates.",
        "Three clear action pathways: Accept Quote, Counter-propose, or Reject with feedback.",
        "Interactive WhatsApp bot supports quick review on mobile devices."
      ]
    },
    {
      id: "negotiate_loop",
      phase: "negotiation",
      num: "06",
      title: "If Negotiate → Re-Approval",
      actor: "Customer & Manager",
      actorBadge: "bg-purple-50 text-purple-700 border-purple-200",
      icon: RefreshCw,
      shortDesc: "Counter-offer triggers instant risk re-evaluation and manager re-approval.",
      painPoint: "Negotiations stall for weeks, resetting the entire sales cycle manually.",
      solution: "Automated counter-proposal engine re-scores risk and fast-tracks manager approval.",
      metric: "Zero Margin Leakage",
      details: [
        "Customer inputs counter-discount percentage or target price in portal/WhatsApp.",
        "DealFlow360 recalculates margin impact; if valid, routes for instant manager re-approval.",
        "Once re-approved, updated quotation is pushed back to customer in seconds."
      ]
    },
    {
      id: "order",
      phase: "fulfillment",
      num: "07",
      title: "Order Conversion",
      actor: "Sales Representative",
      actorBadge: "bg-indigo-50 text-indigo-700 border-indigo-200",
      icon: Package,
      shortDesc: "Accepted quotation locks pricing and automatically creates Sales Order.",
      painPoint: "Manual re-keying from quote to order leads to SKU & quantity discrepancies.",
      solution: "Seamless 1-click conversion from accepted quote to binding sales order.",
      metric: "Zero Data Entry Errors",
      details: [
        "Locks quotation pricing, preventing unauthorized mid-flight changes.",
        "Reserves inventory allocations temporarily to prevent stockouts.",
        "Triggers downstream fulfillment and accounting workflows automatically."
      ]
    },
    {
      id: "fulfillment",
      phase: "fulfillment",
      num: "08",
      title: "Stock Splitting Fulfillment",
      actor: "Finance & Operations",
      actorBadge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: Truck,
      shortDesc: "Greedy algorithm splits items across warehouses for optimal delivery.",
      painPoint: "Single depot stockouts delay entire order shipment, angering clients.",
      solution: "Multi-warehouse intelligent stock splitting prioritizes fast delivery & low freight cost.",
      metric: "Optimal Inventory Allocation",
      details: [
        "Evaluates available inventory across regional depots in real time.",
        "Generates split dispatch orders for multi-warehouse fulfillments.",
        "Handles partial shipments and tracks remaining backorders automatically."
      ]
    },
    {
      id: "invoice",
      phase: "fulfillment",
      num: "09",
      title: "Hybrid Invoice",
      actor: "Finance & Operations",
      actorBadge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: Receipt,
      shortDesc: "Generates unified invoice for hardware, services, and SaaS subscriptions.",
      painPoint: "Fragmented billing for products vs recurring fees causes accounting headaches.",
      solution: "Unified hybrid invoicing engine handles one-time items and recurring subscription lines with proration.",
      metric: "Automated Billing Precision",
      details: [
        "Combines one-time physical items and recurring SaaS billing lines into one clean invoice.",
        "Computes exact mid-cycle proration adjustments and credit notes when plans change.",
        "Applies automated tax rules and payment terms."
      ]
    },
    {
      id: "payment",
      phase: "fulfillment",
      num: "10",
      title: "Razorpay Payment Sync",
      actor: "Finance & Customer",
      actorBadge: "bg-teal-50 text-teal-700 border-teal-200",
      icon: CreditCard,
      shortDesc: "Customer settles via Razorpay; instant HMAC verification marks order PAID.",
      painPoint: "Manual wire transfer verification causes payment reconciliation delays.",
      solution: "Razorpay payment gateway integration with HMAC-SHA256 signature verification & automated webhooks.",
      metric: "Instant Reconciliation",
      details: [
        "Generates secure Razorpay checkout order with digital invoice link.",
        "Asynchronous webhook listens for payment completion and auto-updates invoice status to PAID.",
        "Issues automated payment receipt and updates sales pipeline analytics instantly."
      ]
    }
  ];

  const currentStep = workflowSteps[activeStepIndex];
  const StepIcon = currentStep.icon;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* 1. Sticky Clean Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/logo.svg" alt="DealFlow360 Logo" className="w-8 h-8 rounded-lg shadow-sm" />
            <span className="text-xl font-bold tracking-tight text-slate-900">
              DealFlow<span className="text-indigo-600">360</span>
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#workflow" className="hover:text-indigo-600 transition-colors">
              Deal Lifecycle
            </a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">
              How It Works
            </a>
            <a href="#why-us" className="hover:text-indigo-600 transition-colors">
              Features
            </a>
            <a href="#whatsapp" className="hover:text-indigo-600 transition-colors">
              WhatsApp Integration
            </a>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/contact-support"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 px-3 py-2 transition-colors inline-flex items-center space-x-1.5"
            >
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span>Support</span>
            </Link>
            <Link
              to="/login"
              className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition-all inline-flex items-center"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 border-b border-slate-200/60 bg-gradient-to-b from-white via-slate-50/70 to-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 shadow-2xs">
            Enterprise B2B Sales Operations & Risk Governance Platform
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            From Quotation Request to Payment — <br className="hidden sm:inline" />
            <span className="text-indigo-600">Governed & Automated.</span>
          </h1>

          {/* Supporting text */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Eliminate manual approval bottlenecks, rogue discounting, and fulfillment delays. 
            DealFlow360 connects your entire B2B sales engine into one self-governing workflow.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all inline-flex items-center justify-center"
            >
              Login to Platform
            </Link>
            <a
              href="#workflow"
              className="w-full sm:w-auto bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-base px-8 py-3.5 rounded-xl transition-all inline-flex items-center justify-center shadow-xs"
            >
              Explore Deal Flowchart ↓
            </a>
          </div>
        </div>
      </section>

      {/* 3. DEDICATED WORKFLOW & VALUE PROPOSITION SECTION */}
      <section id="workflow" className="py-20 md:py-28 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
              Why DealFlow360 Is Essential
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
              The Complete B2B Sales Workflow
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Traditional B2B sales stall in email threads, unauthorized discounts, inventory surprises, and delayed billing. 
              Here is how DealFlow360 seamlessly governs every step from initial request to paid invoice.
            </p>
          </div>

          {/* Phase Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {[
              { id: "all", label: "Full 10-Step Lifecycle" },
              { id: "quoting", label: "1. Request & Quote Creation" },
              { id: "approvals", label: "2. Governance & Approvals" },
              { id: "negotiation", label: "3. Portal Negotiation Loop" },
              { id: "fulfillment", label: "4. Fulfillment & Payment" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePhase(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activePhase === tab.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Visual Step Stepper Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 mb-10 overflow-x-auto pb-2">
            {workflowSteps.map((step, idx) => {
              const isFiltered = activePhase !== "all" && step.phase !== activePhase;
              const isSelected = activeStepIndex === idx;
              const IconComp = step.icon;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    isFiltered ? "opacity-40 grayscale" : ""
                  } ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200"
                      : "bg-white border-slate-200 text-slate-800 hover:border-indigo-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono font-bold ${isSelected ? "text-indigo-200" : "text-slate-400"}`}>
                      {step.num}
                    </span>
                    <IconComp className={`w-4 h-4 ${isSelected ? "text-white" : "text-indigo-600"}`} />
                  </div>
                  <p className={`font-bold text-xs leading-snug ${isSelected ? "text-white" : "text-slate-900"}`}>
                    {step.title}
                  </p>
                  <span
                    className={`mt-2 inline-block text-[9px] px-1.5 py-0.5 rounded font-semibold truncate ${
                      isSelected
                        ? "bg-indigo-700 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {step.actor}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Step Detailed Card (Light Theme) */}
          <div className="bg-slate-50/90 border border-slate-200 text-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Stage Info & Badges */}
              <div className="lg:col-span-5 space-y-5 border-b lg:border-b-0 lg:border-r border-slate-200 pb-6 lg:pb-0 lg:pr-8">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
                    <StepIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-indigo-600">STAGE {currentStep.num}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentStep.actorBadge}`}>
                        Actor: {currentStep.actor}
                      </span>
                    </div>
                    <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                      {currentStep.title}
                    </h3>
                  </div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed">
                  {currentStep.shortDesc}
                </p>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-2xs">
                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    Key Performance Benefit
                  </div>
                  <div className="text-lg font-bold text-emerald-700 flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-emerald-600" />
                    <span>{currentStep.metric}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Problem vs Solution */}
              <div className="lg:col-span-7 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pain Point */}
                  <div className="bg-rose-50/90 border border-rose-200/80 rounded-2xl p-4">
                    <div className="flex items-center space-x-2 text-rose-700 font-bold text-xs uppercase tracking-wider mb-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Traditional Pain Point</span>
                    </div>
                    <p className="text-rose-950 text-xs leading-relaxed font-medium">
                      {currentStep.painPoint}
                    </p>
                  </div>

                  {/* DealFlow360 Solution */}
                  <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-4">
                    <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>DealFlow360 Solution</span>
                    </div>
                    <p className="text-emerald-950 text-xs leading-relaxed font-medium">
                      {currentStep.solution}
                    </p>
                  </div>
                </div>

                {/* Deep-Dive Specifications */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Under The Hood Execution
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {currentStep.details.map((detail, i) => (
                      <li key={i} className="flex items-start space-x-2.5">
                        <span className="text-indigo-600 font-bold mt-0.5">•</span>
                        <span className="leading-relaxed font-medium">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Negotiation Loop Highlight Callout */}
          <div className="mt-12 bg-indigo-50/60 border border-indigo-100 rounded-2xl p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-2">
                <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full border border-purple-200">
                  Interactive Negotiation Engine
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  What Happens When a Customer Asks for a Discount?
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Instead of endless email negotiation, DealFlow360 allows customers to submit counter-proposals in their portal or WhatsApp. 
                  The platform re-scores risk in real time, routes to the manager for instant approval, and updates the quote seamlessly.
                </p>
              </div>
              <div className="flex justify-start md:justify-end">
                <a
                  href="#whatsapp"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-6 py-3 rounded-xl transition-all shadow-sm inline-flex items-center space-x-1.5"
                >
                  <span>See WhatsApp Bot Negotiation</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PAIN POINTS VS DEALFLOW360 PLATFORM COMPARISON */}
      <section className="py-20 bg-slate-100/70 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
              Why Businesses Need DealFlow360
            </h2>
            <p className="text-slate-600 text-base">
              Comparing manual B2B sales operations against DealFlow360's automated platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center text-rose-600 mb-4">
                <XCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Uncontrolled Discounting</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                Sales reps give unauthorized price cuts to close deals, eroding gross margins without management oversight.
              </p>
              <div className="pt-3 border-t border-slate-100 text-xs font-semibold text-indigo-600 flex items-start space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>DealFlow360 Solution: Automated blended risk scores enforce strict discount ceilings.</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-amber-600 mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Negotiation Bottlenecks</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                Counter-offers take days to review through email chains, causing hot leads to cool off or switch to competitors.
              </p>
              <div className="pt-3 border-t border-slate-100 text-xs font-semibold text-indigo-600 flex items-start space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>DealFlow360 Solution: Interactive portal & WhatsApp bot fast-track manager re-approvals.</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Stockout Delays</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                Quotations are issued without checking depot inventory, leading to unfulfilled promises and cancelled orders.
              </p>
              <div className="pt-3 border-t border-slate-100 text-xs font-semibold text-indigo-600 flex items-start space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>DealFlow360 Solution: Multi-warehouse greedy stock splitting optimizes fulfillment depots automatically.</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Billing & Payment Friction</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                Disconnected invoices and manual payment tracking waste finance team hours and cause cash flow delays.
              </p>
              <div className="pt-3 border-t border-slate-100 text-xs font-semibold text-indigo-600 flex items-start space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>DealFlow360 Solution: Hybrid SaaS invoicing with Razorpay HMAC payment sync.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-28 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-slate-600 text-base">
              Streamline your entire B2B deal process in 5 automated steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {/* Card 1 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-sm mb-4">
                  1
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Create Quote</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Build quotations using customer, product, pricing, and discount rules.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-bold text-sm mb-4">
                  2
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Negotiate</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Customers can request changes or discounts through the portal or WhatsApp.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-amber-600 font-bold text-sm mb-4">
                  3
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Approve</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Deals requiring approval are automatically routed to the right manager or finance team.
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-bold text-sm mb-4">
                  4
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Fulfill</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Connect orders with inventory and warehouses to manage fulfillment and delivery.
                </p>
              </div>
            </div>

            {/* Card 5 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center text-teal-600 font-bold text-sm mb-4">
                  5
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Get Paid</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Generate invoices and track payments from one place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Why DealFlow360 Section */}
      <section id="why-us" className="py-20 md:py-28 bg-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
              Why DealFlow360
            </h2>
            <p className="text-slate-600 text-base">
              Built for speed, compliance, and complete control over your sales pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Smart Approvals</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Automatically identify deals that require approval based on tier discount ceilings and line item caps.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Faster Negotiation</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Let customers negotiate quotations through the interactive portal or directly via WhatsApp.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Inventory-Aware Fulfillment</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Check stock and warehouse availability before promising delivery with automated split fulfillment.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Deal Health</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Detect stalled deals, unusual discounts, and delivery delays with real-time risk alerts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. WhatsApp Section */}
      <section id="whatsapp" className="py-20 md:py-28 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                Instant Messaging Bot
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
                Stay Connected Through WhatsApp
              </h2>
              <p className="text-slate-600 text-base leading-relaxed mb-6">
                Handle quick actions, negotiations, approvals, and order updates directly through WhatsApp without logging into heavy enterprise tools.
              </p>

              <ul className="space-y-3 text-sm text-slate-700 font-medium">
                <li className="flex items-center space-x-2">
                  <span>&bull; Real-time quotation status checks</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>&bull; Instant counter-offer discount submissions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>&bull; One-click quotation approval & order tracking</span>
                </li>
              </ul>
            </div>

            {/* Right WhatsApp Realistic Preview Card */}
            <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 shadow-sm max-w-md mx-auto lg:mx-0 w-full">
              {/* WhatsApp Header */}
              <div className="bg-emerald-700 text-white p-4 text-sm rounded-xl flex items-center justify-between mb-4 shadow-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-white text-emerald-700 font-bold rounded-full flex items-center justify-center text-xs">
                    DF
                  </div>
                  <div>
                    <h4 className="font-bold text-sm leading-tight">DealFlow360 Bot</h4>
                    <p className="text-[11px] text-emerald-100">Official Business Account</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-800 px-2 py-0.5 rounded text-emerald-200">Verified</span>
              </div>

              {/* Conversation Area */}
              <div className="space-y-3 font-sans text-xs">
                {/* Customer Message */}
                <div className="flex justify-end">
                  <div className="bg-emerald-100 text-slate-800 p-3 rounded-xl rounded-tr-xs shadow-2xs max-w-[75%]">
                    <p className="font-medium">Hi</p>
                    <span className="text-[9px] text-slate-500 block text-right mt-1">10:42 AM</span>
                  </div>
                </div>

                {/* DealFlow360 Bot Reply */}
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 text-slate-900 p-3.5 rounded-xl rounded-tl-xs shadow-2xs max-w-[85%] space-y-2">
                    <p className="font-semibold text-slate-900">
                      Welcome to DealFlow360. What would you like to do?
                    </p>
                    <div className="space-y-1.5 pt-1">
                      <div className="bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-700 p-2 rounded-lg text-xs cursor-pointer font-medium transition-colors">
                        1. View Quotation
                      </div>
                      <div className="bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-700 p-2 rounded-lg text-xs cursor-pointer font-medium transition-colors">
                        2. Request Discount
                      </div>
                      <div className="bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-700 p-2 rounded-lg text-xs cursor-pointer font-medium transition-colors">
                        3. Accept Quotation
                      </div>
                      <div className="bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-700 p-2 rounded-lg text-xs cursor-pointer font-medium transition-colors">
                        4. Track Order
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400 block text-right">10:42 AM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Final CTA Section */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Ready to streamline your sales workflow?
          </h2>
          <p className="text-slate-300 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
            Bring your entire B2B deal process from quotation to payment into one intelligent platform.
          </p>

          <div className="flex justify-center items-center space-x-4">
            <Link
              to="/login"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all inline-flex items-center"
            >
              Login to DealFlow360
            </Link>
            <Link
              to="/contact-support"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-base px-6 py-3.5 rounded-xl transition-all inline-flex items-center space-x-2"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Contact Support</span>
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Admin-controlled access &bull; Enterprise RBAC Security &bull; 24/7 Dedicated Support
          </p>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <img src="/logo.svg" alt="DealFlow360 Logo" className="w-6 h-6 rounded" />
              <span className="font-bold text-slate-900 text-base">DealFlow360</span>
            </div>
            <p className="text-slate-500 max-w-sm leading-relaxed">
              Managing the complete B2B sales lifecycle from quotation request to payment in one intelligent, risk-governed platform.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 font-medium">
              <li>
                <a href="#workflow" className="hover:text-indigo-600 transition-colors">
                  Deal Lifecycle Workflow
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#why-us" className="hover:text-indigo-600 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#whatsapp" className="hover:text-indigo-600 transition-colors">
                  WhatsApp Bot
                </a>
              </li>
              <li>
                <Link to="/contact-support" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors flex items-center space-x-1">
                  <span>Contact Support</span>
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-indigo-600 transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-3">
              Platform & Support
            </h4>
            <ul className="space-y-2 font-medium">
              <li>
                <span className="text-slate-500">Self-Governing Sales Ops</span>
              </li>
              <li>
                <span className="text-slate-500">Risk Governance Engine</span>
              </li>
              <li>
                <Link to="/contact-support" className="hover:text-indigo-600 transition-colors">
                  Customer Help Desk
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center text-slate-400">
          <p>© 2026 DealFlow360. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Built for Enterprise B2B Sales Operations & Risk Governance</p>
        </div>
      </footer>
    </div>
  );
}
