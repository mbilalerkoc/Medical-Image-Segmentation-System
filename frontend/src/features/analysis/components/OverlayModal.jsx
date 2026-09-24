import React, { useState } from 'react';
import styles from '../NewAnalysis.module.css';

const OverlayModal = ({ isOpen, onClose, preview, processedMask }) => {
  const [sliderVal, setSliderVal] = useState(50);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">MR ve AI Segmentasyon Örtüşmesi</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-8 bg-black flex justify-center items-center">
          <div className={styles.sliderContainer}>
            <img src={preview} alt="Orijinal" className={styles.sliderImgBase} />
            
            {processedMask && (
              <>
                <div className={styles.sliderOverlay} style={{ clipPath: `inset(0 ${100 - sliderVal}% 0 0)` }}>
                  <img src={processedMask} alt="AI Segmentasyon" className={styles.sliderImgMask} />
                </div>
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
  );
};

export default OverlayModal;