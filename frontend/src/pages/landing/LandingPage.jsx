import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
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
              to="/login"
              className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition-all inline-flex items-center"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 border-b border-slate-200/60 bg-gradient-to-b from-white to-slate-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6">
            Enterprise B2B Sales Operations Platform
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            From Quotation to Payment — <br className="hidden sm:inline" />
            <span className="text-indigo-600">Automatically.</span>
          </h1>

          {/* Supporting text */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            DealFlow360 helps B2B teams manage quotations, negotiations, approvals, fulfillment, invoices, and payments in one intelligent platform.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
            <Link
              to="/login"
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base px-8 py-3.5 rounded-xl shadow-sm transition-all inline-flex items-center justify-center"
            >
              Login
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-base px-8 py-3.5 rounded-xl transition-all inline-flex items-center justify-center shadow-xs"
            >
              See How It Works
            </a>
          </div>

          {/* Visual Deal Lifecycle Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-5xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-5">
              Complete B2B Deal Lifecycle Flow
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 items-center">
              {[
                { step: "Quotation", color: "bg-blue-50 text-blue-700 border-blue-200" },
                { step: "Negotiation", color: "bg-purple-50 text-purple-700 border-purple-200" },
                { step: "Approval", color: "bg-amber-50 text-amber-700 border-amber-200" },
                { step: "Order", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
                { step: "Fulfillment", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                { step: "Invoice", color: "bg-sky-50 text-sky-700 border-sky-200" },
                { step: "Payment", color: "bg-teal-50 text-teal-700 border-teal-200" },
              ].map((item, idx) => (
                <React.Fragment key={item.step}>
                  <div className={`p-3 rounded-xl border font-semibold text-xs text-center transition-all ${item.color} shadow-2xs`}>
                    <span className="block text-[10px] opacity-75 font-mono">0{idx + 1}</span>
                    {item.step}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
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

      {/* 4. Why DealFlow360 Section */}
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

      {/* 5. WhatsApp Section */}
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
              <div className="bg-emerald-700 text-white p-4.5 rounded-xl flex items-center justify-between mb-4 shadow-xs">
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

      {/* 6. Final CTA Section */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Ready to manage your next deal?
          </h2>
          <p className="text-slate-300 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
            Bring your sales workflow together with DealFlow360.
          </p>

          <div className="flex justify-center">
            <Link
              to="/login"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all inline-flex items-center"
            >
              Login to DealFlow360
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Admin-controlled access &bull; Enterprise RBAC Security
          </p>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <img src="/logo.svg" alt="DealFlow360 Logo" className="w-6 h-6 rounded" />
              <span className="font-bold text-slate-900 text-base">DealFlow360</span>
            </div>
            <p className="text-slate-500 max-w-sm leading-relaxed">
              Managing the complete B2B sales lifecycle from quotation to payment in one intelligent, risk-governed platform.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 font-medium">
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
                <Link to="/login" className="hover:text-indigo-600 transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 font-medium">
              <li>
                <span className="text-slate-500">Self-Governing Sales Ops</span>
              </li>
              <li>
                <span className="text-slate-500">Risk Governance Engine</span>
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

