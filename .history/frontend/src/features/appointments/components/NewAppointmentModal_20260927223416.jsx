import React, { useEffect, useState } from "react";
import { getPatients } from "../../../services/patientService";
import {
  createAppointment,
  getAvailableSlots,
} from "../../../services/appointmentService";
import useToast from "../../../hooks/useToast";
import styles from "./NewAppointmentModal.module.css";

const NewAppointmentModal = ({ isOpen, onClose, onCreated }) => {
  const toast = useToast();

  const [patients, setPatients] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState("");

  const [form, setForm] = useState({
    hasta_id: "",
    tarih: "",
    saat: "",
    sure_dakika: "30",
    randevu_nedeni: "",
    notlar: "",
  });

  // HASTALARI GETİR
  useEffect(() => {
    if (!isOpen) return;

    const loadPatients = async () => {
      try {
        setLoadingPatients(true);

        const data = await getPatients();

        if (!data.basarili) {
          toast.error(data.mesaj || "Hastalar alınamadı.");
          return;
        }

        setPatients(data.hastalar || []);
      } catch (error) {
        console.error("Hasta yükleme hatası:", error);
        toast.error(
          error.response?.data?.mesaj ||
            "Hastalar yüklenirken bir hata oluştu.",
        );
      } finally {
        setLoadingPatients(false);
      }
    };

    loadPatients();
  }, [isOpen, toast]);

  // MÜSAİT SAATLERİ GETİR
  useEffect(() => {
    if (!isOpen || !form.tarih) {
      setSlots([]);
      return;
    }

    const loadSlots = async () => {
      try {
        setLoadingSlots(true);
        setForm((prev) => ({ ...prev, saat: "" }));

        const data = await getAvailableSlots(
          form.tarih,
          Number(form.sure_dakika),
        );

        if (!data.basarili) {
          setSlots([]);
          toast.error(data.mesaj || "Müsait saatler alınamadı.");
          return;
        }

        setSlots(data.saatler || []);
      } catch (error) {
        console.error("Müsait saat yükleme hatası:", error);
        setSlots([]);
        toast.error(
          error.response?.data?.mesaj ||
            "Müsait saatler alınırken bir hata oluştu.",
        );
      } finally {
        setLoadingSlots(false);
      }
    };

    loadSlots();
  }, [isOpen, form.tarih, form.sure_dakika, toast]);

  // MODAL KAPANINCA TEMİZLE
  useEffect(() => {
    if (isOpen) return;

    setForm({
      hasta_id: "",
      tarih: "",
      saat: "",
      sure_dakika: "30",
      randevu_nedeni: "",
      notlar: "",
    });

    setSlots([]);
    setValidationError("");
  }, [isOpen]);

  // INPUT DEĞİŞİKLİĞİ
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setValidationError("");
  };

  // BUGÜNÜN TARİHİ
  const getMinDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // RANDEVU OLUŞTUR
  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    if (!form.hasta_id) {
      setValidationError("Lütfen bir hasta seçin.");
      return;
    }

    if (!form.tarih) {
      setValidationError("Lütfen randevu tarihini seçin.");
      return;
    }

    if (!form.saat) {
      setValidationError("Lütfen müsait bir saat seçin.");
      return;
    }

    if (!form.sure_dakika || Number(form.sure_dakika) < 5) {
      setValidationError("Randevu süresi en az 5 dakika olmalıdır.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        hasta_id: Number(form.hasta_id),
        tarih_saat: `${form.tarih}T${form.saat}`,
        sure_dakika: Number(form.sure_dakika),
        randevu_nedeni: form.randevu_nedeni.trim(),
        notlar: form.notlar.trim(),
      };

      const data = await createAppointment(payload);

      if (!data.basarili) {
        toast.error(data.mesaj || "Randevu oluşturulamadı.");
        return;
      }

      if (onCreated) {
        await onCreated(data.randevu);
      }

      onClose();
    } catch (error) {
      console.error("Randevu oluşturma hatası:", error);

      toast.error(
        error.response?.data?.mesaj ||
          "Randevu oluşturulurken bir hata oluştu.",
      );

      if (form.tarih) {
        try {
          const slotData = await getAvailableSlots(
            form.tarih,
            Number(form.sure_dakika),
          );

          setSlots(slotData.saatler || []);
          setForm((prev) => ({ ...prev, saat: "" }));
        } catch {
          // Ana hata toast mesajını koruyoruz.
        }
      }
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onMouseDown={onClose}>
      <div
        className={styles.modalCard}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className={styles.modalHeader}>
          <div>
            <span className={styles.modalLabel}>Randevu Yönetimi</span>
            <h2>Yeni Randevu</h2>
            <p>Hastanız için uygun tarih ve saati seçerek randevu oluşturun.</p>
          </div>

          <button
            type="button"
            className={styles.modalClose}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          {/* HASTA */}
          <div className={styles.modalFormGroup}>
            <label>Hasta</label>

            <select
              name="hasta_id"
              value={form.hasta_id}
              onChange={handleChange}
              disabled={loadingPatients}
            >
              <option value="">
                {loadingPatients ? "Hastalar yükleniyor..." : "Hasta seçiniz"}
              </option>

              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.ad} {patient.soyad}
                  {patient.tc_kimlik ? ` - ${patient.tc_kimlik}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* TARİH VE SÜRE */}
          <div className={styles.modalFormGrid}>
            <div className={styles.modalFormGroup}>
              <label>Randevu Tarihi</label>

              <input
                type="date"
                name="tarih"
                value={form.tarih}
                min={getMinDate()}
                onChange={handleChange}
              />
            </div>

            <div className={styles.modalFormGroup}>
              <label>Randevu Süresi</label>

              <select
                name="sure_dakika"
                value={form.sure_dakika}
                onChange={handleChange}
              >
                <option value="15">15 dakika</option>
                <option value="20">20 dakika</option>
                <option value="30">30 dakika</option>
                <option value="45">45 dakika</option>
                <option value="60">60 dakika</option>
              </select>
            </div>
          </div>

          {/* MÜSAİT SAATLER */}
          <div className={styles.modalFormGroup}>
            <label>Müsait Saatler</label>

            {!form.tarih ? (
              <div className={styles.slotInfo}>
                Önce randevu tarihini seçiniz.
              </div>
            ) : loadingSlots ? (
              <div className={styles.slotInfo}>
                Müsait saatler kontrol ediliyor...
              </div>
            ) : slots.length === 0 ? (
              <div className={styles.noSlots}>
                Bu tarih ve süre için müsait saat bulunmuyor.
              </div>
            ) : (
              <div className={styles.slotGrid}>
                {slots.map((slot) => (
                  <button
                    key={`${slot.baslangic}-${slot.bitis}`}
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        saat: slot.baslangic,
                      }));
                      setValidationError("");
                    }}
                    className={`${styles.slotButton} ${
                      form.saat === slot.baslangic ? styles.slotSelected : ""
                    }`}
                  >
                    <strong>{slot.baslangic}</strong>
                    <span>{slot.bitis}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SEÇİLEN RANDEVU */}
          {form.tarih && form.saat && (
            <div className={styles.selectedAppointment}>
              <span>Seçilen randevu</span>

              <strong>
                {new Date(`${form.tarih}T12:00:00`).toLocaleDateString(
                  "tr-TR",
                  {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  },
                )}
                {" • "}
                {form.saat}
                {" • "}
                {form.sure_dakika} dakika
              </strong>
            </div>
          )}

          {/* RANDEVU NEDENİ */}
          <div className={styles.modalFormGroup}>
            <label>Randevu Nedeni</label>

            <input
              type="text"
              name="randevu_nedeni"
              value={form.randevu_nedeni}
              onChange={handleChange}
              maxLength="255"
              placeholder="Örn: Beyin MR kontrolü"
            />
          </div>

          {/* NOT */}
          <div className={styles.modalFormGroup}>
            <label>Doktor Notu</label>

            <textarea
              name="notlar"
              value={form.notlar}
              onChange={handleChange}
              rows="4"
              placeholder="Randevu ile ilgili ek not..."
            />
          </div>

          {validationError && (
            <div className={styles.modalError}>{validationError}</div>
          )}

          {/* FOOTER */}
          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={saving}
            >
              Vazgeç
            </button>

            <button
              type="submit"
              className={styles.createButton}
              disabled={
                saving || loadingPatients || loadingSlots || !form.saat
              }
            >
              {saving ? "Randevu Oluşturuluyor..." : "Randevu Oluştur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewAppointmentModal;