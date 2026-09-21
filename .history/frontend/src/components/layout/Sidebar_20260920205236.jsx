import React from 'react';

const Sidebar = () => {
  const menuItems = [
    { name: '📊 Dashboard', path: '/dashboard' },
    { name: '🧠 Yeni Analiz Başlat', path: '/analyze' },
    { name: '👥 Hastalarım', path: '/patients' },
    { name: '⚙️ Ayarlar', path: '/settings' },
  ];

  return (
    <aside className="w-64 bg-blue-700 text-white flex flex-col shadow-xl">
      <div className="p-6 text-2xl font-bold tracking-wider border-b border-blue-600">
        PathoVision
      </div>
      <nav className="flex-1 p-4 mt-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li 
              key={index} 
              className="hover:bg-blue-600 p-3 rounded-lg cursor-pointer transition-colors duration-200 font-medium"
            >
              {item.name}
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-blue-600 text-sm opacity-80">
        Dr. Oturum Açık
      </div>
    </aside>
  );
};

export default Sidebar;