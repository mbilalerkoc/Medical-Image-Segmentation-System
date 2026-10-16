import React, {
  useEffect,
  useState,
} from "react";

import {
  getPatients,
} from "../../../services/patientService";

import {
  createAppointment,
} from "../../../services/appointmentService";

import styles from "../Appointments.module.css";

const NewAppointmentModal = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [patients, setPatients] =
    useState([]);

  const [loadingPatients, setLoadingPatients] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [form, setForm] =
    useState({
      hasta_id: "",
      tarih_saat: "",
      sure_dakika: "30",
      randevu_nedeni: "",
      notlar: "",
    });

  // =====================================================
  // MODAL AÇILINCA HASTALARI GETİR
  // =====================================================

  useEffect(() => {
    if (!isOpen) return;

    const loadPatients = async () => {
      try {
        setLoadingPatients(true);
        setError("");

        const data =
          await getPatients();

        if (!data.basarili) {
          setError(
            data.mesaj ||
              "Hastalar alınamadı."
          );

          return;
        }

        setPatients(
          data.hastalar || []
        );
      } catch (error) {
        console.error(
          "Hasta yükleme hatası:",
          error
        );

        setError(
          error.response?.data?.mesaj ||
            "Hastalar yüklenirken bir hata oluştu."
        );
      } finally {
        setLoadingPatients(false);
      }
    };

    loadPatients();

  }, [isOpen]);

  // =====================================================
  // MODAL KAPANINCA FORMU TEMİZLE
  // =====================================================

  useEffect(() => {
    if (isOpen) return;

    setForm({
      hasta_id: "",
      tarih_saat: "",
      sure_dakika: "30",
      randevu_nedeni: "",
      notlar: "",
    });

    setError("");
  }, [isOpen]);

  // =====================================================
  // INPUT
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // =====================================================
  // EN ERKEN TARİH
  // =====================================================

  const getMinDateTime = () => {
    const now =
      new Date();

    const localDate =
      new Date(
        now.getTime() -
          now.getTimezoneOffset() *
            60000
      );

    return localDate
      .toISOString()
      .slice(0, 16);
  };

  // =====================================================
  // RANDEVU OLUŞTUR
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.hasta_id) {
      setError(
        "Lütfen bir hasta seçin."
      );

      return;
    }

    if (!form.tarih_saat) {
      setError(
        "Lütfen randevu tarih ve saatini seçin."
      );

      return;
    }

    if (
      !form.sure_dakika ||
      Number(form.sure_dakika) < 5
    ) {
      setError(
        "Randevu süresi en az 5 dakika olmalıdır."
      );

      return;
    }

    try {
      setSaving(true);

      const payload = {
        hasta_id:
          Number(form.hasta_id),

        tarih_saat:
          form.tarih_saat,

        sure_dakika:
          Number(
            form.sure_dakika
          ),

        randevu_nedeni:
          form.randevu_nedeni.trim(),

        notlar:
          form.notlar.trim(),
      };

      const data =
        await createAppointment(
          payload
        );

      if (!data.basarili) {
        setError(
          data.mesaj ||
            "Randevu oluşturulamadı."
        );

        return;
      }

      if (onCreated) {
        onCreated(
          data.randevu
        );
      }

      onClose();

    } catch (error) {
      console.error(
        "Randevu oluşturma hatası:",
        error
      );

      setError(
        error.response?.data?.mesaj ||
          "Randevu oluşturulurken bir hata oluştu."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={
        styles.modalOverlay
      }
      onMouseDown={onClose}
    >
      <div
        className={
          styles.modalCard
        }
        onMouseDown={(e) =>
          e.stopPropagation()
        }
      >

        {/* HEADER */}

        <div
          className={
            styles.modalHeader
          }
        >
          <div>
            <span
              className={
                styles.modalLabel
              }
            >
              Randevu Yönetimi
            </span>

            <h2>
              Yeni Randevu
            </h2>

            <p>
              Hastanız için yeni bir
              randevu oluşturun.
            </p>
          </div>

          <button
            type="button"
            className={
              styles.modalClose
            }
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* FORM */}

        <form
          onSubmit={
            handleSubmit
          }
          className={
            styles.modalBody
          }
        >

          {/* HASTA */}

          <div
            className={
              styles.modalFormGroup
            }
          >
            <label>
              Hasta
            </label>

            <select
              name="hasta_id"
              value={
                form.hasta_id
              }
              onChange={
                handleChange
              }
              disabled={
                loadingPatients
              }
            >
              <option value="">
                {loadingPatients
                  ? "Hastalar yükleniyor..."
                  : "Hasta seçiniz"}
              </option>

              {patients.map(
                (patient) => (
                  <option
                    key={
                      patient.id
                    }
                    value={
                      patient.id
                    }
                  >
                    {patient.ad}{" "}
                    {patient.soyad} -{" "}
                    {patient.tc_kimlik}
                  </option>
                )
              )}
            </select>
          </div>

          {/* TARİH + SÜRE */}

          <div
            className={
              styles.modalFormGrid
            }
          >

            <div
              className={
                styles.modalFormGroup
              }
            >
              <label>
                Tarih ve Saat
              </label>

              <input
                type="datetime-local"
                name="tarih_saat"
                value={
                  form.tarih_saat
                }
                min={
                  getMinDateTime()
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div
              className={
                styles.modalFormGroup
              }
            >
              <label>
                Randevu Süresi
              </label>

              <select
                name="sure_dakika"
                value={
                  form.sure_dakika
                }
                onChange={
                  handleChange
                }
              >
                <option value="15">
                  15 dakika
                </option>

                <option value="20">
                  20 dakika
                </option>

                <option value="30">
                  30 dakika
                </option>

                <option value="45">
                  45 dakika
                </option>

                <option value="60">
                  60 dakika
                </option>
              </select>
            </div>

          </div>

          {/* NEDEN */}

          <div
            className={
              styles.modalFormGroup
            }
          >
            <label>
              Randevu Nedeni
            </label>

            <input
              type="text"
              name="randevu_nedeni"
              value={
                form.randevu_nedeni
              }
              onChange={
                handleChange
              }
              maxLength="255"
              placeholder="Örn: Beyin MR kontrolü"
            />
          </div>

          {/* NOT */}

          <div
            className={
              styles.modalFormGroup
            }
          >
            <label>
              Doktor Notu
            </label>

            <textarea
              name="notlar"
              value={
                form.notlar
              }
              onChange={
                handleChange
              }
              rows="4"
              placeholder="Randevu ile ilgili ek not..."
            />
          </div>

          {/* UYARI */}

          <div
            className={
              styles.availabilityInfo
            }
          >
            <div>
              i
            </div>

            <p>
              Seçtiğiniz saat doktorun
              çalışma saatleri dışında
              veya başka bir randevuyla
              çakışıyorsa sistem
              randevuyu oluşturmayacaktır.
            </p>
          </div>

          {/* ERROR */}

          {error && (
            <div
              className={
                styles.modalError
              }
            >
              {error}
            </div>
          )}

          {/* FOOTER */}

          <div
            className={
              styles.modalFooter
            }
          >
            <button
              type="button"
              className={
                styles.cancelButton
              }
              onClick={onClose}
              disabled={saving}
            >
              Vazgeç
            </button>

            <button
              type="submit"
              className={
                styles.createButton
              }
              disabled={
                saving ||
                loadingPatients
              }
            >
              {saving
                ? "Randevu Oluşturuluyor..."
                : "Randevu Oluştur"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default NewAppointmentModal;