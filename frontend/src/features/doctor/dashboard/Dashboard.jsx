import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../../layouts/DashboardLayout";
import { getDashboard } from "../../../services/dashboardService";

import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* DASHBOARD VERİLERİ */
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getDashboard();

        if (!response.basarili) {
          setError(response.mesaj || "Dashboard bilgileri alınamadı.");
          return;
        }

        setData(response);
      } catch (error) {
        console.error("Dashboard yükleme hatası:", error);

        setError(
          error.response?.data?.mesaj ||
            "Dashboard yüklenirken bir hata oluştu.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  /* TARİH */
  const formatDate = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* DURUM */
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

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className={styles.loadingArea}>
          <div className={styles.spinner} />
          <p>Dashboard yükleniyor...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Dashboard">
        <div className={styles.errorMessage}>{error}</div>
      </DashboardLayout>
    );
  }

  const statistics = data?.istatistikler || {};
  const analyses = data?.son_analizler || [];
  const appointments = data?.bugunku_randevular || [];

  return (
    <DashboardLayout title="Dashboard">
      <div className={styles.dashboardContainer}>
        {/* HEADER */}
        <div className={styles.pageHeader}>
          <button
            type="button"
            className={styles.newAnalysisButton}
            onClick={() => navigate("/analyze")}
          >
            + Yeni Analiz
          </button>
        </div>

        {/* İSTATİSTİKLER */}
        <div className={styles.statsGrid}>
          <StatCard
            title="Toplam Hasta"
            value={statistics.toplam_hasta || 0}
            icon="👥"
          />

          <StatCard
            title="Toplam Analiz"
            value={statistics.toplam_analiz || 0}
            icon="🧠"
          />

          <StatCard
            title="Tamamlanan"
            value={statistics.tamamlanan_analiz || 0}
            icon="✓"
          />

          <StatCard
            title="Bekleyen"
            value={statistics.bekleyen_analiz || 0}
            icon="⌛"
          />

          <StatCard
            title="Bugünkü Randevu"
            value={statistics.bugunku_randevu || 0}
            icon="📅"
            onClick={() => navigate("/appointments")}
          />

          <StatCard
            title="Yaklaşan Randevu"
            value={statistics.yaklasan_randevu || 0}
            icon="🕒"
            onClick={() => navigate("/appointments")}
          />
        </div>

        {/* BUGÜNKÜ RANDEVULAR */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2>Bugünkü Randevular</h2>

            <button
              type="button"
              className={styles.viewAllButton}
              onClick={() => navigate("/appointments")}
            >
              Tüm Randevular
              <span>→</span>
            </button>
          </div>

          {appointments.length === 0 ? (
            <div className={styles.emptyState}>
              <div>📅</div>
              <h3>Bugün randevu yok</h3>

              <button type="button" onClick={() => navigate("/appointments")}>
                Randevulara Git
              </button>
            </div>
          ) : (
            <div className={styles.appointmentList}>
              {appointments.map((appointment) => (
                <div key={appointment.id} className={styles.appointmentItem}>
                  <div className={styles.appointmentTime}>
                    <strong>{formatTime(appointment.tarih_saat)}</strong>
                    <span>{appointment.sure_dakika} dk</span>
                  </div>

                  <div className={styles.appointmentPatient}>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/patients/${appointment.hasta_id}`)
                      }
                    >
                      {appointment.hasta_adi}
                    </button>

                    <span>TC: {appointment.tc_kimlik}</span>
                  </div>

                  <div className={styles.appointmentReason}>
                    <strong>
                      {appointment.randevu_nedeni || "Genel Muayene"}
                    </strong>

                    <span>{formatDate(appointment.tarih_saat)}</span>
                  </div>

                  <span
                    className={`${styles.statusBadge} ${getStatusClass(
                      appointment.durum,
                    )}`}
                  >
                    {getStatusLabel(appointment.durum)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SON ANALİZLER */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2>Son Analizler</h2>

            <button
              type="button"
              className={styles.viewAllButton}
              onClick={() => navigate("/patients")}
            >
              Hastaları Gör
              <span>→</span>
            </button>
          </div>

          {analyses.length === 0 ? (
            <div className={styles.emptyState}>
              <div>🧠</div>
              <h3>Henüz analiz yok</h3>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Analiz</th>
                    <th>Hasta</th>
                    <th>Organ</th>
                    <th>Model</th>
                    <th>Tarih</th>
                    <th>Durum</th>
                    <th />
                  </tr>
                </thead>

                <tbody>
                  {analyses.map((analysis) => (
                    <tr key={analysis.id}>
                      <td>
                        <div className={styles.analysisName}>
                          <strong>{analysis.analiz_adi}</strong>
                          <span>#{analysis.id}</span>
                        </div>
                      </td>

                      <td>
                        <div className={styles.patientInfo}>
                          <strong>{analysis.hasta_adi}</strong>
                          <span>TC: {analysis.tc_kimlik}</span>
                        </div>
                      </td>

                      <td>
                        <span className={styles.organBadge}>
                          {analysis.organ}
                        </span>
                      </td>

                      <td>{analysis.model}</td>

                      <td>{formatDate(analysis.tarih)}</td>

                      <td>
                        <span
                          className={`${styles.statusBadge} ${getStatusClass(
                            analysis.durum,
                          )}`}
                        >
                          {getStatusLabel(analysis.durum)}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className={styles.detailButton}
                          onClick={() => navigate(`/analyses/${analysis.id}`)}
                        >
                          Görüntüle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

const StatCard = ({ title, value, icon, onClick }) => {
  return (
    <div
      className={`${styles.statCard} ${onClick ? styles.clickableCard : ""}`}
      onClick={onClick}
    >
      <div className={styles.statTop}>
        <div className={styles.statIcon}>{icon}</div>
        <span>{title}</span>
      </div>

      <strong className={styles.statValue}>{value}</strong>
    </div>
  );
};

export default Dashboard;
