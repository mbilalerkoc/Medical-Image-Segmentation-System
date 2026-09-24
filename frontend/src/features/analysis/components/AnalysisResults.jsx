import React from 'react';
import styles from '../NewAnalysis.module.css';

const AnalysisResults = ({ result, preview, loading, processedMask, onOpenOverlay, onOpenReport }) => {
  return (
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
            
            <div className={styles.sideBySideContainer}>
              <div className={styles.sideImageWrapper}>
                <span className={styles.imageTag}>Orijinal MR</span>
                <img src={preview} alt="Orijinal" className={styles.sideImg} />
              </div>
              {result.maske_base64 && (
                <div className={styles.sideImageWrapper}>
                  <span className={styles.imageTag}>AI Maskesi</span>
                  <img src={processedMask || `data:image/png;base64,${result.maske_base64}`} alt="Maske" className={styles.sideImg} />
                </div>
              )}
            </div>

            {result.maske_base64 && (
              <button onClick={onOpenOverlay} className={styles.overlayBtn}>
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

            <button onClick={onOpenReport} className={styles.approveBtn}>
              Raporu Değerlendir & Kaydet
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResults;