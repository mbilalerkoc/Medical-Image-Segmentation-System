import React, { useState } from "react";
import { addPatient } from "../../../services/patientService";
import useToast from "../../../hooks/useToast";
import styles from "../PatientList.module.css";

const initialFormData = {
  ad: "",
  soyad: "",
  tc_kimlik: "",
  email: "",
  telefon: "",
  dogum_tarihi: "",
  kan_grubu: "",
  adres: "",
};

const PatientModal = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const data = await addPatient(formData);

      if (!data.basarili) {
        toast.error(data.mesaj || data.detay || "Hasta eklenemedi.");
        return;
      }

      setFormData(initialFormData);

      if (onSuccess) {
        await onSuccess(data.hasta);
      }
    } catch (error) {
      console.error("Hasta ekleme hatası:", error);

      toast.error(
        error.response?.data?.mesaj ||
          error.response?.data?.detay ||
          "Hasta eklenirken bir hata oluştu.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* HEADER */}
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Yeni Hasta Kaydı Oluştur</h3>

          <button
            type="button"
            onClick={onClose}
            className={styles.closeBtn}
            disabled={loading}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formGrid}>
            <div>
              <label className={styles.label}>Ad</label>
              <input
                type="text"
                name="ad"
                required
                value={formData.ad}
                onChange={handleInputChange}
                className={styles.input}
              />
            </div>

            <div>
              <label className={styles.label}>Soyad</label>
              <input
                type="text"
                name="soyad"
                required
                value={formData.soyad}
                onChange={handleInputChange}
                className={styles.input}
              />
            </div>

            <div>
              <label className={styles.label}>TC Kimlik No</label>
              <input
                type="text"
                name="tc_kimlik"
                required
                maxLength="11"
                value={formData.tc_kimlik}
                onChange={handleInputChange}
                className={styles.input}
              />
            </div>

            <div>
              <label className={styles.label}>E-posta</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={styles.input}
              />
            </div>

            <div>
              <label className={styles.label}>Telefon</label>
              <input
                type="text"
                name="telefon"
                value={formData.telefon}
                onChange={handleInputChange}
                className={styles.input}
              />
            </div>

            <div>
              <label className={styles.label}>Doğum Tarihi</label>
              <input
                type="date"
                name="dogum_tarihi"
                value={formData.dogum_tarihi}
                onChange={handleInputChange}
                className={styles.input}
              />
            </div>

            <div>
              <label className={styles.label}>Kan Grubu</label>
              <select
                name="kan_grubu"
                value={formData.kan_grubu}
                onChange={handleInputChange}
                className={styles.input}
              >
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
              <textarea
                name="adres"
                value={formData.adres}
                onChange={handleInputChange}
                rows="2"
                className={styles.input}
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className={styles.modalFooter}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelBtn}
              disabled={loading}
            >
              İptal
            </button>

            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? "Kaydediliyor..." : "Kaydet ve Davet Gönder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientModal;