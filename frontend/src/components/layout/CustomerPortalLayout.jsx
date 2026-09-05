import React from 'react';
import { Layers } from 'lucide-react';
import CustomerContact from '../common/CustomerContact';

const CustomerPortalLayout = ({ children, quote }) => {
  return (
    <div className="min-h-screen bg-bgmain flex flex-col">
      {/* Header for Customer Portal */}
      <header className="bg-surface border-b border-bordercolor h-16 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-black">
            360
          </div>
          <div>
            <h1 className="font-bold text-base text-primary leading-tight">DealFlow360 Customer Portal</h1>
            <p className="text-[11px] text-textsub">Secure Proposal & Negotiation Workspace</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <CustomerContact 
            name={quote?.customer || "ABC Company"} 
            email={quote?.customerEmail || "customer@abc.com"} 
            phone={quote?.customerPhone || "+919876543210"} 
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6">
        {children}
      </main>

      {/* Portal Footer */}
      <footer className="border-t border-bordercolor py-6 text-center text-xs text-textsub bg-surface">
        <p>© 2026 DealFlow360 Enterprise Sales Platform. Need support? Email support@dealflow.com</p>
      </footer>
    </div>
  );
};

export default CustomerPortalLayout;
