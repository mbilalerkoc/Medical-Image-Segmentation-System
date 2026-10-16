import React, { useEffect, useState } from "react";
import { getAvailability, saveAvailability } from "../../../services/appointmentService";
import styles from "./AvailabilitySettings.module.css";

const DAYS = [
  { key: "pazartesi", label: "Pazartesi" },
  { key: "sali", label: "Salı" },
  { key: "carsamba", label: "Çarşamba" },
  { key: "persembe", label: "Perşembe" },
  { key: "cuma", label: "Cuma" },
  { key: "cumartesi", label: "Cumartesi" },
  { key: "pazar", label: "Pazar" },
];

const createEmptySchedule = () => {
  const schedule = {};
  DAYS.forEach((day) => {
    schedule[day.key] = [];
  });
  return schedule;
};

const AvailabilitySettings = () => {
  const [schedule, setSchedule] = useState(createEmptySchedule());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // MEVCUT ÇALIŞMA SAATLERİNİ GETİR
  useEffect(() => {
    const loadAvailability = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAvailability();

        if (!data.basarili) {
          setError(data.mesaj || "Çalışma saatleri alınamadı.");
          return;
        }

        const newSchedule = createEmptySchedule();

        (data.musaitlikler || []).forEach((item) => {
          if (!newSchedule[item.gun]) return;

          newSchedule[item.gun].push({
            baslangic_saati: item.baslangic_saati?.slice(0, 5) || "09:00",
            bitis_saati: item.bitis_saati?.slice(0, 5) || "17:00",
          });
        });

        setSchedule(newSchedule);
      } catch (error) {
        console.error("Müsaitlik yükleme hatası:", error);
        setError(
          error.response?.data?.mesaj ||
            "Çalışma saatleri yüklenirken bir hata oluştu.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, []);

  // ÇALIŞMA ARALIĞI EKLE
  const addInterval = (day) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: [
        ...prev[day],
        { baslangic_saati: "09:00", bitis_saati: "17:00" },
      ],
    }));

    setSuccess("");
    setError("");
  };

  // ÇALIŞMA ARALIĞI SİL
  const removeInterval = (day, index) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));

    setSuccess("");
    setError("");
  };

  // SAAT DEĞİŞTİR
  const updateInterval = (day, index, field, value) => {
    setSchedule((prev) => {
      const updated = [...prev[day]];
      updated[index] = { ...updated[index], [field]: value };

      return {
        ...prev,
        [day]: updated,
      };
    });

    setSuccess("");
    setError("");
  };

  // KAYDET
  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const musaitlikler = [];

      for (const day of DAYS) {
        const intervals = schedule[day.key];

        for (const interval of intervals) {
          if (!interval.baslangic_saati || !interval.bitis_saati) {
            setError(`${day.label} için başlangıç ve bitiş saati zorunludur.`);
            return;
          }

          if (interval.baslangic_saati >= interval.bitis_saati) {
            setError(
              `${day.label} için bitiş saati başlangıç saatinden sonra olmalıdır.`,
            );
            return;
          }

          musaitlikler.push({
            gun: day.key,
            baslangic_saati: interval.baslangic_saati,
            bitis_saati: interval.bitis_saati,
          });
        }
      }

      const data = await saveAvailability(musaitlikler);

      if (!data.basarili) {
        setError(data.mesaj || "Çalışma saatleri kaydedilemedi.");
        return;
      }

      setSuccess("Çalışma saatleri başarıyla güncellendi.");
    } catch (error) {
      console.error("Müsaitlik kaydetme hatası:", error);
      setError(
        error.response?.data?.mesaj ||
          "Çalışma saatleri kaydedilirken bir hata oluştu.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.availabilityLoading}>
        Çalışma saatleri yükleniyor...
      </div>
    );
  }

  return (
    <div className={styles.availabilitySection}>
      {/* HEADER */}
      <div className={styles.availabilityHeader}>
        <span className={styles.settingsLabel}>Randevu Ayarları</span>
        <h2>Çalışma Saatlerim</h2>
        <p>
          Hastaların randevu oluşturabileceği çalışma günlerinizi ve saat
          aralıklarınızı belirleyin.
        </p>
      </div>

      {error && <div className={styles.availabilityError}>{error}</div>}
      {success && <div className={styles.availabilitySuccess}>{success}</div>}

      {/* GÜNLER */}
      <div className={styles.weekSchedule}>
        {DAYS.map((day) => {
          const intervals = schedule[day.key];
          const isWorking = intervals.length > 0;

          return (
            <div key={day.key} className={styles.dayCard}>
              <div className={styles.dayHeader}>
                <div>
                  <strong>{day.label}</strong>
                  <span
                    className={
                      isWorking ? styles.workingBadge : styles.closedBadge
                    }
                  >
                    {isWorking ? "Çalışıyor" : "Kapalı"}
                  </span>
                </div>

                <button
                  type="button"
                  className={styles.addTimeButton}
                  onClick={() => addInterval(day.key)}
                >
                  + Saat Ekle
                </button>
              </div>

              {intervals.length === 0 ? (
                <div className={styles.closedDay}>
                  Bu gün için çalışma saati tanımlanmadı.
                </div>
              ) : (
                <div className={styles.timeIntervals}>
                  {intervals.map((interval, index) => (
                    <div key={index} className={styles.timeInterval}>
                      <div className={styles.timeField}>
                        <label>Başlangıç</label>
                        <input
                          type="time"
                          value={interval.baslangic_saati}
                          onChange={(e) =>
                            updateInterval(
                              day.key,
                              index,
                              "baslangic_saati",
                              e.target.value,
                            )
                          }
                        />
                      </div>

                      <span className={styles.timeSeparator}>—</span>

                      <div className={styles.timeField}>
                        <label>Bitiş</label>
                        <input
                          type="time"
                          value={interval.bitis_saati}
                          onChange={(e) =>
                            updateInterval(
                              day.key,
                              index,
                              "bitis_saati",
                              e.target.value,
                            )
                          }
                        />
                      </div>

                      <button
                        type="button"
                        className={styles.removeTimeButton}
                        onClick={() => removeInterval(day.key, index)}
                        title="Saat aralığını kaldır"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* BİLGİ */}
      <div className={styles.availabilityInfo}>
        <div>i</div>
        <p>
          Aynı güne birden fazla çalışma aralığı ekleyebilirsiniz. Örneğin{" "}
          <strong>09:00–12:00</strong> ve <strong>13:00–17:00</strong>{" "}
          tanımlayarak öğle arasını randevuya kapatabilirsiniz.
        </p>
      </div>

      {/* FOOTER */}
      <div className={styles.availabilityFooter}>
        <button
          type="button"
          className={styles.saveAvailabilityButton}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Kaydediliyor..." : "Çalışma Saatlerini Kaydet"}
        </button>
      </div>
    </div>
  );
};

export default AvailabilitySettings;