import React, { useState } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';

const NewAnalysis = () => {
  // Form State'leri (Postman'de doldurduğumuz alanlar)
  const [hastaId, setHastaId] = useState('2'); // Test için 2 atadık
  const [klinikId, setKlinikId] = useState('1'); // Test için 1 atadık
  const [organ, setOrgan] = useState('beyin');
  const [model, setModel] = useState('unet');
  const [file, setFile] = useState(null);
  
  // Arayüz State'leri
  const [yukleniyor, setYukleniyor] = useState(false);
  const [sonuc, setSonuc] = useState(null);
  const [hata, setHata] = useState(null);

  // Dosya seçildiğinde çalışır
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Form gönderildiğinde (Postman'deki Send butonu)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setHata('Lütfen bir MR/CT görseli seçin.');
      return;
    }

    setYukleniyor(true);
    setHata(null);
    setSonuc(null);

    // 1. FormData Oluştur (Postman Body -> form-data)
    const formData = new FormData();
    formData.append('hasta_id', hastaId);
    formData.append('klinik_id', klinikId);
    formData.append('organ', organ);
    formData.append('sira_no', 1);
    formData.append('file', file);

    try {
      // DİKKAT: Şimdilik test edebilmek için Postman'den aldığın güncel TOKEN'ı buraya yapıştır!
      // Login sayfasını yapınca bunu localStorage'dan dinamik çekeceğiz.
      const TOKEN = "BURAYA_POSTMANDEN_ALDIGIN_SÜPER_ADMIN_VEYA_DOKTOR_TOKENINI_YAPISTIR";

      // 2. Node.js'e İstek At
      const response = await axios.post(
        `http://localhost:5000/api/analyze/predict/${model}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${TOKEN}`
          }
        }
      );

      // 3. Başarılı Sonucu Ekrana Bas
      setSonuc(response.data.sonuclar);
    } catch (err) {
      setHata(err.response?.data?.mesaj || 'Analiz sırasında bir hata oluştu.');
      console.error(err);
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <DashboardLayout title="Yeni Analiz Başlat">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* SOL TARAF: Analiz Formu */}
        <div className="bg-white p-6 rounded-xl shadow-md flex-1 border-t-4 border-blue-600">
          <h2 className="text-xl font-semibold text-blue-900 mb-6">Analiz Parametreleri</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hasta ID</label>
                <input type="text" value={hastaId} onChange={(e) => setHastaId(e.target.value)} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Klinik ID</label>
                <input type="text" value={klinikId} onChange={(e) => setKlinikId(e.target.value)} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Organ</label>
                <select value={organ} onChange={(e) => setOrgan(e.target.value)} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="beyin">Beyin</option>
                  <option value="bobrek">Böbrek</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Yapay Zeka Modeli</label>
                <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="unet">U-Net (Hızlı)</option>
                  <option value="unet_plus">U-Net++ (Detaylı)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">MR/CT Görseli</label>
              <input type="file" accept="image/*" onChange={handleFileChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>

            {hata && <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{hata}</div>}

            <button 
              type="submit" 
              disabled={yukleniyor}
              className={`w-full py-3 rounded-lg font-semibold text-white transition ${yukleniyor ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg'}`}
            >
              {yukleniyor ? '🤖 Yapay Zeka Analiz Ediyor...' : '🚀 Analizi Başlat'}
            </button>
          </form>
        </div>

        {/* SAĞ TARAF: Yapay Zeka Sonuçları */}
        <div className="bg-white p-6 rounded-xl shadow-md flex-1 border-t-4 border-green-500">
          <h2 className="text-xl font-semibold text-blue-900 mb-6">Analiz Sonucu</h2>
          
          {!sonuc && !yukleniyor && (
            <div className="h-64 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
              Sonuçları görmek için analiz başlatın.
            </div>
          )}

          {yukleniyor && (
            <div className="h-64 flex flex-col items-center justify-center text-blue-500 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="font-medium animate-pulse">Görüntü işleniyor, lütfen bekleyin...</p>
            </div>
          )}

          {sonuc && (
             <div className="space-y-6 animate-fade-in">
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-center">
                    <p className="text-slate-500 text-sm">Dice Skoru</p>
                    <p className="text-2xl font-bold text-blue-700">{sonuc.dice_score ? sonuc.dice_score.toFixed(4) : '-'}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-center">
                    <p className="text-slate-500 text-sm">Patoloji / Tümör</p>
                    <p className="text-2xl font-bold text-red-600">%{sonuc.tumor_percentage ? sonuc.tumor_percentage.toFixed(2) : '0.00'}</p>
                  </div>
               </div>

               <div>
                 <p className="text-sm font-medium text-slate-700 mb-2">Oluşturulan Maske (Segmentasyon)</p>
                 {sonuc.mask_base64 ? (
                    <img 
                      src={`data:image/png;base64,${sonuc.mask_base64}`} 
                      alt="AI Mask" 
                      className="w-full rounded-lg shadow-sm border border-slate-200"
                    />
                 ) : (
                    <p className="text-sm text-slate-500">Maske verisi dönmedi.</p>
                 )}
               </div>
             </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewAnalysis;