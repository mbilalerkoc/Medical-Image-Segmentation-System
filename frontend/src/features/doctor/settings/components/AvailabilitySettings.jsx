import React, { useEffect, useState } from "react";
import {
  getAvailability,
  saveAvailability,
} from "../../../../services/appointmentService";
import useToast from "../../../../hooks/useToast";
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
  const toast = useToast();

  const [schedule, setSchedule] = useState(createEmptySchedule());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ÇALIŞMA SAATLERİNİ GETİR */
  useEffect(() => {
    const loadAvailability = async () => {
      try {
        setLoading(true);

        const data = await getAvailability();

        if (!data.basarili) {
          toast.error(data.mesaj || "Çalışma saatleri alınamadı.");
          return;
        }

        const newSchedule = createEmptySchedule();

        (data.musaitlikler || []).forEach((item) => {
          if (!newSchedule[item.gun]) return;

          newSchedule[item.gun].push({
            baslangic_saati:
              item.baslangic_saati?.slice(0, 5) || "09:00",
            bitis_saati:
              item.bitis_saati?.slice(0, 5) || "17:00",
          });
        });

        setSchedule(newSchedule);
      } catch (error) {
        console.error("Müsaitlik yükleme hatası:", error);

        toast.error(
          error.response?.data?.mesaj ||
            "Çalışma saatleri yüklenirken bir hata oluştu.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, [toast]);

  /* ARALIK EKLE */
  const addInterval = (day) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: [
        ...prev[day],
        {
          baslangic_saati: "09:00",
          bitis_saati: "17:00",
        },
      ],
    }));
  };

  /* ARALIK SİL */
  const removeInterval = (day, index) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
  };

  /* SAAT DEĞİŞTİR */
  const updateInterval = (day, index, field, value) => {
    setSchedule((prev) => {
      const updated = [...prev[day]];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return {
        ...prev,
        [day]: updated,
      };
    });
  };

  /* KAYDET */
  const handleSave = async () => {
    const musaitlikler = [];

    for (const day of DAYS) {
      const intervals = schedule[day.key];

      for (const interval of intervals) {
        if (
          !interval.baslangic_saati ||
          !interval.bitis_saati
        ) {
          toast.warning(
            `${day.label} için başlangıç ve bitiş saati zorunludur.`,
          );
          return;
        }

        if (
          interval.baslangic_saati >=
          interval.bitis_saati
        ) {
          toast.warning(
            `${day.label} için bitiş saati başlangıç saatinden sonra olmalıdır.`,
          );
          return;
        }

        musaitlikler.push({
          gun: day.key,
          baslangic_saati:
            interval.baslangic_saati,
          bitis_saati:
            interval.bitis_saati,
        });
      }
    }

    try {
      setSaving(true);

      const data =
        await saveAvailability(musaitlikler);

      if (!data.basarili) {
        toast.error(
          data.mesaj ||
            "Çalışma saatleri kaydedilemedi.",
        );
        return;
      }

      toast.success(
        "Çalışma saatleri başarıyla güncellendi.",
      );
    } catch (error) {
      console.error(
        "Müsaitlik kaydetme hatası:",
        error,
      );

      toast.error(
        error.response?.data?.mesaj ||
          "Çalışma saatleri kaydedilirken bir hata oluştu.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.availabilitySection}>
        <div className={styles.availabilityLoading}>
          <div className={styles.spinner} />
          <span>Çalışma saatleri yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.availabilitySection}>
      <div className={styles.availabilityHeader}>
        <h2>Çalışma Saatlerim</h2>
      </div>

      <div className={styles.scheduleTable}>
        <div className={styles.tableHeader}>
          <span>Gün</span>
          <span>Durum</span>
          <span>Çalışma Saatleri</span>
          <span />
        </div>

        {DAYS.map((day) => {
          const intervals = schedule[day.key];
          const isWorking = intervals.length > 0;

          return (
            <div
              key={day.key}
              className={styles.dayRow}
            >
              <div className={styles.dayName}>
                {day.label}
              </div>

              <div>
                <span
                  className={
                    isWorking
                      ? styles.workingBadge
                      : styles.closedBadge
                  }
                >
                  {isWorking
                    ? "Çalışıyor"
                    : "Kapalı"}
                </span>
              </div>

              <div className={styles.intervalsColumn}>
                {isWorking ? (
                  intervals.map((interval, index) => (
                    <div
                      key={index}
                      className={styles.timeInterval}
                    >
                      <input
                        type="time"
                        value={
                          interval.baslangic_saati
                        }
                        onChange={(e) =>
                          updateInterval(
                            day.key,
                            index,
                            "baslangic_saati",
                            e.target.value,
                          )
                        }
                        aria-label={`${day.label} başlangıç saati`}
                      />

                      <span
                        className={
                          styles.timeSeparator
                        }
                      >
                        —
                      </span>

                      <input
                        type="time"
                        value={
                          interval.bitis_saati
                        }
                        onChange={(e) =>
                          updateInterval(
                            day.key,
                            index,
                            "bitis_saati",
                            e.target.value,
                          )
                        }
                        aria-label={`${day.label} bitiş saati`}
                      />

                      <button
                        type="button"
                        className={
                          styles.removeTimeButton
                        }
                        onClick={() =>
                          removeInterval(
                            day.key,
                            index,
                          )
                        }
                        aria-label="Saat aralığını kaldır"
                        title="Saat aralığını kaldır"
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <span className={styles.closedText}>
                    Çalışma saati yok
                  </span>
                )}
              </div>

              <div className={styles.rowAction}>
                <button
                  type="button"
                  className={styles.addTimeButton}
                  onClick={() =>
                    addInterval(day.key)
                  }
                >
                  + Aralık Ekle
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.availabilityFooter}>
        <button
          type="button"
          className={
            styles.saveAvailabilityButton
          }
          onClick={handleSave}
          disabled={saving}
        >
          {saving
            ? "Kaydediliyor..."
            : "Çalışma Saatlerini Kaydet"}
        </button>
      </div>
    </div>
  );
};

export default AvailabilitySettings;