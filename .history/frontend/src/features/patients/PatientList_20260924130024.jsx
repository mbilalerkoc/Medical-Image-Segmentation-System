import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getPatients } from '../../services/patientService';
import PatientModal from './components/PatientModal'; // Modalı içe aktardık
import styles from './PatientList.module.css'; // Yeni CSS'i bağladık

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const data = await getPatients();
      if (data.basarili) {
        setPatients(data.hastalar);
      }
    } catch (error) {
      console.error("Hastalar yüklenirken hata:", error);
    }
  };

  // Yeni kayıt eklendiğinde tetiklenecek fonksiyon
  const handleAddSuccess = () => {
    setShowModal(false);
    fetchPatients(); // Listeyi yenile
  };

  return (
    <DashboardLayout title="Hastalarım">
      <div className={styles.card}>
        
        <div className={styles.header}>
          <h2 className={styles.title}>Kayıtlı Hastalar</h2>
          <button onClick={() => setShowModal(true)} className={styles.addBtn}>
            + Yeni Hasta Ekle
          </button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>TC Kimlik</th>
                <th className={styles.th}>Ad Soyad</th>
                <th className={styles.th}>E-posta</th>
                <th className={styles.th}>Telefon</th>
                <th className={`${styles.th} text-center`}>Durum</th>
                <th className={`${styles.th} text-right`}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-400">Henüz kayıtlı hasta bulunmuyor.</td>
                </tr>
              ) : (
                patients.map((hasta) => (
                  <tr key={hasta.id} className={styles.tr}>
                    <td className={styles.td}>{hasta.tc_kimlik}</td>
                    <td className={styles.td} style={{ fontWeight: '600' }}>{hasta.ad} {hasta.soyad}</td>
                    <td className={styles.td}>{hasta.email}</td>
                    <td className={styles.td}>{hasta.telefon}</td>
                    <td className={`${styles.td} text-center`}>
                      <span className={hasta.User?.aktif ? styles.badgeActive : styles.badgePending}>
                        {hasta.User?.aktif ? 'Aktif' : 'Şifre Bekliyor'}
                      </span>
                    </td>
                    <td className={`${styles.td} text-right`}>
                      <button className={styles.detailBtn}>Detay</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dışarıdan çağırdığımız temiz modal bileşeni */}
      <PatientModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onSuccess={handleAddSuccess} 
      />
      
    </DashboardLayout>
  );
};

export default PatientList;