import React, { useState } from 'react';
import { addPatient } from '../../../services/patientService';
import styles from '../PatientList.module.css';

const PatientModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ad: '', soyad: '', tc_kimlik: '', email: '', 
    telefon: '', dogum_tarihi: '', kan_grubu: '', adres: ''
  });

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = await addPatient(formData);

      if (data.basarili) {
        alert("Hasta başarıyla eklendi ve davet maili gönderildi!");
        // Formu temizle ve üst bileşene haber ver
        setFormData({ ad: '', soyad: '', tc_kimlik: '', email: '', telefon: '', dogum_tarihi: '', kan_grubu: '', adres: '' });
        onSuccess(); 
      }
    } catch (error) {
      alert(error.response?.data?.mesaj || error.response?.data?.detay || "Hasta eklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Yeni Hasta Kaydı Oluştur</h3>
          <button onClick={onClose} className={styles.closeBtn}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formGrid}>
            <div>
              <label className={styles.label}>Ad</label>
              <input type="text" name="ad" required value={formData.ad} onChange={handleInputChange} className={styles.input} />
            </div>
            <div>
              <label className={styles.label}>Soyad</label>
              <input type="text" name="soyad" required value={formData.soyad} onChange={handleInputChange} className={styles.input} />
            </div>
            <div>
              <label className={styles.label}>TC Kimlik No</label>
              <input type="text" name="tc_kimlik" required maxLength="11" value={formData.tc_kimlik} onChange={handleInputChange} className={styles.input} />
            </div>
            <div>
              <label className={styles.label}>E-posta</label>
              <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className={styles.input} />
            </div>
            <div>
              <label className={styles.label}>Telefon</label>
              <input type="text" name="telefon" value={formData.telefon} onChange={handleInputChange} className={styles.input} />
            </div>
            <div>
              <label className={styles.label}>Doğum Tarihi</label>
              <input type="date" name="dogum_tarihi" value={formData.dogum_tarihi} onChange={handleInputChange} className={styles.input} />
            </div>
            <div>
              <label className={styles.label}>Kan Grubu</label>
              <select name="kan_grubu" value={formData.kan_grubu} onChange={handleInputChange} className={styles.input}>
                <option value="">Seçiniz (opsiyonel)</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="0+">0+</option>
                <option value="0-">0-</option>
              </select>
            </div>
            <div className={styles.fullWidth}>
              <label className={styles.label}>Adres</label>
              <textarea name="adres" value={formData.adres} onChange={handleInputChange} rows="2" className={styles.input} />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>İptal</button>
            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? 'Kaydediliyor...' : 'Kaydet ve Davet Gönder'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default PatientModal;