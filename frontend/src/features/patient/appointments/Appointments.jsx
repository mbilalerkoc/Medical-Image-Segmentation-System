import React, { useCallback, useEffect, useState } from "react";

import DashboardLayout from "../../../layouts/DashboardLayout";
import { getMyAppointments } from "../../../services/appointmentService";

import styles from "./Appointments.module.css";

const FILTERS = [
  {
    value: "all",
    label: "Tümü",
  },
  {
    value: "upcoming",
    label: "Yaklaşan",
  },
  {
    value: "past",
    label: "Geçmiş",
  },
  {
    value: "cancelled",
    label: "İptal Edilen",
  },
];

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyAppointments(filter);

      if (!data.basarili) {
        setError(data.mesaj || "Randevularınız getirilemedi.");

        return;
      }

      setAppointments(data.randevular || []);
    } catch (err) {
      console.error("Hasta randevuları yükleme hatası:", err);

      setError(
        err.response?.data?.mesaj ||
          "Randevularınız yüklenirken bir hata oluştu.",
      );
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const getStatusLabel = (status) => {
    const labels = {
      bekliyor: "Bekliyor",
      onaylandi: "Onaylandı",
      tamamlandi: "Tamamlandı",
      iptal_edildi: "İptal Edildi",
      gelmedi: "Gelmedi",
    };

    return labels[status] || status || "-";
  };

  const getStatusClass = (status) => {
    if (status === "onaylandi") {
      return styles.statusSuccess;
    }

    if (status === "tamamlandi") {
      return styles.statusInfo;
    }

    if (status === "iptal_edildi" || status === "gelmedi") {
      return styles.statusDanger;
    }

    return styles.statusWarning;
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDoctorName = (appointment) => {
    const name = appointment.doktor_adi || "-";

    if (!appointment.doktor_unvan || name === "-") {
      return name;
    }

    return `${appointment.doktor_unvan} ${name}`;
  };

  return (
    <DashboardLayout title="Randevularım">
      <div className={styles.container}>
        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            {FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`${styles.filterButton} ${
                  filter === item.value ? styles.filterButtonActive : ""
                }`}
                onClick={() => setFilter(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className={styles.stateCard}>
            <div className={styles.spinner} />

            <h2>Randevularınız yükleniyor...</h2>
          </div>
        ) : error ? (
          <div className={styles.stateCard}>
            <div className={styles.errorIcon}>!</div>

            <h2>Randevular alınamadı</h2>

            <p>{error}</p>

            <button
              type="button"
              className={styles.retryButton}
              onClick={loadAppointments}
            >
              Tekrar Dene
            </button>
          </div>
        ) : appointments.length === 0 ? (
          <div className={styles.emptyCard}>
            <div className={styles.emptyIcon}>
              <svg
                width="26"
                height="26"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M8 2v3m8-3v3M4 9h16M5 4h14a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
                />
              </svg>
            </div>

            <h2>Randevu bulunmuyor</h2>

            <p>Seçilen filtreye ait bir randevunuz bulunmamaktadır.</p>
          </div>
        ) : (
          <div className={styles.appointmentCard}>
            <div className={styles.cardHeader}>
              <h2>Randevu Geçmişi</h2>

              <span>{appointments.length} randevu</span>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Doktor</th>
                    <th>Klinik</th>
                    <th>Tarih</th>
                    <th>Saat</th>
                    <th>Süre</th>
                    <th>Randevu Nedeni</th>
                    <th>Durum</th>
                  </tr>
                </thead>

                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>
                        <div className={styles.doctorInfo}>
                          <span className={styles.doctorIcon}>
                            <svg
                              width="19"
                              height="19"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.8"
                                d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 0 0-14 0"
                              />
                            </svg>
                          </span>

                          <div>
                            <strong>{getDoctorName(appointment)}</strong>

                            <span>{appointment.uzmanlik || "Doktor"}</span>
                          </div>
                        </div>
                      </td>

                      <td>{appointment.klinik_adi || "-"}</td>

                      <td>{formatDate(appointment.tarih_saat)}</td>

                      <td>
                        <strong className={styles.timeText}>
                          {formatTime(appointment.tarih_saat)}
                        </strong>
                      </td>

                      <td>
                        {appointment.sure_dakika
                          ? `${appointment.sure_dakika} dk`
                          : "-"}
                      </td>

                      <td>
                        <span className={styles.reasonText}>
                          {appointment.randevu_nedeni || "-"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`${styles.statusBadge} ${getStatusClass(
                            appointment.durum,
                          )}`}
                        >
                          {getStatusLabel(appointment.durum)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Appointments;
