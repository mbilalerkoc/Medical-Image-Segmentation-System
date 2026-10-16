import React, { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import NewAppointmentModal from "./components/NewAppointmentModal";

import {
  getAppointments,
  updateAppointmentStatus,
} from "../../services/appointmentService";

import styles from "./Appointments.module.css";

const FILTERS = [
  {
    key: "all",
    label: "Tümü",
  },
  {
    key: "today",
    label: "Bugün",
  },
  {
    key: "upcoming",
    label: "Yaklaşan",
  },
  {
    key: "past",
    label: "Geçmiş",
  },
  {
    key: "cancelled",
    label: "İptal",
  },
];

const Appointments = () => {
  const navigate = useNavigate();

  const [filter, setFilter] = useState("all");

  const [appointments, setAppointments] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [updatingId, setUpdatingId] = useState(null);

  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  // =====================================================
  // RANDEVULARI YÜKLE
  // =====================================================

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAppointments(filter);

      if (!data.basarili) {
        setError(data.mesaj || "Randevular alınamadı.");

        return;
      }

      setAppointments(data.randevular || []);
    } catch (error) {
      console.error("Randevular yüklenemedi:", error);

      setError(
        error.response?.data?.mesaj ||
          "Randevular yüklenirken bir hata oluştu.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [filter]);

  // =====================================================
  // ARAMA
  // =====================================================

  const filteredAppointments = useMemo(() => {
    const search = searchTerm.trim().toLocaleLowerCase("tr-TR");

    if (!search) {
      return appointments;
    }

    return appointments.filter((appointment) => {
      const hasta = appointment.hasta_adi || "";

      const tc = appointment.tc_kimlik || "";

      const neden = appointment.randevu_nedeni || "";

      const durum = appointment.durum || "";

      return (
        hasta.toLocaleLowerCase("tr-TR").includes(search) ||
        tc.includes(search) ||
        neden.toLocaleLowerCase("tr-TR").includes(search) ||
        durum.toLocaleLowerCase("tr-TR").includes(search)
      );
    });
  }, [appointments, searchTerm]);

  // =====================================================
  // DURUM GÜNCELLE
  // =====================================================

  const handleStatusChange = async (appointmentId, durum) => {
    try {
      setUpdatingId(appointmentId);

      setError("");
      setSuccess("");

      const data = await updateAppointmentStatus(appointmentId, durum);

      if (!data.basarili) {
        setError(data.mesaj || "Randevu durumu güncellenemedi.");

        return;
      }

      setSuccess(data.mesaj || "Randevu durumu güncellendi.");

      await loadAppointments();
    } catch (error) {
      console.error("Durum güncelleme hatası:", error);

      setError(
        error.response?.data?.mesaj ||
          "Randevu durumu güncellenirken hata oluştu.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // =====================================================
  // TARİH
  // =====================================================

  const formatDate = (value) => {
    if (!value) {
      return {
        date: "-",
        time: "-",
      };
    }

    const date = new Date(value);

    return {
      date: date.toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),

      time: date.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  // =====================================================
  // DURUM LABEL
  // =====================================================

  const getStatusLabel = (status) => {
    switch (status) {
      case "bekliyor":
        return "Bekliyor";

      case "onaylandi":
        return "Onaylandı";

      case "tamamlandi":
        return "Tamamlandı";

      case "iptal_edildi":
        return "İptal Edildi";

      case "gelmedi":
        return "Gelmedi";

      default:
        return status || "-";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "onaylandi":
        return styles.statusApproved;

      case "tamamlandi":
        return styles.statusCompleted;

      case "iptal_edildi":
        return styles.statusCancelled;

      case "gelmedi":
        return styles.statusNoShow;

      default:
        return styles.statusPending;
    }
  };

  return (
    <DashboardLayout title="Randevularım">
      <div className={styles.container}>
        {/* HEADER */}

        <div className={styles.pageHeader}>
          <div>
            <span className={styles.pageLabel}>Randevu Yönetimi</span>

            <h1>Randevularım</h1>

            <p>Hastalarınıza ait randevuları görüntüleyin ve yönetin.</p>
          </div>

          <button
            type="button"
            className={styles.newAppointmentButton}
            onClick={() => setIsNewAppointmentOpen(true)}
          >
            <span>+</span>
            Yeni Randevu
          </button>
        </div>

        {/* MESAJLAR */}

        {success && <div className={styles.successMessage}>{success}</div>}

        {error && <div className={styles.errorMessage}>{error}</div>}

        {/* ÜST ARAÇLAR */}

        <div className={styles.toolbarCard}>
          {/* FİLTRELER */}

          <div className={styles.filters}>
            {FILTERS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setFilter(item.key);

                  setSuccess("");
                }}
                className={`${styles.filterButton} ${
                  filter === item.key ? styles.filterActive : ""
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* ARAMA */}

          <div className={styles.searchWrapper}>
            <svg
              className={styles.searchIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-4.35-4.35m2.35-5.65a8 8 0 11-16 0 8 8 0 0116 0z"
              />
            </svg>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Hasta, TC veya randevu nedeni ara..."
            />

            {searchTerm && (
              <button
                type="button"
                className={styles.clearSearch}
                onClick={() => setSearchTerm("")}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* RANDEVU SAYISI */}

        <div className={styles.resultInfo}>
          <span>{filteredAppointments.length} randevu gösteriliyor</span>
        </div>

        {/* TABLO */}

        <div className={styles.appointmentCard}>
          {loading ? (
            <div className={styles.loadingArea}>
              <div className={styles.spinner}></div>

              <p>Randevular yükleniyor...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📅</div>

              <h3>Randevu bulunamadı</h3>

              <p>Seçilen filtreye uygun bir randevu bulunmuyor.</p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Hasta</th>

                    <th>Tarih / Saat</th>

                    <th>Süre</th>

                    <th>Randevu Nedeni</th>

                    <th>Durum</th>

                    <th>İşlem</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAppointments.map((appointment) => {
                    const { date, time } = formatDate(appointment.tarih_saat);

                    return (
                      <tr key={appointment.id}>
                        {/* HASTA */}

                        <td>
                          <div className={styles.patientCell}>
                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/patients/${appointment.hasta_id}`)
                              }
                            >
                              {appointment.hasta_adi}
                            </button>

                            <span>TC: {appointment.tc_kimlik}</span>

                            {appointment.telefon && (
                              <span>{appointment.telefon}</span>
                            )}
                          </div>
                        </td>

                        {/* TARİH */}

                        <td>
                          <div className={styles.dateCell}>
                            <strong>{date}</strong>

                            <span>{time}</span>
                          </div>
                        </td>

                        {/* SÜRE */}

                        <td>
                          <span className={styles.durationBadge}>
                            {appointment.sure_dakika} dk
                          </span>
                        </td>

                        {/* NEDEN */}

                        <td>
                          <div className={styles.reasonCell}>
                            <strong>
                              {appointment.randevu_nedeni || "Genel Muayene"}
                            </strong>

                            {appointment.notlar && (
                              <span>{appointment.notlar}</span>
                            )}
                          </div>
                        </td>

                        {/* DURUM */}

                        <td>
                          <span
                            className={`${styles.statusBadge} ${getStatusClass(
                              appointment.durum,
                            )}`}
                          >
                            {getStatusLabel(appointment.durum)}
                          </span>
                        </td>

                        {/* İŞLEM */}

                        <td>
                          <select
                            value={appointment.durum}
                            disabled={updatingId === appointment.id}
                            onChange={(e) =>
                              handleStatusChange(appointment.id, e.target.value)
                            }
                            className={styles.statusSelect}
                          >
                            <option value="bekliyor">Bekliyor</option>

                            <option value="onaylandi">Onaylandı</option>

                            <option value="tamamlandi">Tamamlandı</option>

                            <option value="gelmedi">Gelmedi</option>

                            <option value="iptal_edildi">İptal Et</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Appointments;
