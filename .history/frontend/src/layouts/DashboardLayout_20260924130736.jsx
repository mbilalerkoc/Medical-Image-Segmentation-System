import React from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

const DashboardLayout = ({ children, title }) => {
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <Navbar title={title} />
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;