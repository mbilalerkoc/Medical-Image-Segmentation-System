import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import styles from './DoctorDashboard.module.css';

const DoctorDashboard = () => {
  const [klinikAdi, setKlinikAdi] = useState('Klinik Yükleniyor...');
  const [doktorUnvan, setDoktorBilgisi] = useState('Doktor Yükleniyor...');
  
  const [recentAnalyses] = useState([ /* ... */ ]);

  // 2. Sayfa açıldığında (mount olduğunda) local'den veriyi çek
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    
    if (userStr) {
      const userObj = JSON.parse(userStr);
      
      // Eğer login işleminde backend klinik adını gönderiyorsa:
      if (userObj.klinik_adi) {
        setKlinikAdi(userObj.klinik_adi);
      } 
      // Sadece ID dönüyorsa geçici olarak ID'yi gösterelim:
      else if (userObj.klinik_id) {
        setKlinikAdi(`Klinik ID: ${userObj.klinik_id}`);
      }

      const unvan = userObj.unvan ? userObj.unvan : 'Unvan Yüklenemedi
    }
  }, []);

  return (
    <DashboardLayout title={`Doktor Paneli | ${klinikAdi}`} >
      <div className={styles.dashboardWrapper}>
        
        {/* Dekoratif Arka Plan */}
        <div className={styles.backgroundDecor}>
          <div className={styles.gridPattern}></div>
          <div className={styles.glowCyan}></div>
          <div className={styles.glowBlue}></div>
        </div>

        {/* İstatistik Kartları */}
        <div className={styles.statsGrid}>
          
          {/* Kart 1: Toplam Analiz */}
          <div className={`${styles.statCard} ${styles.cardCyan}`}>
            <div className={`${styles.cardGlow} ${styles.bgGlowCyan}`}></div>
            <div className={styles.statHeader}>
              <div>
                <p className={styles.statTitle}>Toplam Analiz</p>
                <h3 className={styles.statValue}>128</h3>
              </div>
              <div className={`${styles.iconWrapper} ${styles.iconCyan}`}>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
            </div>
            <div className={styles.statFooter}>
              <span style={{ color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                +12%
              </span>
              <span style={{ marginLeft: '8px', color: '#94a3b8' }}>geçen haftaya göre</span>
            </div>
          </div>

          {/* Kart 2: Tamamlanan */}
          <div className={`${styles.statCard} ${styles.cardEmerald}`}>
            <div className={`${styles.cardGlow} ${styles.bgGlowEmerald}`}></div>
            <div className={styles.statHeader}>
              <div>
                <p className={styles.statTitle}>Tamamlanan</p>
                <h3 className={styles.statValue}>124</h3>
              </div>
              <div className={`${styles.iconWrapper} ${styles.iconEmerald}`}>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
            <div className={styles.statFooter}>
              <span style={{ color: '#10b981', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '6px', border: '1px solid #d1fae5' }}>
                %96.8 Başarı Oranı
              </span>
            </div>
          </div>

          {/* Kart 3: Bekleyen */}
          <div className={`${styles.statCard} ${styles.cardAmber}`}>
            <div className={`${styles.cardGlow} ${styles.bgGlowAmber}`}></div>
            <div className={styles.statHeader}>
              <div>
                <p className={styles.statTitle}>Bekleyen İşlem</p>
                <h3 className={styles.statValue}>4</h3>
              </div>
              <div className={`${styles.iconWrapper} ${styles.iconAmber}`}>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
            <div className={styles.statFooter} style={{ color: '#d97706' }}>
              <span className={`${styles.dot} ${styles.dotPending}`} style={{ marginRight: '8px' }}></span>
              Sırada bekleyen analizler var
            </div>
          </div>

        </div>

        {/* Son Analizler Tablosu */}
        <div className={styles.tableCard}>
          
          <div className={styles.tableHeaderArea}>
            <div className={styles.tableTitleWrapper}>
              <div className={`${styles.iconWrapper} ${styles.iconCyan}`} style={{ width: '40px', height: '40px' }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
              </div>
              <div>
                <h2 className={styles.tableTitle}>Son Analizler</h2>
                <p className={styles.tableSubtitle}>Sisteme yüklenen en güncel tarama sonuçları</p>
              </div>
            </div>
            
            <button className={styles.actionBtn}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
              <span>Yeni Görüntü Yükle</span>
            </button>
          </div>
          
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Hasta Bilgisi</th>
                  <th>Organ / AI Model</th>
                  <th>Kayıt Tarihi</th>
                  <th>İşlem Durumu</th>
                  <th>Segmentasyon Sonucu</th>
                </tr>
              </thead>
              <tbody>
                {recentAnalyses.map((analiz) => (
                  <tr key={analiz.id}>
                    <td style={{ fontWeight: 'bold', color: '#334155' }}>{analiz.hasta}</td>
                    <td>
                      <span className={styles.organBadge}>{analiz.organ}</span>
                      <span className={styles.modelBadge}>{analiz.model}</span>
                    </td>
                    <td style={{ color: '#64748b', fontWeight: '500' }}>{analiz.tarih}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${analiz.durum === 'Tamamlandı' ? styles.statusCompleted : styles.statusPending}`}>
                        <span className={`${styles.dot} ${analiz.durum === 'Tamamlandı' ? styles.dotCompleted : styles.dotPending}`}></span>
                        {analiz.durum}
                      </span>
                    </td>
                    <td>
                      {analiz.sonuc !== '-' ? (
                        <span style={{ fontWeight: 'bold', color: '#1e293b', backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          {analiz.sonuc}
                        </span>
                      ) : (
                        <span style={{ color: '#cbd5e1', fontWeight: '500' }}>Bekleniyor...</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className={styles.systemStatusFooter}>
             <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
               <span className={`${styles.dot} ${styles.dotPending}`} style={{ backgroundColor: '#22d3ee' }}></span>
               Model Sunucusu Aktif
             </span>
             <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
               <span className={styles.dot} style={{ backgroundColor: '#34d399' }}></span>
               Veritabanı Senkronize
             </span>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;