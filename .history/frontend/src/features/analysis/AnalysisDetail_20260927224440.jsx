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

  const routerAnalysis = location.state?.analysis || null;

  const [analysis, setAnalysis] = useState(routerAnalysis);
  const [loading, setLoading] = useState(!routerAnalysis);
  const [error, setError] = useState(null);

  // Siyah arka planı temizlenmiş maske
  const [transparentMask, setTransparentMask] = useState(null);

  // MR + AI birleşmiş görüntü
  const [generatedOverlay, setGeneratedOverlay] = useState(null);

  // =====================================================
  // ANALİZİ BACKEND'DEN GETİR
  // =====================================================

  useEffect(() => {
    if (routerAnalysis) {
      return;
    }

    const loadAnalysis = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getAnalysisById(id);

        if (data.basarili) {
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

  // =====================================================
  // MASKENİN SİYAH ARKA PLANINI ŞEFFAF YAP
  // =====================================================

  useEffect(() => {
    if (!analysis) {
      setTransparentMask(null);
      return;
    }

    const result = analysis.result;

    const maskSource =
      analysis.processedMask ||
      analysis.mask_image ||
      (result?.maske_base64
        ? `data:image/png;base64,${result.maske_base64}`
        : null);

    if (!maskSource) {
      setTransparentMask(null);
      return;
    }

    // Eğer NewAnalysis'ten zaten işlenmiş maske geldiyse
    // tekrar işlemeye gerek yok.
    if (analysis.processedMask) {
      setTransparentMask(analysis.processedMask);
      return;
    }

    const img = new Image();

    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        ctx.drawImage(
          img,
          0,
          0,
          canvas.width,
          canvas.height
        );

        const imageData = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );

        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Siyah ve siyaha yakın alanları şeffaflaştır
          if (r < 30 && g < 30 && b < 30) {
            data[i + 3] = 0;
          }
        }

        ctx.putImageData(
          imageData,
          0,
          0
        );

        setTransparentMask(
          canvas.toDataURL("image/png")
        );
      } catch (err) {
        console.error(
          "Maske işleme hatası:",
          err
        );

        // İşleme başarısız olursa orijinal maskeyi göster
        setTransparentMask(maskSource);
      }
    };

    img.onerror = () => {
      console.error(
        "Maske görüntüsü yüklenemedi."
      );

      setTransparentMask(maskSource);
    };

    img.src = maskSource;
  }, [analysis]);

  // =====================================================
  // ORİJİNAL MR + ŞEFFAF MASKE = OVERLAY
  // =====================================================

  useEffect(() => {
    if (!analysis || !transparentMask) {
      setGeneratedOverlay(null);
      return;
    }

    // Eğer NewAnalysis'ten hazır overlay geldiyse onu kullan
    if (analysis.overlayImage) {
      setGeneratedOverlay(analysis.overlayImage);
      return;
    }

    if (analysis.overlay_image) {
      setGeneratedOverlay(analysis.overlay_image);
      return;
    }

    const originalSource =
      analysis.preview ||
      analysis.original_image ||
      null;

    if (!originalSource) {
      setGeneratedOverlay(null);
      return;
    }

    const baseImage = new Image();
    const maskImage = new Image();

    baseImage.crossOrigin = "anonymous";
    maskImage.crossOrigin = "anonymous";

    baseImage.onload = () => {
      maskImage.onload = () => {
        try {
          const canvas =
            document.createElement("canvas");

          const ctx =
            canvas.getContext("2d");

          canvas.width =
            baseImage.naturalWidth ||
            baseImage.width;

          canvas.height =
            baseImage.naturalHeight ||
            baseImage.height;

          // Önce MR görüntüsünü çiz
          ctx.drawImage(
            baseImage,
            0,
            0,
            canvas.width,
            canvas.height
          );

          // Sonra şeffaf AI maskesini üzerine çiz
          ctx.drawImage(
            maskImage,
            0,
            0,
            canvas.width,
            canvas.height
          );

          setGeneratedOverlay(
            canvas.toDataURL("image/png")
          );
        } catch (err) {
          console.error(
            "Overlay oluşturma hatası:",
            err
          );

          setGeneratedOverlay(null);
        }
      };

      maskImage.src = transparentMask;
    };

    baseImage.onerror = () => {
      console.error(
        "Orijinal görüntü overlay için yüklenemedi."
      );

      setGeneratedOverlay(null);
    };

    maskImage.onerror = () => {
      console.error(
        "Maske overlay için yüklenemedi."
      );

      setGeneratedOverlay(null);
    };

    baseImage.src = originalSource;
  }, [analysis, transparentMask]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <DashboardLayout title="Analiz Detayı">
        <div className={styles.container}>
          <div className={styles.emptyCard}>
            <div
              className={styles.loadingSpinner}
            ></div>

            <h2>Analiz yükleniyor...</h2>

            <p>
              Analiz #{id} bilgileri getiriliyor.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !analysis) {
    return (
      <DashboardLayout title="Analiz Detayı">
        <div className={styles.container}>
          <div className={styles.emptyCard}>
            <div className={styles.emptyIcon}>
              !
            </div>

            <h2>
              Analiz bilgisi bulunamadı
            </h2>

            <p>
              {error ||
                `Analiz #${id} bilgileri bulunamadı.`}
            </p>

            <button
              className={styles.primaryButton}
              onClick={() =>
                navigate("/analyze")
              }
            >
              Yeni Analize Dön
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // =====================================================
  // ANALİZ VERİLERİ
  // =====================================================

  const {
    tcKimlik,
    tc_kimlik,

    organ,
    model,

    preview,
    original_image,

    result,
    metrikler,

    doktorNotu,
    doktor_notu,

    tarih,
    created_at,
  } = analysis;

  const hastaTc =
    tcKimlik ||
    tc_kimlik ||
    "-";

  const originalImage =
    preview ||
    original_image ||
    null;

  // Artık ekranda siyah arka planlı maske yerine
  // işlenmiş şeffaf maskeyi kullanıyoruz.
  const segmentationImage =
    transparentMask ||
    analysis.processedMask ||
    analysis.mask_image ||
    (result?.maske_base64
      ? `data:image/png;base64,${result.maske_base64}`
      : null);

  const combinedImage =
    generatedOverlay ||
    analysis.overlayImage ||
    analysis.overlay_image ||
    null;

  const doktorDegerlendirmesi =
    doktorNotu ||
    doktor_notu ||
    "";

  const analysisMetrics =
    metrikler ||
    result?.metrikler ||
    {};

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
    tarih ||
    created_at ||
    null;

  const analizTarihi = dateValue
    ? new Date(
        dateValue
      ).toLocaleString("tr-TR")
    : "-";

  return (
    <DashboardLayout title="Analiz Detayı">
      <div className={styles.container}>

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className={styles.header}>
          <div>
            <div
              className={styles.breadcrumb}
            >
              Analizler / Analiz #{id}
            </div>

            <h1
              className={styles.pageTitle}
            >
              Analiz #{id}
            </h1>

            <p
              className={
                styles.pageDescription
              }
            >
              Yapay zeka destekli medikal
              görüntü analizinin detayları
            </p>
          </div>

          <button
            className={
              styles.newAnalysisButton
            }
            onClick={() =>
              navigate("/analyze")
            }
          >
            + Yeni Analiz
          </button>
        </div>

        {/* ================================================= */}
        {/* TEMEL BİLGİLER */}
        {/* ================================================= */}

        <div className={styles.infoGrid}>

          <div className={styles.infoCard}>
            <span
              className={styles.infoLabel}
            >
              Hasta TC Kimlik
            </span>

            <strong
              className={styles.infoValue}
            >
              {hastaTc}
            </strong>
          </div>

          <div className={styles.infoCard}>
            <span
              className={styles.infoLabel}
            >
              İncelenen Organ
            </span>

            <strong
              className={styles.infoValue}
            >
              {organLabel}
            </strong>
          </div>

          <div className={styles.infoCard}>
            <span
              className={styles.infoLabel}
            >
              Yapay Zeka Modeli
            </span>

            <strong
              className={styles.infoValue}
            >
              {modelLabel}
            </strong>
          </div>

          <div className={styles.infoCard}>
            <span
              className={styles.infoLabel}
            >
              Analiz Tarihi
            </span>

            <strong
              className={styles.infoValue}
            >
              {analizTarihi}
            </strong>
          </div>

        </div>

        {/* ================================================= */}
        {/* GÖRÜNTÜLEME SONUÇLARI */}
        {/* ================================================= */}

        <div className={styles.sectionCard}>

          <div
            className={styles.sectionHeader}
          >
            <div>
              <h2>
                Görüntüleme Sonuçları
              </h2>

              <p>
                Orijinal görüntü, AI
                segmentasyonu ve
                birleştirilmiş analiz sonucu
              </p>
            </div>
          </div>

          <div className={styles.imageGrid}>

            {/* ORİJİNAL MR */}

            <div className={styles.imageCard}>

              <div
                className={
                  styles.imageCardHeader
                }
              >
                <span>
                  Orijinal MR
                </span>
              </div>

              <div
                className={
                  styles.imageWrapper
                }
              >
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

            {/* AI SEGMENTASYONU */}

            <div className={styles.imageCard}>

              <div
                className={
                  styles.imageCardHeader
                }
              >
                <span>
                  AI Segmentasyonu
                </span>
              </div>

              <div
                className={
                  styles.imageWrapper
                }
              >
                {segmentationImage ? (
                  <img
                    src={segmentationImage}
                    alt="AI Segmentasyonu"
                  />
                ) : (
                  <span>
                    Segmentasyon görüntüsü
                    bulunamadı
                  </span>
                )}
              </div>

            </div>

            {/* MR + AI OVERLAY */}

            <div className={styles.imageCard}>

              <div
                className={
                  styles.imageCardHeader
                }
              >
                <span>
                  MR + AI Örtüşmesi
                </span>
              </div>

              <div
                className={
                  styles.imageWrapper
                }
              >
                {combinedImage ? (
                  <img
                    src={combinedImage}
                    alt="MR ve AI Örtüşmesi"
                  />
                ) : (
                  <span>
                    Örtüşme görüntüsü
                    hazırlanıyor...
                  </span>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* ================================================= */}
        {/* ANALİZ METRİKLERİ */}
        {/* ================================================= */}

        <div className={styles.sectionCard}>

          <div
            className={styles.sectionHeader}
          >
            <div>
              <h2>
                Analiz Metrikleri
              </h2>

              <p>
                Yapay zeka modeli tarafından
                hesaplanan sayısal bulgular
              </p>
            </div>
          </div>

          <div className={styles.metricsGrid}>

            <div className={styles.metricCard}>

              <span
                className={
                  styles.metricLabel
                }
              >
                Patoloji / Tümör
              </span>

              <strong
                className={
                  styles.metricDanger
                }
              >
                %
                {analysisMetrics
                  .patoloji_yuzdesi ?? "-"}
              </strong>

            </div>

            <div className={styles.metricCard}>

              <span
                className={
                  styles.metricLabel
                }
              >
                AI Güven Skoru
              </span>

              <strong
                className={
                  styles.metricSuccess
                }
              >
                %
                {analysisMetrics
                  .guven_skoru ?? "-"}
              </strong>

            </div>

            <div className={styles.metricCard}>

              <span
                className={
                  styles.metricLabel
                }
              >
                Fiziksel Alan
              </span>

              <strong
                className={
                  styles.metricValue
                }
              >
                {analysisMetrics
                  .alan_mm2 ?? "-"}{" "}
                mm²
              </strong>

            </div>

            <div className={styles.metricCard}>

              <span
                className={
                  styles.metricLabel
                }
              >
                Çevre Uzunluğu
              </span>

              <strong
                className={
                  styles.metricValue
                }
              >
                {analysisMetrics
                  .cevre_mm ?? "-"}{" "}
                mm
              </strong>

            </div>

          </div>
        </div>

        {/* ================================================= */}
        {/* DOKTOR DEĞERLENDİRMESİ */}
        {/* ================================================= */}

        <div className={styles.sectionCard}>

          <div
            className={styles.sectionHeader}
          >
            <div>
              <h2>
                Doktor Değerlendirmesi
              </h2>

              <p>
                Analiz sonucuna ilişkin klinik
                değerlendirme ve doktor notu
              </p>
            </div>
          </div>

          <div
            className={styles.doctorNote}
          >

            {doktorDegerlendirmesi?.trim() ? (
              <p>
                {doktorDegerlendirmesi}
              </p>
            ) : (
              <p
                className={styles.noNote}
              >
                Bu analiz için doktor
                değerlendirmesi bulunmuyor.
              </p>
            )}

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default AnalysisDetail;