import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import { getPatientById } from "../../services/patientService";
import styles from "./PatientDetail.module.css";

const PatientDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [patient, setPatient] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPatient = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getPatientById(id);

        if (data.basarili) {
          setPatient(data.hasta);
          setAnalyses(data.analizler || []);
        } else {
          setError(
            data.mesaj ||
              "Hasta bilgileri alınamadı."
          );
        }
      } catch (err) {
        console.error(
          "Hasta detay yükleme hatası:",
          err
        );

        setError(
          err.response?.data?.mesaj ||
            "Hasta bilgileri alınırken bir hata oluştu."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout title="Hasta Detayı">
        <div className={styles.container}>
          <div className={styles.emptyCard}>
            <div className={styles.loadingSpinner}></div>

            <h2>Hasta bilgileri yükleniyor...</h2>

            <p>
              Hasta #{id} bilgileri getiriliyor.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !patient) {
    return (
      <DashboardLayout title="Hasta Detayı">
        <div className={styles.container}>
          <div className={styles.emptyCard}>
            <div className={styles.emptyIcon}>!</div>

            <h2>Hasta bilgisi bulunamadı</h2>

            <p>
              {error ||
                `Hasta #${id} bilgileri bulunamadı.`}
            </p>

            <button
              className={styles.primaryButton}
              onClick={() =>
                navigate("/patients")
              }
            >
              Hastalara Dön
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const fullName =
    `${patient.ad || ""} ${patient.soyad || ""}`.trim() ||
    "-";

  const dogumTarihi = patient.dogum_tarihi
    ? new Date(
        patient.dogum_tarihi
      ).toLocaleDateString("tr-TR")
    : "-";

  const handleAnalysisDetail = (analysisId) => {
    navigate(`/analyses/${analysisId}`);
  };

  return (
    <DashboardLayout title="Hasta Detayı">
      <div className={styles.container}>

        {/* HEADER */}

        <div className={styles.header}>
          <div>
            <div className={styles.breadcrumb}>
              Hastalarım / {fullName}
            </div>

            <h1 className={styles.pageTitle}>
              {fullName}
            </h1>

            <p className={styles.pageDescription}>
              Hasta bilgileri ve geçmiş analiz kayıtları
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              className={styles.secondaryButton}
              onClick={() =>
                navigate("/patients")
              }
            >
              ← Hastalara Dön
            </button>

            <button
              className={styles.primaryButton}
              onClick={() =>
                navigate("/analyze")
              }
            >
              + Yeni Analiz
            </button>
          </div>
        </div>

        {/* HASTA BİLGİLERİ */}

        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Hasta Bilgileri</h2>

              <p>
                Sistemde kayıtlı temel hasta bilgileri
              </p>
            </div>

            <span
              className={
                patient.aktif
                  ? styles.badgeActive
                  : styles.badgePending
              }
            >
              {patient.aktif
                ? "Aktif"
                : "Şifre Bekliyor"}
            </span>
          </div>

          <div className={styles.infoGrid}>

            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>
                TC Kimlik
              </span>

              <strong className={styles.infoValue}>
                {patient.tc_kimlik || "-"}
              </strong>
            </div>

            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>
                Ad Soyad
              </span>

              <strong className={styles.infoValue}>
                {fullName}
              </strong>
            </div>

            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>
                E-posta
              </span>

              <strong className={styles.infoValue}>
                {patient.email || "-"}
              </strong>
            </div>

            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>
                Telefon
              </span>

              <strong className={styles.infoValue}>
                {patient.telefon || "-"}
              </strong>
            </div>

            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>
                Doğum Tarihi
              </span>

              <strong className={styles.infoValue}>
                {dogumTarihi}
              </strong>
            </div>

            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>
                Kan Grubu
              </span>

              <strong className={styles.infoValue}>
                {patient.kan_grubu || "-"}
              </strong>
            </div>

          </div>

          <div className={styles.addressBox}>
            <span className={styles.infoLabel}>
              Adres
            </span>

            <p>
              {patient.adres?.trim()
                ? patient.adres
                : "Adres bilgisi bulunmuyor."}
            </p>
          </div>
        </div>

        {/* GEÇMİŞ ANALİZLER */}

        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Geçmiş Analizler</h2>

              <p>
                Hastaya ait yapay zeka destekli analiz kayıtları
              </p>
            </div>

            <span className={styles.analysisCount}>
              {analyses.length} Analiz
            </span>
          </div>

          {analyses.length === 0 ? (
            <div className={styles.noAnalysis}>
              <div className={styles.emptyIcon}>
                !
              </div>

              <h3>
                Henüz analiz bulunmuyor
              </h3>

              <p>
                Bu hasta için henüz bir analiz kaydı oluşturulmamış.
              </p>

              <button
                className={styles.primaryButton}
                onClick={() =>
                  navigate("/analyze")
                }
              >
                Yeni Analiz Başlat
              </button>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>

                <thead>
                  <tr>
                    <th>Analiz No</th>
                    <th>Organ</th>
                    <th>Model</th>
                    <th>Durum</th>
                    <th>Tarih</th>
                    <th>İşlem</th>
                  </tr>
                </thead>

                <tbody>
                  {analyses.map((analysis) => {
                    const tarih = analysis.tarih
                      ? new Date(
                          analysis.tarih
                        ).toLocaleString(
                          "tr-TR"
                        )
                      : "-";

                    const organLabel =
                      analysis.organ === "beyin"
                        ? "Beyin"
                        : analysis.organ === "bobrek"
                          ? "Böbrek"
                          : analysis.organ || "-";

                    const modelLabel =
                      analysis.model === "unet"
                        ? "U-Net"
                        : analysis.model === "unet_plus"
                          ? "U-Net++"
                          : analysis.model || "-";

                    return (
                      <tr key={analysis.id}>
                        <td>
                          #{analysis.id}
                        </td>

                        <td>
                          {organLabel}
                        </td>

                        <td>
                          {modelLabel}
                        </td>

                        <td>
                          <span
                            className={
                              analysis.durum ===
                              "tamamlandi"
                                ? styles.statusCompleted
                                : analysis.durum ===
                                    "onaylandi"
                                  ? styles.statusApproved
                                  : styles.statusWaiting
                            }
                          >
                            {analysis.durum ===
                            "tamamlandi"
                              ? "Tamamlandı"
                              : analysis.durum ===
                                  "onaylandi"
                                ? "Onaylandı"
                                : "Bekliyor"}
                          </span>
                        </td>

                        <td>
                          {tarih}
                        </td>

                        <td>
                          <button
                            className={styles.detailButton}
                            onClick={() =>
                              handleAnalysisDetail(
                                analysis.id
                              )
                            }
                          >
                            Analizi Görüntüle
                          </button>
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

export default PatientDetail;