import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import styles from "./AnalysisDetail.module.css";

const AnalysisDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // Şimdilik NewAnalysis sayfasından React Router state ile geliyor.
  const analysis = location.state?.analysis;

  if (!analysis) {
    return (
      <DashboardLayout title="Analiz Detayı">
        <div className={styles.container}>
          <div className={styles.emptyCard}>
            <div className={styles.emptyIcon}>!</div>

            <h2>Analiz bilgisi bulunamadı</h2>

            <p>
              Analiz #{id} bilgileri bulunamadı. Sayfa yenilenmiş veya analiz
              bilgileri bu oturuma aktarılmamış olabilir.
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

  const {
    tcKimlik,
    organ,
    model,
    preview,
    processedMask,
    overlayImage,
    result,
    doktorNotu,
    tarih,
  } = analysis;

  /*
    API yapımız:
    result.metrikler.patoloji_yuzdesi
    result.metrikler.guven_skoru
    result.metrikler.alan_mm2
    result.metrikler.cevre_mm
  */
  const metrikler = result?.metrikler || {};

  /*
    processedMask herhangi bir nedenle gelmezse
    backend'den gelen base64 maskeyi kullan.
  */
  const maskImage =
    processedMask ||
    (result?.maske_base64
      ? `data:image/png;base64,${result.maske_base64}`
      : null);

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

  const analizTarihi = tarih
    ? new Date(tarih).toLocaleString("tr-TR")
    : new Date().toLocaleString("tr-TR");

  return (
    <DashboardLayout title="Analiz Detayı">
      <div className={styles.container}>

        {/* ================================================= */}
        {/* ÜST BAŞLIK */}
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
              Yapay zeka destekli medikal görüntü analizinin detayları
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
        {/* HASTA VE ANALİZ BİLGİLERİ */}
        {/* ================================================= */}

        <div className={styles.infoGrid}>

          <div className={styles.infoCard}>
            <span className={styles.infoLabel}>
              Hasta TC Kimlik
            </span>

            <strong className={styles.infoValue}>
              {tcKimlik || "-"}
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
        {/* GÖRÜNTÜLEME SONUÇLARI */}
        {/* ================================================= */}

        <div className={styles.sectionCard}>

          <div className={styles.sectionHeader}>
            <div>
              <h2>Görüntüleme Sonuçları</h2>

              <p>
                Orijinal görüntü, AI segmentasyonu ve birleştirilmiş analiz
                sonucu
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
                {preview ? (
                  <img
                    src={preview}
                    alt="Orijinal MR"
                  />
                ) : (
                  <span>Görüntü bulunamadı</span>
                )}
              </div>

            </div>

            {/* SEGMENTASYON */}
            <div className={styles.imageCard}>

              <div className={styles.imageCardHeader}>
                <span>AI Segmentasyonu</span>
              </div>

              <div className={styles.imageWrapper}>
                {maskImage ? (
                  <img
                    src={maskImage}
                    alt="AI Segmentasyonu"
                  />
                ) : (
                  <span>Segmentasyon görüntüsü bulunamadı</span>
                )}
              </div>

            </div>

            {/* OVERLAY */}
            <div className={styles.imageCard}>

              <div className={styles.imageCardHeader}>
                <span>MR + AI Örtüşmesi</span>
              </div>

              <div className={styles.imageWrapper}>
                {overlayImage ? (
                  <img
                    src={overlayImage}
                    alt="MR ve AI Örtüşmesi"
                  />
                ) : (
                  <span>Örtüşme görüntüsü bulunamadı</span>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* ANALİZ METRİKLERİ */}
        {/* ================================================= */}

        <div className={styles.sectionCard}>

          <div className={styles.sectionHeader}>
            <div>
              <h2>Analiz Metrikleri</h2>

              <p>
                Yapay zeka modeli tarafından hesaplanan sayısal bulgular
              </p>
            </div>
          </div>

          <div className={styles.metricsGrid}>

            {/* PATOLOJİ */}
            <div className={styles.metricCard}>

              <span className={styles.metricLabel}>
                Patoloji / Tümör
              </span>

              <strong className={styles.metricDanger}>
                %{metrikler.patoloji_yuzdesi ?? "-"}
              </strong>

            </div>

            {/* GÜVEN */}
            <div className={styles.metricCard}>

              <span className={styles.metricLabel}>
                AI Güven Skoru
              </span>

              <strong className={styles.metricSuccess}>
                %{metrikler.guven_skoru ?? "-"}
              </strong>

            </div>

            {/* ALAN */}
            <div className={styles.metricCard}>

              <span className={styles.metricLabel}>
                Fiziksel Alan
              </span>

              <strong className={styles.metricValue}>
                {metrikler.alan_mm2 ?? "-"} mm²
              </strong>

            </div>

            {/* ÇEVRE */}
            <div className={styles.metricCard}>

              <span className={styles.metricLabel}>
                Çevre Uzunluğu
              </span>

              <strong className={styles.metricValue}>
                {metrikler.cevre_mm ?? "-"} mm
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
                Analiz sonucuna ilişkin klinik değerlendirme ve doktor notu
              </p>
            </div>
          </div>

          <div className={styles.doctorNote}>

            {doktorNotu?.trim() ? (
              <p>{doktorNotu}</p>
            ) : (
              <p className={styles.noNote}>
                Bu analiz için doktor değerlendirmesi bulunmuyor.
              </p>
            )}

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default AnalysisDetail;