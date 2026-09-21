import React, { useState } from 'react';
import axios from 'axios';
import UTIF from 'utif';
import DashboardLayout from '../../components/layout/DashboardLayout';

const NewAnalysis = () => {
  // Form State'leri
  const [hastaId, setHastaId] = useState('');
  const [klinikId, setKlinikId] = useState('1'); 
  const [organ, setOrgan] = useState('beyin');
  const [model, setModel] = useState('unet');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // İşlem Durumu State'leri
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    if (!selectedFile) {
      setPreview(null);
      return;
    }

    const fileName = selectedFile.name.toLowerCase();

    // Eğer dosya TIFF formatındaysa UTIF ile çözümle
    if (fileName.endsWith('.tif') || fileName.endsWith('.tiff')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const buffer = event.target.result;
          const ifds = UTIF.decode(buffer);
          UTIF.decodeImage(buffer, ifds[0]);
          const rgba = UTIF.toRGBA8(ifds[0]);

          // Geçici bir canvas oluşturup pikselleri çiziyoruz
          const canvas = document.createElement('canvas');
          canvas.width = ifds[0].width;
          canvas.height = ifds[0].height;
          const ctx = canvas.getContext('2d');
          const imageData = ctx.createImageData(canvas.width, canvas.height);
          imageData.data.set(rgba);
          ctx.putImageData(imageData, 0, 0);

          // Tarayıcının okuyabilmesi için Canvas'ı anında PNG önizlemesine çeviriyoruz
          setPreview(canvas.toDataURL('image/png'));
        } catch (err) {
          console.error("TIFF dönüştürme hatası:", err);
          setError("TIFF dosyası önizlenemedi, ancak analiz için gönderilebilir.");
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      // Normal resim formatı (PNG, JPG vb.) ise tarayıcının yerleşik özelliğini kullan
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !hastaId) {
      setError("Lütfen hasta ID girin ve bir resim seçin.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('hasta_id', hastaId);
    formData.append('klinik_id', klinikId);
    formData.append('organ', organ);
    formData.append('sira_no', '1');
    formData.append('file', file);

    try {
      const TEST_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sIjoic3VwZXJhZG1pbiIsImlhdCI6MTc4OTkzMDgxNiwiZXhwIjoxNzkyNTIyODE2fQ.QVJEgEOsxfKx2jm0_0wbzlCVZhb0jExPQpGg_L_BVGQ"; 

      const response = await axios.post(
        `http://localhost:5000/api/analyze/predict/${model}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${TEST_TOKEN}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.basarili) {
    const sonuc = response.data.sonuclar;
    console.log("maske_base64 var mı:", !!sonuc.maske_base64);
    setResult(sonuc);
}
    } catch (err) {
      setError(err.response?.data?.mesaj || "Analiz sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Yeni Analiz Başlat">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* SOL: Yükleme Formu */}
        <div className="w-full lg:w-1/3 bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-600">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hasta ID</label>
              <input type="number" value={hastaId} onChange={(e) => setHastaId(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Örn: 2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Klinik ID</label>
              <input type="number" value={klinikId} onChange={(e) => setKlinikId(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Organ</label>
              <select value={organ} onChange={(e) => setOrgan(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="beyin">Beyin</option>
                <option value="bobrek">Böbrek</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Yapay Zeka Modeli</label>
              <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="unet">U-Net (Hızlı)</option>
                <option value="unet_plus">U-Net++ (Detaylı)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">MR/CT Görseli</label>
              <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
            <button type="submit" disabled={loading} className={`w-full py-2 px-4 rounded-md text-white font-medium shadow-md transition ${loading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {loading ? 'Yapay Zeka Analiz Ediyor...' : 'Analizi Başlat'}
            </button>
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
          </form>
        </div>

        {/* SAĞ: Sonuç ve Önizleme Ekranı */}
        <div className="w-full lg:w-2/3 bg-white p-6 rounded-xl shadow-md border-t-4 border-green-500 flex flex-col items-center justify-center min-h-[400px]">
          {!result && !preview && (
             <div className="text-slate-400 text-center">
               <span className="text-4xl block mb-2">📷</span>
               Lütfen analiz edilecek görseli seçin
             </div>
          )}

          {preview && !result && !loading && (
            <div className="text-center">
              <h3 className="text-slate-600 font-medium mb-2">Görsel Önizlemesi</h3>
              <img src={preview} alt="Önizleme" className="max-h-[300px] rounded-lg shadow-sm border border-slate-200" />
            </div>
          )}

          {loading && (
             <div className="flex flex-col items-center text-blue-600 animate-pulse">
               <span className="text-6xl mb-4">🧠</span>
               <p className="font-medium text-lg">Python Modeli İşliyor...</p>
             </div>
          )}

          {result && (
            <div className="w-full flex flex-col md:flex-row gap-6 items-center">
              
              <div className="w-full md:w-1/2 flex flex-col items-center gap-4">
                 <div className="relative">
                   <img src={preview} alt="Orijinal" className="max-h-[250px] rounded-lg shadow-sm border border-slate-200" />
                   <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">Orijinal</span>
                 </div>
                 
                 {result.maske_base64 && (
                   <div className="relative">
                     <img src={`data:image/png;base64,${result.maske_base64}`} alt="Maske" className="max-h-[250px] rounded-lg shadow-sm border border-slate-200" />
                     <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">AI Maskesi</span>
                   </div>
                 )}
              </div>

              {/* YENİ EKLENEN METRİKLER */}
              <div className="w-full md:w-1/2 space-y-4">
                <h3 className="text-xl font-bold text-slate-800 border-b pb-2">Analiz Raporu</h3>
                
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-600 font-medium">Patoloji / Tümör</span>
                  <span className="text-xl font-bold text-red-600">%{result.metrikler?.patoloji_yuzdesi || 0}</span>
                </div>
                
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-600 font-medium">AI Güven Skoru</span>
                  <span className="text-lg font-bold text-green-600">%{result.metrikler?.guven_skoru || 0}</span>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-600 font-medium">Fiziksel Alan</span>
                  <span className="text-lg font-bold text-blue-700">{result.metrikler?.alan_mm2 || 0} mm²</span>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-600 font-medium">Çevre Uzunluğu</span>
                  <span className="text-lg font-bold text-blue-700">{result.metrikler?.cevre_mm || 0} mm</span>
                </div>

                <button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium shadow-md transition">
                  Raporu Onayla ve Kaydet
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default NewAnalysis;