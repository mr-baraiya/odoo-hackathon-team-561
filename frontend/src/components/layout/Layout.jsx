import React, { useState } from 'react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-bgmain flex flex-col">
      <TopBar />
      <div className="flex flex-1 pt-16">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <main
          className={`flex-1 p-6 transition-all duration-300 ${
            collapsed ? 'ml-16' : 'ml-64'
          }`}
        >
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
