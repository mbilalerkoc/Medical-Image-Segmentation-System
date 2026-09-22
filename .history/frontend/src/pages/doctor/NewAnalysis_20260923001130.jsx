import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UTIF from 'utif';
import DashboardLayout from '../../components/layout/DashboardLayout';
import styles from './NewAnalysis.module.css';

const NewAnalysis = () => {
  // Form State'leri (ID ve Klinik kaldırıldı, TC eklendi)
  const [tcKimlik, setTcKimlik] = useState('');
  const [organ, setOrgan] = useState('beyin');
  const [model, setModel] = useState('unet');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  
  // Arka planda tutulacak Doktor/Klinik verisi
  const [doktorKlinikId, setDoktorKlinikId] = useState('1'); 

  // İşlem Durumu State'leri
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Component yüklendiğinde doktorun bilgilerini local'den al
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userObj = JSON.parse(userStr);
      // Eğer backend'den klinik_id geliyorsa onu al, yoksa varsayılan 1
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

    // TIFF format çözümü
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
          console.error("TIFF dönüştürme hatası:", err);
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
    
    // Hasta TC kontrolü (11 hane)
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
    // Artık backend'e hasta_id yerine tc_kimlik gönderiyoruz
    formData.append('tc_kimlik', tcKimlik);
    // Doktorun kliniğini arka planda otomatik ekliyoruz (Kullanıcı görmüyor)
    formData.append('klinik_id', doktorKlinikId);
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
        setResult(response.data.sonuclar);
      }
    } catch (err) {
      setError(err.response?.data?.mesaj || "Analiz sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
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
                <input 
                  type="text" 
                  maxLength="11"
                  value={tcKimlik} 
                  onChange={(e) => setTcKimlik(e.target.value.replace(/\D/g, ''))} // Sadece rakam girişi
                  className={styles.input} 
                  placeholder="11 haneli TC giriniz" 
                />
              </div>

              {/* Klinik ID inputu tamamen kaldırıldı */}

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
                <input 
                  type="file" 
                  accept="image/*,.tif,.tiff" 
                  onChange={handleFileChange} 
                  className={styles.fileInput} 
                />
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

                  <button className={styles.approveBtn}>
                    Rapor Olu
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default NewAnalysis;