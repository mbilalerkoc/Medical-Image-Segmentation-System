import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const DoctorDashboard = () => {
  const [recentAnalyses] = useState([
    { id: 1, hasta: 'Ahmet Yılmaz', organ: 'Beyin', model: 'unet', tarih: '2026-09-20', durum: 'Tamamlandı', sonuc: '%14 Patoloji' },
    { id: 2, hasta: 'Mehmet Hasta', organ: 'Böbrek', model: 'unet_plus', tarih: '2026-09-21', durum: 'Bekliyor', sonuc: '-' },
  ]);

  return (
    <DashboardLayout title="Doktor Paneli">
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <h3 className="text-slate-500 text-sm font-medium">Toplam Analiz</h3>
          <p className="text-3xl font-bold text-blue-900 mt-2">128</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
          <h3 className="text-slate-500 text-sm font-medium">Tamamlanan</h3>
          <p className="text-3xl font-bold text-blue-900 mt-2">124</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-amber-500">
          <h3 className="text-slate-500 text-sm font-medium">Bekleyen</h3>
          <p className="text-3xl font-bold text-blue-900 mt-2">4</p>
        </div>
      </div>

      {/* Son Analizler Tablosu */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-blue-900">Son Analizler</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 shadow-md transition">
            + Yeni Yükle
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b">
                <th className="py-3 px-6 font-medium">Hasta</th>
                <th className="py-3 px-6 font-medium">Organ / Model</th>
                <th className="py-3 px-6 font-medium">Tarih</th>
                <th className="py-3 px-6 font-medium">Durum</th>
                <th className="py-3 px-6 font-medium">Sonuç</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 text-sm">
              {recentAnalyses.map((analiz) => (
                <tr key={analiz.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                  <td className="py-4 px-6 font-medium">{analiz.hasta}</td>
                  <td className="py-4 px-6">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide mr-2">
                      {analiz.organ}
                    </span>
                    <span className="text-slate-400 text-xs">{analiz.model}</span>
                  </td>
                  <td className="py-4 px-6 text-slate-500">{analiz.tarih}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      analiz.durum === 'Tamamlandı' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {analiz.durum}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-blue-900">{analiz.sonuc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;