import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import UTIF from 'utif';
import DashboardLayout from '../../components/layout/DashboardLayout';
import styles from './NewAnalysis.module.css';

const NewAnalysis = () => {
  const [tcKimlik, setTcKimlik] = useState('');
  const [organ, setOrgan] = useState('beyin');
  const [model, setModel] = useState('unet');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [doktorKlinikId, setDoktorKlinikId] = useState('1'); 

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // --- YENİ EKLENEN STATE'LER (RAPOR MODALI İÇİN) ---
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [doktorNotu, setDoktorNotu] = useState('');
  const [analizId, setAnalizId] = useState(null);
  const reportRef = useRef(); // PDF çıktısı alınacak alanı referans gösterir

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userObj = JSON.parse(userStr);
      if (userObj.klinik_id) setDoktorKlinikId(userObj.klinik_id);
    }
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (!selectedFile) {
      setPreview(null);
      return;
    }
    const fileName = selectedFile.name.toLowerCase();

    if (fileName.endsWith('.tif') || fileName.endsWith('.tiff')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const buffer = event.target.result;
          const ifds = UTIF.decode(buffer);
          UTIF.decodeImage(buffer, ifds[0]);
          const rgba = UTIF.toRGBA8(ifds[0]);
          const canvas = document.createElement('canvas');
          canvas.width = ifds[0].width;
          canvas.height = ifds[0].height;
          const ctx = canvas.getContext('2d');
          const imageData = ctx.createImageData(canvas.width, canvas.height);
          imageData.data.set(rgba);
          ctx.putImageData(imageData, 0, 0);
          setPreview(canvas.toDataURL('image/png'));
        } catch (err) {
          setError("TIFF dosyası önizlenemedi, ancak analiz için gönderilebilir.");
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tcKimlik || tcKimlik.length !== 11) {
      setError("Lütfen 11 haneli Hasta TC Kimlik numarasını giriniz.");
      return;
    }
    if (!file) {
      setError("Lütfen analiz edilecek bir resim seçin.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('tc_kimlik', tcKimlik);
    formData.append('klinik_id', doktorKlinikId);
    formData.append('organ', organ);
    formData.append('sira_no', '1');
    formData.append('file', file);

    try {
      const TEST_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sIjoic3VwZXJhZG1pbiIsImlhdCI6MTc4OTkzMDgxNiwiZXhwIjoxNzkyNTIyODE2fQ.QVJEgEOsxfKx2jm0_0wbzlCVZhb0jExPQpGg_L_BVGQ"; 
      const response = await axios.post(
        `http://localhost:5000/api/analyze/predict/${model}`,
        formData,
        { headers: { 'Authorization': `Bearer ${TEST_TOKEN}`, 'Content-Type': 'multipart/form-data' } }
      );
      if (response.data.basarili) {
        setResult(response.data.sonuclar); // Görüntüleri ve metrikleri kaydet
        setAnalizId(response.data.analiz_id); // Backend'den dönen ID'yi YENİ state'e kaydet
      }
    } catch (err) {
      setError(err.response?.data?.mesaj || "Analiz sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // --- YENİ EKLENEN FONKSİYONLAR ---
  const handleSaveAndShare = async () => {
    // result.analiz_id yerine sadece analizId kullanıyoruz
    if (!analizId) {
      alert("Hata: Analiz ID bulunamadı. Lütfen önce analiz işlemini tamamlayın.");
      return;
    }

    try {
      const TEST_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sIjoic3VwZXJhZG1pbiIsImlhdCI6MTc4OTkzMDgxNiwiZXhwIjoxNzkyNTIyODE2fQ.QVJEgEOsxfKx2jm0_0wbzlCVZhb0jExPQpGg_L_BVGQ"; 
      
      const payload = {
        tc_kimlik: tcKimlik,
        analiz_id: analizId, // Güncellenen kısım
        doktor_notu: doktorNotu
      };

      const response = await axios.post(
        'http://localhost:5000/api/reports/create',
        payload,
        { headers: { 'Authorization': `Bearer ${TEST_TOKEN}` } }
      );

      if (response.data.basarili) {
        alert("Rapor başarıyla veritabanına kaydedildi ve hastanın paneline iletildi!");
        setIsReportModalOpen(false); 
      }
    } catch (err) {
      console.error("Rapor kaydetme hatası:", err);
      alert("Rapor kaydedilirken sunucu hatası oluştu.");
    }
  };

  const handleSaveAndShare = async () => {
    if (!result?.analiz_id) {
      alert("Hata: Analiz ID bulunamadı.");
      return;
    }

    try {
      const TEST_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sIjoic3VwZXJhZG1pbiIsImlhdCI6MTc4OTkzMDgxNiwiZXhwIjoxNzkyNTIyODE2fQ.QVJEgEOsxfKx2jm0_0wbzlCVZhb0jExPQpGg_L_BVGQ"; 
      
      const payload = {
        tc_kimlik: tcKimlik,
        analiz_id: result.analiz_id,
        doktor_notu: doktorNotu
      };

      const response = await axios.post(
        'http://localhost:5000/api/reports/create',
        payload,
        { headers: { 'Authorization': `Bearer ${TEST_TOKEN}` } }
      );

      if (response.data.basarili) {
        alert("Rapor başarıyla veritabanına kaydedildi ve hastanın paneline iletildi!");
        setIsReportModalOpen(false); // Başarılı olunca pop-up'ı kapat
      }
    } catch (err) {
      console.error("Rapor kaydetme hatası:", err);
      alert("Rapor kaydedilirken sunucu hatası oluştu.");
    }
  };

  return (
    <DashboardLayout title="Yeni Analiz Başlat">
      <div className={styles.container}>
        
        {/* SOL: Yükleme Formu */}
        <div className={styles.formColumn}>
          <div className={`${styles.card} ${styles.formCard}`}>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Hasta TC Kimlik No</label>
                <input type="text" maxLength="11" value={tcKimlik} onChange={(e) => setTcKimlik(e.target.value.replace(/\D/g, ''))} className={styles.input} placeholder="11 haneli TC giriniz" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Organ</label>
                <select value={organ} onChange={(e) => setOrgan(e.target.value)} className={styles.select}>
                  <option value="beyin">Beyin</option>
                  <option value="bobrek">Böbrek</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Yapay Zeka Modeli</label>
                <select value={model} onChange={(e) => setModel(e.target.value)} className={styles.select}>
                  <option value="unet">U-Net (Hızlı)</option>
                  <option value="unet_plus">U-Net++ (Detaylı)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>MR/CT Görseli</label>
                <input type="file" accept="image/*,.tif,.tiff" onChange={handleFileChange} className={styles.fileInput} />
              </div>

              <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? 'Yapay Zeka Analiz Ediyor...' : 'Analizi Başlat'}
              </button>
              
              {error && <div className={styles.errorBox}>{error}</div>}
            </form>
          </div>
        </div>

        {/* SAĞ: Sonuç ve Önizleme Ekranı */}
        <div className={styles.previewColumn}>
          <div className={`${styles.card} ${styles.previewCard}`}>
            
            {!result && !preview && (
              <div className={styles.emptyState}>
                <span className={styles.emptyStateIcon}>📷</span>
                Lütfen analiz edilecek görseli seçin
              </div>
            )}

            {preview && !result && !loading && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#475569', fontWeight: '500', marginBottom: '0.75rem' }}>Görsel Önizlemesi</p>
                <img src={preview} alt="Önizleme" className={styles.previewImg} />
              </div>
            )}

            {loading && (
              <div className={styles.loadingState}>
                <span className={styles.loadingIcon}>🧠</span>
                <p style={{ fontWeight: '600', fontSize: '1.125rem' }}>Python Modeli İşliyor...</p>
              </div>
            )}

            {result && (
              <div className={styles.resultLayout}>
                <div className={styles.imageColumn}>
                  <div className={styles.imageWrapper}>
                    <img src={preview} alt="Orijinal" className={styles.previewImg} />
                    <span className={`${styles.imageTag} ${styles.tagOriginal}`}>Orijinal</span>
                  </div>
                  
                  {result.maske_base64 && (
                    <div className={styles.imageWrapper}>
                      <img src={`data:image/png;base64,${result.maske_base64}`} alt="Maske" className={styles.previewImg} />
                      <span className={`${styles.imageTag} ${styles.tagMask}`}>AI Maskesi</span>
                    </div>
                  )}
                </div>

                <div className={styles.metricsColumn}>
                  <h3 className={styles.reportTitle}>Analiz Raporu</h3>
                  
                  <div className={styles.metricRow}>
                    <span className={styles.metricLabel}>Patoloji / Tümör</span>
                    <span className={styles.metricValueRed}>%{result.metrikler?.patoloji_yuzdesi || 0}</span>
                  </div>
                  
                  <div className={styles.metricRow}>
                    <span className={styles.metricLabel}>AI Güven Skoru</span>
                    <span className={styles.metricValueGreen}>%{result.metrikler?.guven_skoru || 0}</span>
                  </div>

                  <div className={styles.metricRow}>
                    <span className={styles.metricLabel}>Fiziksel Alan</span>
                    <span className={styles.metricValueBlue}>{result.metrikler?.alan_mm2 || 0} mm²</span>
                  </div>

                  <div className={styles.metricRow}>
                    <span className={styles.metricLabel}>Çevre Uzunluğu</span>
                    <span className={styles.metricValueBlue}>{result.metrikler?.cevre_mm || 0} mm</span>
                  </div>

                  {/* YENİ: Rapor Oluştur Butonu Modalı Açar */}
                  <button 
                    onClick={() => setIsReportModalOpen(true)}
                    className={styles.approveBtn}
                  >
                    Rapor Oluştur ve Değerlendir
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* RAPOR OLUŞTURMA MODALI (POP-UP) */}
      {/* ============================================================== */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 print:bg-white print:p-0">
          
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl flex flex-col print:shadow-none print:w-full print:max-w-none print:h-auto">
            
            {/* Modal Başlık */}
            <div className="flex justify-between items-center p-6 border-b border-slate-200 print:hidden">
              <h2 className="text-2xl font-bold text-slate-800">PathoVision Tıbbi Analiz Raporu</h2>
              <button onClick={() => setIsReportModalOpen(false)} className="text-slate-400 hover:text-red-500 transition">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Rapor İçeriği (Yazdırılacak Alan) */}
            <div ref={reportRef} className="p-8 flex-1 print:p-0">
              
              {/* Rapor Antetli Başlık (Sadece PDF/Yazdırma Ekranında Şık Görünür) */}
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
                {/* Sol: Görüntüler */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Görüntüleme Sonuçları</h3>
                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <p className="text-xs font-semibold text-slate-500 mb-1">Orijinal Tarama</p>
                      <img src={preview} alt="Orijinal" className="w-full h-48 object-contain bg-black rounded-lg" />
                    </div>
                    <div className="w-1/2">
                      <p className="text-xs font-semibold text-blue-600 mb-1">AI Segmentasyon Maskesi</p>
                      <img src={`data:image/png;base64,${result?.maske_base64}`} alt="Maske" className="w-full h-48 object-contain bg-black rounded-lg border-2 border-blue-500" />
                    </div>
                  </div>
                </div>

                {/* Sağ: Metrikler */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Sayısal Bulgular</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <p className="text-xs text-slate-500 font-medium">Patoloji / Tümör Oranı</p>
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

              {/* Doktor Notu Alanı */}
              <div className="mt-6">
                <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Doktor Değerlendirmesi ve Teşhis</h3>
                <textarea 
                  value={doktorNotu}
                  onChange={(e) => setDoktorNotu(e.target.value)}
                  placeholder="Hastanın durumu ile ilgili tıbbi teşhisinizi ve notlarınızı buraya giriniz..."
                  className="w-full h-32 p-4 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none print:hidden"
                ></textarea>
                {/* Yazdırma ekranında textarea yerine sadece metin görünür */}
                <p className="hidden print:block text-slate-800 whitespace-pre-wrap">{doktorNotu || "Doktor tarafından henüz not girilmemiştir."}</p>
              </div>

            </div>

            {/* Modal Alt Butonlar (Yazdırma Ekranında Gizlenir) */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-4 rounded-b-2xl print:hidden">
              <button 
                onClick={handlePrintPDF}
                className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                PDF Olarak İndir / Yazdır
              </button>
              
              <button 
                onClick={handleSaveAndShare}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-600/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                Kaydet ve Hastaya Gönder
              </button>
            </div>

          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default NewAnalysis;