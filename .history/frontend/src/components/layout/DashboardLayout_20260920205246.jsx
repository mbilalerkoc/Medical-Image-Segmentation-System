import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = ({ children, title }) => {
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <Navbar title={title} />
        {/* Sayfanın asıl içeriği buraya gelecek */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;