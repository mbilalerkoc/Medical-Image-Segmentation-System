import React, { useState } from 'react';
import styles from '../NewAnalysis.module.css';

const AnalysisForm = ({ 
  tcKimlik, setTcKimlik, organ, setOrgan, model, setModel, 
  preview, loading, error, processFile, handleSubmit 
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
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
              <input type="file" accept="image/*,.tif,.tiff" onChange={(e) => processFile(e.target.files[0])} className={styles.fileHidden} id="fileUpload" />
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
  );
};

export default AnalysisForm;