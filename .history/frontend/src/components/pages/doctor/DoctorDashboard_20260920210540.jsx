import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const DoctorDashboard = () => {
  const [recentAnalyses] = useState([
    { id: 1, hasta: 'Ahmet Yılmaz', organ: 'Beyin', model: 'unet', tarih: '2026-09-20', durum: 'Tamamlandı', sonuc: '%14 Patoloji' },
  ]);

  return (
    <DashboardLayout title="Doktor Paneli">
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <h3 className="text-slate-500 text-sm font-medium">Toplam Analiz</h3>
          <p className="text-3xl font-bold text-blue-900 mt-2">128</p>
        </div>
        {/* Diğer istatistik kartları... */}
      </div>

      {/* Son Analizler Tablosu */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-blue-900">Son Analizler</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 shadow-md transition">
            + Yeni Yükle
          </button>
        </div>
        
        {/* Tablo HTML kodları burada yer alacak */}
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;