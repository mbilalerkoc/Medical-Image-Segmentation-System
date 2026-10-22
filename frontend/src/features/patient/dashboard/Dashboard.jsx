import React, { useCallback, useEffect, useState } from "react";

import DashboardLayout from "../../../layouts/DashboardLayout";
import { getMyDashboard } from "../../../services/patientService";

import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyDashboard();

      if (!data.basarili) {
        setError(data.mesaj || "Dashboard bilgileri alınamadı.");
        return;
      }

      setDashboard(data);
    } catch (err) {
      console.error("Hasta dashboard yükleme hatası:", err);

      setError(
        err.response?.data?.mesaj ||
          "Dashboard bilgileri alınırken bir hata oluştu.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAnalysisStatus = (status) => {
    const labels = {
      bekliyor: "Bekliyor",
      tamamlandi: "Tamamlandı",
      onaylandi: "Onaylandı",
    };

    return labels[status] || status || "-";
  };

  const getAppointmentStatus = (status) => {
    const labels = {
      bekliyor: "Bekliyor",
      onaylandi: "Onaylandı",
      tamamlandi: "Tamamlandı",
      iptal_edildi: "İptal Edildi",
      gelmedi: "Gelmedi",
    };

    return labels[status] || status || "-";
  };

  const getOrganLabel = (organ) => {
    if (organ === "beyin") {
      return "Beyin";
    }

    if (organ === "bobrek") {
      return "Böbrek";
    }

    return organ || "-";
  };

  const getModelLabel = (model) => {
    if (model === "unet") {
      return "U-Net";
    }

    if (model === "unet_plus") {
      return "U-Net++";
    }

    return model || "-";
  };

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className={styles.dashboardContainer}>
          <div className={styles.stateCard}>
            <div className={styles.spinner} />

            <h2>Bilgileriniz yükleniyor...</h2>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !dashboard) {
    return (
      <DashboardLayout title="Dashboard">
        <div className={styles.dashboardContainer}>
          <div className={styles.stateCard}>
            <div className={styles.errorIcon}>!</div>

            <h2>Bilgiler alınamadı</h2>

            <p>{error}</p>

            <button
              type="button"
              className={styles.retryButton}
              onClick={loadDashboard}
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const patient = dashboard.hasta || {};
  const stats = dashboard.istatistikler || {};
  const analyses = dashboard.son_analizler || [];
  const appointments = dashboard.yaklasan_randevular || [];

  const fullName = `${patient.ad || ""} ${patient.soyad || ""}`.trim();

  return (
    <DashboardLayout title="Dashboard">
      <div className={styles.dashboardContainer}>
        {/* HEADER */}
        <div className={styles.pageHeader}>
          <h1>
            Hoş geldiniz
            {fullName ? `, ${fullName}` : ""}
          </h1>
        </div>

        {/* İSTATİSTİKLER */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statTop}>
              <span className={styles.statIcon}>
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M4 19h16M6 17V9m4 8V5m4 12v-7m4 7V7"
                  />
                </svg>
              </span>

              <span>Toplam Analiz</span>
            </div>

            <strong className={styles.statValue}>
              {stats.toplam_analiz || 0}
            </strong>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statTop}>
              <span className={styles.statIcon}>
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M8 7V3m8 4V3M5 11h14M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
                  />
                </svg>
              </span>

              <span>Yaklaşan Randevu</span>
            </div>

            <strong className={styles.statValue}>
              {stats.yaklasan_randevu || 0}
            </strong>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statTop}>
              <span className={styles.statIcon}>
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M7 3h7l5 5v13H7a2 2 0 01-2-2V5a2 2 0 012-2zM14 3v6h6M9 13h6M9 17h6"
                  />
                </svg>
              </span>

              <span>Raporlarım</span>
            </div>

            <strong className={styles.statValue}>
              {stats.toplam_rapor || 0}
            </strong>
          </div>
        </div>

        <div className={styles.contentGrid}>
          {/* SON ANALİZLER */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2>Son Analizler</h2>
            </div>

            {analyses.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="M4 19h16M6 17V9m4 8V5m4 12v-7m4 7V7"
                    />
                  </svg>
                </span>

                <strong>Henüz analiziniz bulunmuyor</strong>
              </div>
            ) : (
              <div className={styles.analysisList}>
                {analyses.map((analysis) => (
                  <div key={analysis.id} className={styles.analysisItem}>
                    <div className={styles.analysisIcon}>
                      <svg
                        width="21"
                        height="21"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.8"
                          d="M4 19h16M6 17V9m4 8V5m4 12v-7m4 7V7"
                        />
                      </svg>
                    </div>

                    <div className={styles.analysisInfo}>
                      <strong>
                        {analysis.analiz_adi || `Analiz #${analysis.id}`}
                      </strong>

                      <span>
                        {getOrganLabel(analysis.organ)}
                        {" · "}
                        {getModelLabel(analysis.model)}
                      </span>
                    </div>

                    <span
                      className={`${styles.statusBadge} ${
                        analysis.durum === "onaylandi"
                          ? styles.statusSuccess
                          : analysis.durum === "tamamlandi"
                            ? styles.statusInfo
                            : styles.statusWarning
                      }`}
                    >
                      {getAnalysisStatus(analysis.durum)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* YAKLAŞAN RANDEVULAR */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2>Yaklaşan Randevular</h2>
            </div>

            {appointments.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="M8 7V3m8 4V3M5 11h14M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
                    />
                  </svg>
                </span>

                <strong>Yaklaşan randevunuz bulunmuyor</strong>
              </div>
            ) : (
              <div className={styles.appointmentList}>
                {appointments.map((appointment) => (
                  <div key={appointment.id} className={styles.appointmentItem}>
                    <div className={styles.appointmentDate}>
                      <strong>{formatDate(appointment.tarih_saat)}</strong>

                      <span>
                        {appointment.sure_dakika}
                        {" dakika"}
                      </span>
                    </div>

                    <div className={styles.appointmentInfo}>
                      <strong>
                        {appointment.randevu_nedeni || "Kontrol Randevusu"}
                      </strong>

                      <span>Randevu #{appointment.id}</span>
                    </div>

                    <span
                      className={`${styles.statusBadge} ${
                        appointment.durum === "onaylandi"
                          ? styles.statusSuccess
                          : styles.statusWarning
                      }`}
                    >
                      {getAppointmentStatus(appointment.durum)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
