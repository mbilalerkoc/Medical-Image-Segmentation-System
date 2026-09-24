import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import UTIF from 'utif';
import html2pdf from 'html2pdf.js';
import DashboardLayout from '../../components/layout/DashboardLayout';
import styles from './NewAnalysis.module.css';

const NewAnalysis = () => {
  const [tcKimlik, setTcKimlik] = useState('');
  const [organ, setOrgan] = useState('beyin');
  const [model, setModel] = useState('unet');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [doktorKlinikId, setDoktorKlinikId] = useState('1'); 
  const [dragActive, setDragActive] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const [sliderVal, setSliderVal] = useState(50);
  const [isOverlayModalOpen, setIsOverlayModalOpen] = useState(false); // YENİ: Örtüştürme modalı state'i

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [doktorNotu, setDoktorNotu] = useState('');
  const [analizId, setAnalizId] = useState(null);
  const reportRef = useRef();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userObj = JSON.parse(userStr);
      if (userObj.klinik_id) setDoktorKlinikId(userObj.klinik_id);
    }
  }, []);

  const processFile = (selectedFile) => {
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

  const handleFileChange = (e) => {
    processFile(e.target.files[0]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
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
        setResult(response.data.sonuclar); 
        setAnalizId(response.data.analiz_id); 
      }
    } catch (err) {
      setError(err.response?.data?.mesaj || "Analiz sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndShare = async () => {
    if (!analizId) {
      alert("Hata: Analiz ID bulunamadı. Lütfen önce analiz işlemini tamamlayın.");
      return;
    }

    const userStr = localStorage.getItem('user');
    const doktorId = userStr ? JSON.parse(userStr).id : null;

    try {
      const TEST_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sIjoic3VwZXJhZG1pbiIsImlhdCI6MTc4OTkzMDgxNiwiZXhwIjoxNzkyNTIyODE2fQ.QVJEgEOsxfKx2jm0_0wbzlCVZhb0jExPQpGg_L_BVGQ"; 
      const payload = {
        tc_kimlik: tcKimlik,
        analiz_id: analizId,
        doktor_id: doktorId,
        pdf_yolu: 'Sistem üzerinden PDF alınabilir' 
      };

      const response = await axios.post(
        'http://localhost:5000/api/reports/create',
        payload,
        { headers: { 'Authorization': `Bearer ${TEST_TOKEN}` } }
      );

      if (response.data.basarili) {
        alert("Rapor başarıyla veritabanına kaydedildi ve hastanın paneline gönderildi!");
        setIsReportModalOpen(false); 
      }
    } catch (err) {
      alert("Rapor kaydı sırasında bir hata oluştu.");
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <DashboardLayout title="Yeni Analiz Başlat">
      <div className={styles.container}>
        
        {/* SOL: Yükleme Formu */}
        <div className={styles.formColumn}>
          <div className={styles.modernCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Yeni Analiz</h2>
              <p className={styles.cardDesc}>Hastanın MR/CT görüntüsünü yükleyerek yapay zeka analizini başlatın.</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.formBody}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Hasta TC Kimlik</label>
                <div className={styles.inputWrapper}>
                  <div className={styles.inputIcon}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                  </div>
                  <input type="text" maxLength="11" value={tcKimlik} onChange={(e) => setTcKimlik(e.target.value.replace(/\D/g, ''))} className={styles.modernInput} placeholder="11 Haneli TC Numarası" />
                </div>
              </div>

              <div className={styles.rowGroup}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>İncelenen Organ</label>
                  <select value={organ} onChange={(e) => setOrgan(e.target.value)} className={styles.modernSelect}>
                    <option value="beyin">Beyin (Brain)</option>
                    <option value="bobrek">Böbrek (Kidney)</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Yapay Zeka Modeli</label>
                  <select value={model} onChange={(e) => setModel(e.target.value)} className={styles.modernSelect}>
                    <option value="unet">U-Net (Hızlı)</option>
                    <option value="unet_plus">U-Net++ (Detaylı)</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Görüntü Yükle (MR / CT)</label>
                <div className={`${styles.dragDropZone} ${dragActive ? styles.dragActive : ''} ${preview ? styles.hasFile : ''}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
                  <input type="file" accept="image/*,.tif,.tiff" onChange={handleFileChange} className={styles.fileHidden} id="fileUpload" />
                  <label htmlFor="fileUpload" className={styles.dragDropContent}>
                    {!preview ? (
                      <>
                        <svg className={styles.cloudIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        <p className={styles.dragText}><span className={styles.highlightText}>Tıklayın</span> veya sürükleyin</p>
                        <p className={styles.fileHint}>TIFF, PNG, JPG desteklenir</p>
                      </>
                    ) : (
                      <div className={styles.miniPreviewContainer}>
                        <img src={preview} alt="Seçilen" className={styles.miniPreviewImg} />
                        <div className={styles.changeImageOverlay}><span>Resmi Değiştir</span></div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <button type="submit" disabled={loading} className={styles.submitBtnPremium}>
                {loading ? 'AI Modeli Analiz Ediyor...' : 'Segmentasyonu Başlat'}
              </button>
              
              {error && <div className={styles.errorBox}>{error}</div>}
            </form>
          </div>
        </div>

        {/* SAĞ: Sonuç ve Önizleme Ekranı */}
        <div className={styles.previewColumn}>
          <div className={styles.resultCard}>
            
            {!result && !preview && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIconPulse}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
                </div>
                <p>Analiz için görüntü bekleniyor</p>
              </div>
            )}

            {preview && !result && !loading && (
              <div className={styles.standbyState}>
                <h3 className={styles.standbyTitle}>Görüntü Hazır</h3>
                <div className={styles.standbyImageWrapper}>
                  <img src={preview} alt="Önizleme" className={styles.standbyImg} />
                </div>
                <p className={styles.standbyText}>Yapay zeka analizini başlatmak için butona tıklayın.</p>
              </div>
            )}

            {loading && (
              <div className={styles.loadingState}>
                <div className={styles.scannerWrapper}>
                  <img src={preview} alt="Analiz ediliyor" className={styles.scanningImg} />
                  <div className={styles.scannerLaser}></div>
                </div>
                <p className={styles.loadingText}>PathoVision AI modeli taramayı gerçekleştiriyor...</p>
              </div>
            )}

            {result && (
              <div className={styles.resultLayout}>
                <h3 className={styles.resultMainTitle}>Analiz Sonuçları</h3>
                
                {/* 1. ADIM: YAN YANA GÖRÜNÜM */}
                <div className={styles.sideBySideContainer}>
                  <div className={styles.sideImageWrapper}>
                    <span className={styles.imageTag}>Orijinal MR</span>
                    <img src={preview} alt="Orijinal" className={styles.sideImg} />
                  </div>
                  {result.maske_base64 && (
                    <div className={styles.sideImageWrapper}>
                      <span className={styles.imageTag}>AI Maskesi</span>
                      <img src={`data:image/png;base64,${result.maske_base64}`} alt="Maske" className={styles.sideImg} />
                    </div>
                  )}
                </div>

                {/* YENİ: ÖRTÜŞTÜR BUTONU */}
                {result.maske_base64 && (
                  <button onClick={() => setIsOverlayModalOpen(true)} className={styles.overlayBtn}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    Görüntüleri Örtüştür
                  </button>
                )}

                <div className={styles.metricsGrid}>
                  <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Patoloji / Tümör</span>
                    <span className={styles.metricValueRed}>%{result.metrikler?.patoloji_yuzdesi || 0}</span>
                  </div>
                  <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>AI Güven Skoru</span>
                    <span className={styles.metricValueGreen}>%{result.metrikler?.guven_skoru || 0}</span>
                  </div>
                  <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Fiziksel Alan</span>
                    <span className={styles.metricValueBlue}>{result.metrikler?.alan_mm2 || 0} <small>mm²</small></span>
                  </div>
                  <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Çevre Uzunluğu</span>
                    <span className={styles.metricValueBlue}>{result.metrikler?.cevre_mm || 0} <small>mm</small></span>
                  </div>
                </div>

                <button onClick={() => setIsReportModalOpen(true)} className={styles.approveBtn}>
                  Raporu Değerlendir & Kaydet
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* YENİ: GÖRÜNTÜ ÖRTÜŞTÜRME MODALI (SLIDER İÇERİR) */}
      {/* ============================================================== */}
      {isOverlayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col overflow-hidden">
            
            <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">MR ve AI Segmentasyon Örtüşmesi</h2>
              <button onClick={() => setIsOverlayModalOpen(false)} className="text-slate-400 hover:text-red-500 transition">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-8 bg-black flex justify-center items-center">
              <div className={styles.sliderContainer}>
                {/* Alt Katman: Orijinal MR */}
                <img src={preview} alt="Orijinal" className={styles.sliderImgBase} />
                
                {result?.maske_base64 && (
                  <>
                    {/* Üst Katman: clip-path ile sağdan kırpılıyor */}
                    <div 
                      className={styles.sliderOverlay} 
                      style={{ clipPath: `inset(0 ${100 - sliderVal}% 0 0)` }}
                    >
                      <img src={`data:image/png;base64,${result.maske_base64}`} alt="Maske" className={styles.sliderImgMask} />
                    </div>
                    {/* Mavi Kaydırma Çizgisi */}
                    <div className={styles.sliderLine} style={{ left: `${sliderVal}%` }}></div>
                  </>
                )}

                <input 
                  type="range" min="0" max="100" 
                  value={sliderVal} onChange={(e) => setSliderVal(e.target.value)} 
                  className={styles.sliderControl} 
                />
                
                <div className={styles.sliderLabels}>
                  <span className={styles.labelOrijinal}>Orijinal MR</span>
                  <span className={styles.labelMaske}>AI Segmentasyon (Tümör)</span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-200 text-center text-sm font-medium text-slate-600">
              Siyah maske arka planı saydamlaştırılarak orijinal beyin dokusu görünür hale getirilmiştir. <br/>
              Kesişimi detaylı incelemek için mavi çizgiyi sağa ve sola sürükleyin.
            </div>
          </div>
        </div>
      )}

      {/* Rapor Modalı (Aynı Bırakıldı) */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 print:bg-white print:p-0">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl flex flex-col print:shadow-none print:w-full print:max-w-none print:h-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 print:hidden">
              <h2 className="text-2xl font-bold text-slate-800">PathoVision Tıbbi Analiz Raporu</h2>
              <button onClick={() => setIsReportModalOpen(false)} className="text-slate-400 hover:text-red-500 transition">
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
              <button onClick={handleSaveAndShare} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-600/20">
                Veritabanına Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default NewAnalysis;