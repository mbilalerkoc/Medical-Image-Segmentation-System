import React, { useCallback, useEffect, useState } from "react";

import DashboardLayout from "../../../layouts/DashboardLayout";
import { getMyAnalyses } from "../../../services/patientService";

import styles from "./Analyses.module.css";

const Analyses = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalyses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyAnalyses();

      if (!data.basarili) {
        setError(data.mesaj || "Analizleriniz getirilemedi.");

        return;
      }

      setAnalyses(data.analizler || []);
    } catch (err) {
      console.error("Hasta analizleri yükleme hatası:", err);

      setError(
        err.response?.data?.mesaj ||
          "Analizleriniz yüklenirken bir hata oluştu.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalyses();
  }, [loadAnalyses]);

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

  const getStatusLabel = (status) => {
    const labels = {
      bekliyor: "Bekliyor",
      tamamlandi: "Tamamlandı",
      onaylandi: "Onaylandı",
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

  if (loading) {
    return (
      <DashboardLayout title="Analizlerim">
        <div className={styles.container}>
          <div className={styles.stateCard}>
            <div className={styles.spinner} />

            <h2>Analizleriniz yükleniyor...</h2>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Analizlerim">
        <div className={styles.container}>
          <div className={styles.stateCard}>
            <div className={styles.errorIcon}>!</div>

            <h2>Analizler alınamadı</h2>

            <p>{error}</p>

            <button
              type="button"
              className={styles.retryButton}
              onClick={loadAnalyses}
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Analizlerim">
      <div className={styles.container}>
        {analyses.length === 0 ? (
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
                  d="M4 19h16M6 17V9m4 8V5m4 12v-7m4 7V7"
                />
              </svg>
            </div>

            <h2>Henüz analiziniz bulunmuyor</h2>
          </div>
        ) : (
          <div className={styles.analysisCard}>
            <div className={styles.cardHeader}>
              <h2>Analiz Geçmişi</h2>

              <span>{analyses.length} analiz</span>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Analiz</th>
                    <th>Organ</th>
                    <th>Model</th>
                    <th>Durum</th>
                    <th>Rapor</th>
                    <th>Tarih</th>
                  </tr>
                </thead>

                <tbody>
                  {analyses.map((analysis) => (
                    <tr key={analysis.id}>
                      <td>
                        <div className={styles.analysisName}>
                          <span className={styles.analysisIcon}>
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
                                d="M4 19h16M6 17V9m4 8V5m4 12v-7m4 7V7"
                              />
                            </svg>
                          </span>

                          <div>
                            <strong>
                              {analysis.analiz_adi || `Analiz #${analysis.id}`}
                            </strong>

                            <span>#{analysis.id}</span>
                          </div>
                        </div>
                      </td>

                      <td>{getOrganLabel(analysis.organ)}</td>

                      <td>{getModelLabel(analysis.model)}</td>

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
                        <span
                          className={
                            analysis.rapor_var
                              ? styles.reportReady
                              : styles.reportPending
                          }
                        >
                          {analysis.rapor_var ? "Hazır" : "Henüz Yok"}
                        </span>
                      </td>

                      <td>{formatDate(analysis.tarih)}</td>
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

export default Analyses;
