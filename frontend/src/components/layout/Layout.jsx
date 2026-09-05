import React, { useState } from "react";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-bgmain flex flex-col print:bg-white">
      <div className="print:hidden">
        <TopBar />
      </div>
      <div className="flex flex-1 pt-16 print:pt-0">
        <div className="print:hidden">
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>
        <main
          className={`flex-1 p-6 transition-all duration-300 ${
            collapsed ? "ml-16" : "ml-64"
          } print:ml-0 print:p-0`}
        >
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
