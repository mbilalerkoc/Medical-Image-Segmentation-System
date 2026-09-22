import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const DoctorDashboard = () => {
  const [recentAnalyses] = useState([
    { id: 1, hasta: 'Ahmet Yılmaz', organ: 'Beyin', model: 'unet', tarih: '2026-09-20', durum: 'Tamamlandı', sonuc: '%14 Patoloji' },
    { id: 2, hasta: 'Mehmet Hasta', organ: 'Böbrek', model: 'unet_plus', tarih: '2026-09-21', durum: 'Bekliyor', sonuc: '-' },
  ]);

  return (
    <DashboardLayout title="Doktor Paneli">
      
      {/* ========================================================= */}
      <div className="relative w-full min-h-full pb-8 font-sans">
        
        {/* AÇIK TEMA DEKORATİF ARKA PLAN (Login tarzı ama aydınlık) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl -z-10">
          {/* Faint Grid */}
          <div 
            className="absolute inset-0 opacity-[0.3]" 
            style={{ 
              backgroundImage: 'linear-gradient(rgba(203,213,225,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(203,213,225,0.4) 1px, transparent 1px)', 
              backgroundSize: '40px 40px' 
            }}
          ></div>
          
          {/* Yumuşak Işık Parlamaları */}
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyan-400/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]"></div>
        </div>

        {/* ========================================================= */}
        {/* İSTATİSTİK KARTLARI */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
          
          {/* Kart 1: Toplam Analiz */}
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all hover:shadow-[0_8px_40px_rgba(6,182,212,0.08)] hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-100/50 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-semibold tracking-wide uppercase">Toplam Analiz</p>
                <h3 className="text-4xl font-extrabold text-slate-800 mt-2">128</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center border border-cyan-100 text-cyan-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-slate-400 font-medium">
              <span className="text-cyan-500 flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> +12%</span>
              <span className="ml-2">geçen haftaya göre</span>
            </div>
          </div>

          {/* Kart 2: Tamamlanan */}
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all hover:shadow-[0_8px_40px_rgba(16,185,129,0.08)] hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/50 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-semibold tracking-wide uppercase">Tamamlanan</p>
                <h3 className="text-4xl font-extrabold text-slate-800 mt-2">124</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-medium">
              <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">%96.8 Başarı Oranı</span>
            </div>
          </div>

          {/* Kart 3: Bekleyen */}
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all hover:shadow-[0_8px_40px_rgba(245,158,11,0.08)] hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/50 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-semibold tracking-wide uppercase">Bekleyen İşlem</p>
                <h3 className="text-4xl font-extrabold text-slate-800 mt-2">4</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100 text-amber-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-amber-600 font-medium">
              <span className="animate-pulse mr-2 h-1.5 w-1.5 bg-amber-500 rounded-full"></span>
              Sırada bekleyen analizler var
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* SON ANALİZLER TABLOSU */}
        {/* ========================================================= */}
        <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl border border-slate-200/70 shadow-[0_15px_60px_rgba(0,0,0,0.04)] overflow-hidden z-10">
          
          {/* Tablo Üst Başlık Alanı */}
          <div className="px-7 py-6 border-b border-slate-100/80 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Son Analizler</h2>
                <p className="text-xs text-slate-500 mt-0.5">Sisteme yüklenen en güncel tarama sonuçları</p>
              </div>
            </div>
            
            {/* Login Tasarımındaki Buton Tarzı */}
            <button className="group relative flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-bold shadow-[0_8px_20px_rgba(6,182,212,0.25)] hover:shadow-[0_8px_25px_rgba(6,182,212,0.35)] transition-all duration-300 active:scale-[0.98]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
              <span>Yeni Görüntü Yükle</span>
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                  <th className="py-4 px-7">Hasta Bilgisi</th>
                  <th className="py-4 px-7">Organ / AI Model</th>
                  <th className="py-4 px-7">Kayıt Tarihi</th>
                  <th className="py-4 px-7">İşlem Durumu</th>
                  <th className="py-4 px-7">Segmentasyon Sonucu</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentAnalyses.map((analiz) => (
                  <tr key={analiz.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-7 font-bold text-slate-700">{analiz.hasta}</td>
                    <td className="py-4 px-7">
                      <div className="flex items-center gap-2">
                        <span className="bg-cyan-50 text-cyan-700 border border-cyan-100 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide">
                          {analiz.organ}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px] bg-slate-100 px-2 py-1 rounded-md">
                          {analiz.model}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-7 text-slate-500 font-medium">{analiz.tarih}</td>
                    <td className="py-4 px-7">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        analiz.durum === 'Tamamlandı' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${analiz.durum === 'Tamamlandı' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                        {analiz.durum}
                      </span>
                    </td>
                    <td className="py-4 px-7">
                      {analiz.sonuc !== '-' ? (
                        <span className="font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                          {analiz.sonuc}
                        </span>
                      ) : (
                        <span className="text-slate-300 font-medium">Bekleniyor...</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Tablo Altı Extra Detay (Login'deki System Ready gibi) */}
          <div className="px-7 py-4 bg-slate-50/50 border-t border-slate-100 text-[11px] font-mono uppercase tracking-[0.15em] text-slate-400 flex items-center gap-4">
             <span className="flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
               Model Sunucusu Aktif
             </span>
             <span className="flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
               Veritabanı Senkronize
             </span>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;