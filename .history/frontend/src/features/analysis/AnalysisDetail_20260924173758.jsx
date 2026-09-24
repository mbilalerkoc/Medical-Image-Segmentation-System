import React, { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import { getAnalysisById } from "../../services/analysisService";
import styles from "./AnalysisDetail.module.css";

const AnalysisDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  /*
    Eğer NewAnalysis ekranından geldiysek
    veri state içerisinde mevcut olabilir.
  */
  const routerAnalysis = location.state?.analysis || null;

  const [analysis, setAnalysis] = useState(routerAnalysis);
  const [loading, setLoading] = useState(!routerAnalysis);
  const [error, setError] = useState(null);

  useEffect(() => {
    /*
      State ile veri geldiyse tekrar API çağrısı
      yapmak zorunda değiliz.

      Sayfa yenilenirse location.state kaybolacağı için
      API'den tekrar çekeceğiz.
    */
    if (routerAnalysis) {
      return;
    }

    const loadAnalysis = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getAnalysisById(id);

        if (data.basarili) {
          /*
            Backend response yapısını daha sonra
            birebir buna göre düzenleyeceğiz.
          */
          setAnalysis(data.analiz);
        } else {
          setError(
            data.mesaj || "Analiz bilgileri bulunamadı."
          );
        }
      } catch (err) {
        console.error(
          "Analiz detay yükleme hatası:",
          err
        );

        setError(
          err.message ||
            "Analiz bilgileri yüklenirken bir hata oluştu."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [id, routerAnalysis]);

  /* ===================================================== */
  /* LOADING */
  /* ===================================================== */

  if (loading) {
    return (
      <DashboardLayout title="Analiz Detayı">
        <div className={styles.container}>
          <div className={styles.emptyCard}>
            <div className={styles.loadingSpinner}></div>

            <h2>Analiz yükleniyor...</h2>

            <p>
              Analiz #{id} bilgileri getiriliyor.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ===================================================== */
  /* ERROR */
  /* ===================================================== */

  if (error || !analysis) {
    return (
      <DashboardLayout title="Analiz Detayı">
        <div className={styles.container}>
          <div className={styles.emptyCard}>
            <div className={styles.emptyIcon}>!</div>

            <h2>Analiz bilgisi bulunamadı</h2>

            <p>
              {error ||
                `Analiz #${id} bilgileri bulunamadı.`}
            </p>

            <button
              className={styles.primaryButton}
              onClick={() => navigate("/analyze")}
            >
              Yeni Analize Dön
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ===================================================== */
  /* ANALİZ VERİLERİ */
  /* ===================================================== */

  const {
    tcKimlik,
    tc_kimlik,

    organ,
    model,

    preview,
    original_image,

    processedMask,
    mask_image,

    overlayImage,
    overlay_image,

    result,
    metrikler,

    doktorNotu,
    doktor_notu,

    tarih,
    created_at,
  } = analysis;

  /*
    Router ile gelen veri camelCase,
    backend'den gelecek veri snake_case olabilir.

    İkisini de şimdilik destekliyoruz.
  */

  const hastaTc = tcKimlik || tc_kimlik || "-";

  const originalImage =
    preview || original_image || null;

  const segmentationImage =
    processedMask ||
    mask_image ||
    (result?.maske_base64
      ? `data:image/png;base64,${result.maske_base64}`
      : null);

  const combinedImage =
    overlayImage || overlay_image || null;

  const doktorDegerlendirmesi =
    doktorNotu || doktor_notu || "";

  /*
    Yeni analiz ekranından gelirse:
      result.metrikler

    Backend'den gelirse:
      metrikler

    ikisini de destekliyoruz.
  */
  const analysisMetrics =
    metrikler || result?.metrikler || {};

  const organLabel =
    organ === "beyin"
      ? "Beyin"
      : organ === "bobrek"
        ? "Böbrek"
        : organ || "-";

  const modelLabel =
    model === "unet"
      ? "U-Net"
      : model === "unet_plus"
        ? "U-Net++"
        : model || "-";

  const dateValue =
    tarih || created_at || null;

  const analizTarihi = dateValue
    ? new Date(dateValue).toLocaleString("tr-TR")
    : "-";

  return (
    <DashboardLayout title="Analiz Detayı">
      <div className={styles.container}>

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className={styles.header}>
          <div>

            <div className={styles.breadcrumb}>
              Analizler / Analiz #{id}
            </div>

            <h1 className={styles.pageTitle}>
              Analiz #{id}
            </h1>

            <p className={styles.pageDescription}>
              Yapay zeka destekli medikal görüntü
              analizinin detayları
            </p>

          </div>

          <button
            className={styles.newAnalysisButton}
            onClick={() => navigate("/analyze")}
          >
            + Yeni Analiz
          </button>
        </div>

        {/* ================================================= */}
        {/* TEMEL BİLGİLER */}
        {/* ================================================= */}

        <div className={styles.infoGrid}>

          <div className={styles.infoCard}>
            <span className={styles.infoLabel}>
              Hasta TC Kimlik
            </span>

            <strong className={styles.infoValue}>
              {hastaTc}
            </strong>
          </div>

          <div className={styles.infoCard}>
            <span className={styles.infoLabel}>
              İncelenen Organ
            </span>

            <strong className={styles.infoValue}>
              {organLabel}
            </strong>
          </div>

          <div className={styles.infoCard}>
            <span className={styles.infoLabel}>
              Yapay Zeka Modeli
            </span>

            <strong className={styles.infoValue}>
              {modelLabel}
            </strong>
          </div>

          <div className={styles.infoCard}>
            <span className={styles.infoLabel}>
              Analiz Tarihi
            </span>

            <strong className={styles.infoValue}>
              {analizTarihi}
            </strong>
          </div>

        </div>

        {/* ================================================= */}
        {/* GÖRÜNTÜLER */}
        {/* ================================================= */}

        <div className={styles.sectionCard}>

          <div className={styles.sectionHeader}>
            <div>
              <h2>Görüntüleme Sonuçları</h2>

              <p>
                Orijinal görüntü, AI segmentasyonu ve
                birleştirilmiş analiz sonucu
              </p>
            </div>
          </div>

          <div className={styles.imageGrid}>

            {/* ORİJİNAL */}
            <div className={styles.imageCard}>

              <div className={styles.imageCardHeader}>
                <span>Orijinal MR</span>
              </div>

              <div className={styles.imageWrapper}>

                {originalImage ? (
                  <img
                    src={originalImage}
                    alt="Orijinal MR"
                  />
                ) : (
                  <span>
                    Görüntü bulunamadı
                  </span>
                )}

              </div>

            </div>

            {/* SEGMENTASYON */}
            <div className={styles.imageCard}>

              <div className={styles.imageCardHeader}>
                <span>AI Segmentasyonu</span>
              </div>

              <div className={styles.imageWrapper}>

                {segmentationImage ? (
                  <img
                    src={segmentationImage}
                    alt="AI Segmentasyonu"
                  />
                ) : (
                  <span>
                    Segmentasyon görüntüsü bulunamadı
                  </span>
                )}

              </div>

            </div>

            {/* OVERLAY */}
            <div className={styles.imageCard}>

              <div className={styles.imageCardHeader}>
                <span>MR + AI Örtüşmesi</span>
              </div>

              <div className={styles.imageWrapper}>

                {combinedImage ? (
                  <img
                    src={combinedImage}
                    alt="MR ve AI Örtüşmesi"
                  />
                ) : (
                  <span>
                    Örtüşme görüntüsü bulunamadı
                  </span>
                )}

              </div>

            </div>

          </div>
        </div>

        {/* ================================================= */}
        {/* METRİKLER */}
        {/* ================================================= */}

        <div className={styles.sectionCard}>

          <div className={styles.sectionHeader}>
            <div>

              <h2>Analiz Metrikleri</h2>

              <p>
                Yapay zeka modeli tarafından hesaplanan
                sayısal bulgular
              </p>

            </div>
          </div>

          <div className={styles.metricsGrid}>

            <div className={styles.metricCard}>

              <span className={styles.metricLabel}>
                Patoloji / Tümör
              </span>

              <strong className={styles.metricDanger}>
                %
                {analysisMetrics.patoloji_yuzdesi ??
                  "-"}
              </strong>

            </div>

            <div className={styles.metricCard}>

              <span className={styles.metricLabel}>
                AI Güven Skoru
              </span>

              <strong className={styles.metricSuccess}>
                %
                {analysisMetrics.guven_skoru ??
                  "-"}
              </strong>

            </div>

            <div className={styles.metricCard}>

              <span className={styles.metricLabel}>
                Fiziksel Alan
              </span>

              <strong className={styles.metricValue}>
                {analysisMetrics.alan_mm2 ??
                  "-"}{" "}
                mm²
              </strong>

            </div>

            <div className={styles.metricCard}>

              <span className={styles.metricLabel}>
                Çevre Uzunluğu
              </span>

              <strong className={styles.metricValue}>
                {analysisMetrics.cevre_mm ??
                  "-"}{" "}
                mm
              </strong>

            </div>

          </div>
        </div>

        {/* ================================================= */}
        {/* DOKTOR DEĞERLENDİRMESİ */}
        {/* ================================================= */}

        <div className={styles.sectionCard}>

          <div className={styles.sectionHeader}>
            <div>

              <h2>Doktor Değerlendirmesi</h2>

              <p>
                Analiz sonucuna ilişkin klinik
                değerlendirme ve doktor notu
              </p>

            </div>
          </div>

          <div className={styles.doctorNote}>

            {doktorDegerlendirmesi?.trim() ? (
              <p>
                {doktorDegerlendirmesi}
              </p>
            ) : (
              <p className={styles.noNote}>
                Bu analiz için doktor değerlendirmesi
                bulunmuyor.
              </p>
            )}

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default AnalysisDetail;