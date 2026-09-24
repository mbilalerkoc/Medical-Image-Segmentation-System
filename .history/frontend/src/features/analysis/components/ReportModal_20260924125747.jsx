import React, { useState, useRef } from 'react';
import { createReport } from '../../../services/analysisService';

const ReportModal = ({ isOpen, onClose, tcKimlik, organ, preview, result, processedMask, overlayImage, analizId }) => {
  const [doktorNotu, setDoktorNotu] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const reportRef = useRef();

  if (!isOpen) return null;

  const handlePrintPDF = () => {
    window.print();
  };

  const handleSaveAndShare = async () => {
    if (!analizId) {
      alert("Hata: Analiz ID bulunamadı. Lütfen önce analiz işlemini tamamlayın.");
      return;
    }

    const userStr = localStorage.getItem('user');
    const doktorId = userStr ? JSON.parse(userStr).id : null;
    setIsSaving(true);

    try {
      const payload = {
        tc_kimlik: tcKimlik,
        analiz_id: analizId,
        doktor_id: doktorId,
        pdf_yolu: 'Sistem üzerinden PDF alınabilir' 
      };

      const data = await createReport(payload);

      if (data.basarili) {
        alert("Rapor başarıyla veritabanına kaydedildi ve hastanın paneline gönderildi!");
        onClose(); 
      }
    } catch (err) {
      alert("Rapor kaydı sırasında bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 print:bg-white print:p-0">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl flex flex-col print:shadow-none print:w-full print:max-w-none print:h-auto">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 print:hidden">
          <h2 className="text-2xl font-bold text-slate-800">PathoVision Tıbbi Analiz Raporu</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div ref={reportRef} className="p-8 flex-1 print:p-0">
          <div className="mb-8 border-b-2 border-slate-800 pb-4 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">PathoVision</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Yapay Zeka Destekli Tıbbi Görüntüleme Raporu</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-700">Hasta TC: <span className="font-normal">{tcKimlik}</span></p>
              <p className="text-sm font-bold text-slate-700">Tarih: <span className="font-normal">{new Date().toLocaleDateString('tr-TR')}</span></p>
              <p className="text-sm font-bold text-slate-700">İncelenen Organ: <span className="font-normal uppercase">{organ}</span></p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Görüntüleme Sonuçları</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">Orijinal Tarama</p>
                  <img src={preview} alt="Orijinal MR" className="w-full h-48 object-contain bg-black rounded-lg" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-600 mb-1">AI Segmentasyon</p>
                  <img src={processedMask || `data:image/png;base64,${result?.maske_base64}`} alt="AI Segmentasyon Maskesi" className="w-full h-48 object-contain bg-black rounded-lg border-2 border-blue-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-emerald-600 mb-1">MR + AI Örtüşmesi</p>
                  {overlayImage && (
                    <img src={overlayImage} alt="MR ve AI Segmentasyon Örtüşmesi" className="w-full h-48 object-contain bg-black rounded-lg border-2 border-emerald-500" />
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Sayısal Bulgular</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">Patoloji / Tümör</p>
                  <p className="text-2xl font-black text-red-600">%{result?.metrikler?.patoloji_yuzdesi || 0}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">AI Güven Skoru</p>
                  <p className="text-2xl font-black text-emerald-600">%{result?.metrikler?.guven_skoru || 0}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">Fiziksel Alan</p>
                  <p className="text-xl font-bold text-slate-800">{result?.metrikler?.alan_mm2 || 0} mm²</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">Çevre Uzunluğu</p>
                  <p className="text-xl font-bold text-slate-800">{result?.metrikler?.cevre_mm || 0} mm</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Doktor Değerlendirmesi ve Teşhis</h3>
            <textarea 
              value={doktorNotu} onChange={(e) => setDoktorNotu(e.target.value)}
              placeholder="Tıbbi teşhisinizi ve notlarınızı buraya giriniz..."
              className="w-full h-32 p-4 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none print:hidden"
            ></textarea>
            <p className="hidden print:block text-slate-800 whitespace-pre-wrap">{doktorNotu || "Doktor tarafından henüz not girilmemiştir."}</p>
          </div>
        </div>
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-4 rounded-b-2xl print:hidden">
          <button onClick={handlePrintPDF} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition shadow-sm">
            PDF Olarak İndir / Yazdır
          </button>
          <button onClick={handleSaveAndShare} disabled={isSaving} className={`flex items-center gap-2 px-6 py-2.5 text-white font-bold rounded-xl transition shadow-md ${isSaving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'}`}>
            {isSaving ? 'Kaydediliyor...' : 'Veritabanına Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;