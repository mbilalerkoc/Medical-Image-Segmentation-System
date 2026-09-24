import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import { getDashboard } from "../../services/dashboardService";

import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const [klinikAdi, setKlinikAdi] = useState("Klinik");
  const [doktorBilgisi, setDoktorBilgisi] = useState("Doktor");

  const [stats, setStats] = useState({
    toplam_hasta: 0,
    toplam_analiz: 0,
    tamamlanan_analiz: 0,
    bekleyen_analiz: 0,
  });

  const [recentAnalyses, setRecentAnalyses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // =====================================================
  // KULLANICI BİLGİSİ
  // =====================================================

  useEffect(() => {
    const userStr = localStorage.getItem("user");

    if (!userStr) return;

    try {
      const userObj = JSON.parse(userStr);

      if (userObj.klinik_adi) {
        setKlinikAdi(userObj.klinik_adi);
      } else if (userObj.klinik_id) {
        setKlinikAdi(`Klinik ${userObj.klinik_id}`);
      }

      const unvan = userObj.unvan || "";
      const ad = userObj.ad || "";
      const soyad = userObj.soyad || "";

      const doktorAdi = `${unvan} ${ad} ${soyad}`.trim();

      if (doktorAdi) {
        setDoktorBilgisi(doktorAdi);
      }
    } catch (err) {
      console.error("Kullanıcı bilgisi okunamadı:", err);
    }
  }, []);

  // =====================================================
  // DASHBOARD VERİLERİNİ GETİR
  // =====================================================

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getDashboard();

        if (!data.basarili) {
          setError(
            data.mesaj ||
              "Dashboard bilgileri alınamadı."
          );

          return;
        }

        setStats(
          data.istatistikler || {
            toplam_hasta: 0,
            toplam_analiz: 0,
            tamamlanan_analiz: 0,
            bekleyen_analiz: 0,
          }
        );

        setRecentAnalyses(
          data.son_analizler || []
        );
      } catch (err) {
        console.error(
          "Dashboard yükleme hatası:",
          err
        );

        setError(
          err.response?.data?.mesaj ||
            "Dashboard bilgileri yüklenirken bir hata oluştu."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // =====================================================
  // LABEL FONKSİYONLARI
  // =====================================================

  const getOrganLabel = (organ) => {
    if (organ === "beyin") return "Beyin";

    if (organ === "bobrek") return "Böbrek";

    return organ || "-";
  };

  const getModelLabel = (model) => {
    if (model === "unet") return "U-Net";

    if (model === "unet_plus") return "U-Net++";

    return model || "-";
  };

  const getStatusLabel = (status) => {
    if (status === "tamamlandi") {
      return "Tamamlandı";
    }

    if (status === "onaylandi") {
      return "Onaylandı";
    }

    if (status === "bekliyor") {
      return "Bekliyor";
    }

    return status || "-";
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <DashboardLayout
      title={`${doktorBilgisi} | ${klinikAdi}`}
    >
      <div className={styles.dashboardWrapper}>

        {/* ARKA PLAN */}

        <div className={styles.backgroundDecor}>
          <div className={styles.gridPattern}></div>
          <div className={styles.glowCyan}></div>
          <div className={styles.glowBlue}></div>
        </div>

        {/* KARŞILAMA */}

        <div className={styles.welcomeArea}>
          <div>
            <p className={styles.welcomeLabel}>
              PathoVision
            </p>

            <h1 className={styles.welcomeTitle}>
              Hoş geldiniz, {doktorBilgisi}
            </h1>

            <p className={styles.welcomeDescription}>
              Hasta ve yapay zeka analizlerinize ait
              güncel durumu buradan takip edebilirsiniz.
            </p>
          </div>

          <div className={styles.quickActions}>
            <button
              className={styles.secondaryAction}
              onClick={() =>
                navigate("/patients")
              }
            >
              Hastaları Gör
            </button>

            <button
              className={styles.primaryAction}
              onClick={() =>
                navigate("/analyze")
              }
            >
              + Yeni Analiz
            </button>
          </div>
        </div>

        {/* HATA */}

        {error && (
          <div className={styles.errorBox}>
            {error}
          </div>
        )}

        {/* İSTATİSTİKLER */}

        <div className={styles.statsGrid}>

          {/* TOPLAM HASTA */}

          <div
            className={`${styles.statCard} ${styles.cardBlue}`}
          >
            <div
              className={`${styles.cardGlow} ${styles.bgGlowBlue}`}
            ></div>

            <div className={styles.statHeader}>
              <div>
                <p className={styles.statTitle}>
                  Toplam Hasta
                </p>

                <h3 className={styles.statValue}>
                  {loading
                    ? "..."
                    : stats.toplam_hasta}
                </h3>
              </div>

              <div
                className={`${styles.iconWrapper} ${styles.iconBlue}`}
              >
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
                    strokeWidth="1.5"
                    d="M17 20h5v-2a4 4 0 00-5-4M9 20H4v-2a4 4 0 015-4m6-5a3 3 0 11-6 0 3 3 0 016 0zm6 1a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>

            <div className={styles.statFooter}>
              Sisteme bağlı hastalar
            </div>
          </div>

          {/* TOPLAM ANALİZ */}

          <div
            className={`${styles.statCard} ${styles.cardCyan}`}
          >
            <div
              className={`${styles.cardGlow} ${styles.bgGlowCyan}`}
            ></div>

            <div className={styles.statHeader}>
              <div>
                <p className={styles.statTitle}>
                  Toplam Analiz
                </p>

                <h3 className={styles.statValue}>
                  {loading
                    ? "..."
                    : stats.toplam_analiz}
                </h3>
              </div>

              <div
                className={`${styles.iconWrapper} ${styles.iconCyan}`}
              >
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
                    strokeWidth="1.5"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
            </div>

            <div className={styles.statFooter}>
              Tüm AI analiz kayıtları
            </div>
          </div>

          {/* TAMAMLANAN */}

          <div
            className={`${styles.statCard} ${styles.cardEmerald}`}
          >
            <div
              className={`${styles.cardGlow} ${styles.bgGlowEmerald}`}
            ></div>

            <div className={styles.statHeader}>
              <div>
                <p className={styles.statTitle}>
                  Tamamlanan
                </p>

                <h3 className={styles.statValue}>
                  {loading
                    ? "..."
                    : stats.tamamlanan_analiz}
                </h3>
              </div>

              <div
                className={`${styles.iconWrapper} ${styles.iconEmerald}`}
              >
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
                    strokeWidth="1.5"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            <div className={styles.statFooter}>
              İşlemi tamamlanan analizler
            </div>
          </div>

          {/* BEKLEYEN */}

          <div
            className={`${styles.statCard} ${styles.cardAmber}`}
          >
            <div
              className={`${styles.cardGlow} ${styles.bgGlowAmber}`}
            ></div>

            <div className={styles.statHeader}>
              <div>
                <p className={styles.statTitle}>
                  Bekleyen İşlem
                </p>

                <h3 className={styles.statValue}>
                  {loading
                    ? "..."
                    : stats.bekleyen_analiz}
                </h3>
              </div>

              <div
                className={`${styles.iconWrapper} ${styles.iconAmber}`}
              >
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
                    strokeWidth="1.5"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            <div className={styles.statFooter}>
              İşlem bekleyen analizler
            </div>
          </div>

        </div>

        {/* SON ANALİZLER */}

        <div className={styles.tableCard}>

          <div className={styles.tableHeaderArea}>

            <div className={styles.tableTitleWrapper}>

              <div
                className={`${styles.iconWrapper} ${styles.iconCyan}`}
              >
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
                    strokeWidth="1.5"
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>

              <div>
                <h2 className={styles.tableTitle}>
                  Son Analizler
                </h2>

                <p className={styles.tableSubtitle}>
                  Son oluşturulan 6 analiz kaydı
                </p>
              </div>

            </div>

            <button
              className={styles.actionBtn}
              onClick={() =>
                navigate("/analyze")
              }
            >
              + Yeni Analiz
            </button>

          </div>

          <div className={styles.tableContainer}>

            {loading ? (
              <div className={styles.tableMessage}>
                Analizler yükleniyor...
              </div>
            ) : recentAnalyses.length === 0 ? (
              <div className={styles.emptyState}>

                <h3>
                  Henüz analiz bulunmuyor
                </h3>

                <p>
                  İlk yapay zeka analizini oluşturarak
                  başlayabilirsiniz.
                </p>

                <button
                  className={styles.primaryAction}
                  onClick={() =>
                    navigate("/analyze")
                  }
                >
                  Yeni Analiz Başlat
                </button>

              </div>
            ) : (
              <table className={styles.dataTable}>

                <thead>
                  <tr>
                    <th>Analiz</th>
                    <th>Hasta</th>
                    <th>Organ / Model</th>
                    <th>Tarih</th>
                    <th>Durum</th>
                    <th>İşlem</th>
                  </tr>
                </thead>

                <tbody>
                  {recentAnalyses.map(
                    (analysis) => (
                      <tr key={analysis.id}>

                        {/* ANALİZ */}

                        <td>
                          <div
                            className={
                              styles.analysisName
                            }
                          >
                            <strong>
                              {analysis.analiz_adi ||
                                `Analiz #${analysis.id}`}
                            </strong>

                            <span>
                              #{analysis.id}
                            </span>
                          </div>
                        </td>

                        {/* HASTA */}

                        <td>
                          <div
                            className={
                              styles.patientCell
                            }
                          >
                            <strong>
                              {analysis.hasta ||
                                "-"}
                            </strong>

                            <span>
                              {analysis.tc_kimlik ||
                                "-"}
                            </span>
                          </div>
                        </td>

                        {/* ORGAN MODEL */}

                        <td>
                          <span
                            className={
                              styles.organBadge
                            }
                          >
                            {getOrganLabel(
                              analysis.organ
                            )}
                          </span>

                          <span
                            className={
                              styles.modelBadge
                            }
                          >
                            {getModelLabel(
                              analysis.model
                            )}
                          </span>
                        </td>

                        {/* TARİH */}

                        <td
                          className={
                            styles.dateCell
                          }
                        >
                          {analysis.tarih
                            ? new Date(
                                analysis.tarih
                              ).toLocaleString(
                                "tr-TR"
                              )
                            : "-"}
                        </td>

                        {/* DURUM */}

                        <td>
                          <span
                            className={`${styles.statusBadge} ${
                              analysis.durum ===
                              "bekliyor"
                                ? styles.statusPending
                                : styles.statusCompleted
                            }`}
                          >
                            <span
                              className={`${styles.dot} ${
                                analysis.durum ===
                                "bekliyor"
                                  ? styles.dotPending
                                  : styles.dotCompleted
                              }`}
                            ></span>

                            {getStatusLabel(
                              analysis.durum
                            )}
                          </span>
                        </td>

                        {/* İŞLEM */}

                        <td>
                          <button
                            className={
                              styles.detailBtn
                            }
                            onClick={() =>
                              navigate(
                                `/analyses/${analysis.id}`
                              )
                            }
                          >
                            Görüntüle
                          </button>
                        </td>

                      </tr>
                    )
                  )}
                </tbody>

              </table>
            )}

          </div>

          {/* ALT DURUM */}

          <div className={styles.systemStatusFooter}>

            <span>
              <span
                className={`${styles.dot} ${styles.dotOnline}`}
              ></span>

              AI Analiz Sistemi
            </span>

            <span>
              <span
                className={`${styles.dot} ${styles.dotOnline}`}
              ></span>

              Veriler Senkronize
            </span>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;