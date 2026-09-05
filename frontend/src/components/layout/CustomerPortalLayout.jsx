import React from "react";
import TopBar from "./TopBar";

const CustomerPortalLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-bgmain flex flex-col">
      <TopBar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 pt-20">
        {children}
      </main>

      {/* Portal Footer */}
      <footer className="border-t border-bordercolor py-6 text-center text-xs text-textsub bg-surface">
        <p>
          © 2026 DealFlow360 Enterprise Sales Platform. Need support? Email
          support@dealflow.com
        </p>
      </footer>
    </div>
  );
};

export default CustomerPortalLayout;
