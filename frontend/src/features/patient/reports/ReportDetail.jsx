import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";

import DashboardLayout from "../../../layouts/DashboardLayout";
import { getMyReportById } from "../../../services/patientService";
import styles from "./ReportDetail.module.css";

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const reportRef = useRef(null);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [transparentMask, setTransparentMask] = useState(null);
  const [overlayImage, setOverlayImage] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyReportById(id);

        if (!data.basarili) {
          setError(data.mesaj || "Rapor getirilemedi.");
          return;
        }

        setReport(data.rapor);
      } catch (err) {
        console.error("Rapor detay yükleme hatası:", err);

        setError(
          err.response?.data?.mesaj || "Rapor yüklenirken bir hata oluştu.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [id]);

  useEffect(() => {
    if (!report?.mask_image) {
      setTransparentMask(null);
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

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          if (r < 30 && g < 30 && b < 30) {
            data[i + 3] = 0;
          }
        }

        ctx.putImageData(imageData, 0, 0);

        setTransparentMask(canvas.toDataURL("image/png"));
      } catch (err) {
        console.error("Maske işleme hatası:", err);
        setTransparentMask(report.mask_image);
      }
    };

    img.onerror = () => {
      setTransparentMask(report.mask_image);
    };

    img.src = report.mask_image;
  }, [report]);

  useEffect(() => {
    if (!report?.original_image || !transparentMask) {
      setOverlayImage(null);
      return;
    }

    const original = new Image();
    const mask = new Image();

    original.crossOrigin = "anonymous";
    mask.crossOrigin = "anonymous";

    let originalLoaded = false;
    let maskLoaded = false;

    const createOverlay = () => {
      if (!originalLoaded || !maskLoaded) return;

      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = original.naturalWidth || original.width;

        canvas.height = original.naturalHeight || original.height;

        ctx.drawImage(original, 0, 0, canvas.width, canvas.height);

        ctx.globalAlpha = 0.55;

        ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);

        ctx.globalAlpha = 1;

        setOverlayImage(canvas.toDataURL("image/png"));
      } catch (err) {
        console.error("Overlay oluşturma hatası:", err);

        setOverlayImage(null);
      }
    };

    original.onload = () => {
      originalLoaded = true;
      createOverlay();
    };

    mask.onload = () => {
      maskLoaded = true;
      createOverlay();
    };

    original.src = report.original_image;
    mask.src = transparentMask;
  }, [report, transparentMask]);

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

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatBirthDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;

    try {
      setPdfLoading(true);

      await html2pdf()
        .set({
          margin: 0,
          filename: `PathoVision_Rapor_${report.id}.pdf`,
          image: {
            type: "jpeg",
            quality: 0.98,
          },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
          },
          pagebreak: {
            mode: ["avoid-all", "css", "legacy"],
          },
        })
        .from(reportRef.current)
        .save();
    } catch (err) {
      console.error("PDF oluşturma hatası:", err);
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Rapor Detayı">
        <div className={styles.stateCard}>
          <div className={styles.spinner} />
          <h2>Rapor yükleniyor...</h2>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !report) {
    return (
      <DashboardLayout title="Rapor Detayı">
        <div className={styles.stateCard}>
          <div className={styles.errorIcon}>!</div>
          <h2>Rapor bulunamadı</h2>
          <p>{error}</p>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => navigate("/patient/reports")}
          >
            Raporlara Dön
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const metrics = report.metrikler || {};

  return (
    <DashboardLayout title="Rapor Detayı">
      <div className={styles.page}>
        <div className={styles.toolbar}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate("/patient/reports")}
          >
            ← Raporlara Dön
          </button>

          <button
            type="button"
            className={styles.downloadButton}
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
          >
            {pdfLoading ? "PDF Hazırlanıyor..." : "PDF İndir"}
          </button>
        </div>

        <div ref={reportRef} className={styles.document}>
          <header className={styles.documentHeader}>
            <div className={styles.brand}>
              <img src="/logo_pathovision.png" alt="PathoVision" />

              <div>
                <strong>PATHOVISION</strong>
                <span>Medikal Görüntüleme Sistemi</span>
              </div>
            </div>

            <div className={styles.headerTitle}>
              <h1>TIBBİ GÖRÜNTÜLEME VE YAPAY ZEKÂ ANALİZ RAPORU</h1>
            </div>
          </header>

          <div className={styles.documentMeta}>
            <div>
              <span>Rapor No</span>
              <strong>PV-R-{String(report.id).padStart(6, "0")}</strong>
            </div>

            <div>
              <span>Analiz No</span>
              <strong>PV-A-{String(report.analiz_id).padStart(6, "0")}</strong>
            </div>

            <div>
              <span>Rapor Tarihi</span>
              <strong>{formatDate(report.olusturulma_tarihi)}</strong>
            </div>
          </div>

          <section className={styles.reportSection}>
            <div className={styles.sectionTitle}>HASTA BİLGİLERİ</div>

            <table className={styles.infoTable}>
              <tbody>
                <tr>
                  <th>Ad</th>
                  <td>{report.ad || "-"}</td>

                  <th>Soyad</th>
                  <td>{report.soyad || "-"}</td>
                </tr>

                <tr>
                  <th>T.C. Kimlik Numarası</th>
                  <td>{report.tc_kimlik || "-"}</td>

                  <th>Cinsiyet</th>
                  <td>
                    {report.cinsiyet === "erkek"
                      ? "Erkek"
                      : report.cinsiyet === "kadin"
                        ? "Kadın"
                        : report.cinsiyet || "-"}
                  </td>
                </tr>

                <tr>
                  <th>Kan Grubu</th>
                  <td>{report.kan_grubu || "-"}</td>

                  <th>Doğum Tarihi</th>
                  <td>{formatBirthDate(report.dogum_tarihi)}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className={styles.reportSection}>
            <div className={styles.sectionTitle}>İNCELEME BİLGİLERİ</div>

            <table className={styles.infoTable}>
              <tbody>
                <tr>
                  <th>Analiz Adı</th>
                  <td>{report.analiz_adi || "-"}</td>
                  <th>İncelenen Organ</th>
                  <td>{getOrganLabel(report.organ)}</td>
                </tr>

                <tr>
                  <th>Analiz Modeli</th>
                  <td>{getModelLabel(report.model)}</td>
                  <th>Analiz Durumu</th>
                  <td>
                    {report.durum === "onaylandi"
                      ? "Onaylandı"
                      : report.durum === "tamamlandi"
                        ? "Tamamlandı"
                        : report.durum || "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className={styles.reportSection}>
            <div className={styles.sectionTitle}>GÖRÜNTÜLEME BULGULARI</div>

            <div className={styles.imageGrid}>
              <div className={styles.imageBox}>
                <div className={styles.imageTitle}>Orijinal MR</div>

                <div className={styles.imageContent}>
                  {report.original_image ? (
                    <img src={report.original_image} alt="Orijinal MR" />
                  ) : (
                    <span>Görüntü bulunamadı</span>
                  )}
                </div>
              </div>

              <div className={styles.imageBox}>
                <div className={styles.imageTitle}>AI Segmentasyonu</div>

                <div className={styles.imageContent}>
                  {transparentMask ? (
                    <img src={transparentMask} alt="AI Segmentasyonu" />
                  ) : (
                    <span>Görüntü bulunamadı</span>
                  )}
                </div>
              </div>

              <div className={styles.imageBox}>
                <div className={styles.imageTitle}>MR + AI Örtüşmesi</div>

                <div className={styles.imageContent}>
                  {overlayImage ? (
                    <img src={overlayImage} alt="MR AI Örtüşmesi" />
                  ) : (
                    <span>Görüntü bulunamadı</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className={styles.reportSection}>
            <div className={styles.sectionTitle}>
              YAPAY ZEKÂ ÖLÇÜM SONUÇLARI
            </div>

            <table className={styles.resultTable}>
              <thead>
                <tr>
                  <th>Parametre</th>
                  <th>Sonuç</th>
                  <th>Birim</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>Patoloji / Tümör Oranı</td>
                  <td>{metrics.patoloji_yuzdesi ?? "-"}</td>
                  <td>%</td>
                </tr>

                <tr>
                  <td>AI Güven Skoru</td>
                  <td>{metrics.guven_skoru ?? "-"}</td>
                  <td>%</td>
                </tr>

                <tr>
                  <td>Fiziksel Alan</td>
                  <td>{metrics.alan_mm2 ?? "-"}</td>
                  <td>mm²</td>
                </tr>

                <tr>
                  <td>Çevre Uzunluğu</td>
                  <td>{metrics.cevre_mm ?? "-"}</td>
                  <td>mm</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className={styles.reportSection}>
            <div className={styles.sectionTitle}>HEKİM DEĞERLENDİRMESİ</div>

            <div className={styles.doctorNote}>
              {report.doktor_notu?.trim() ||
                "Bu rapor için hekim değerlendirmesi bulunmamaktadır."}
            </div>
          </section>

          <div className={styles.signatureArea}>
            <div>
              <span>Rapor Oluşturulma Tarihi</span>

              <strong>{formatDate(report.olusturulma_tarihi)}</strong>
            </div>

            <div className={styles.digitalApproval}>
              <strong>Elektronik Rapor</strong>
              <span>PathoVision sistemi üzerinden oluşturulmuştur.</span>
            </div>
          </div>

          <footer className={styles.documentFooter}>
            <p>
              Bu rapor yapay zekâ destekli görüntüleme sonuçlarını ve hekim
              değerlendirmesini birlikte sunar. Klinik karar ve tanı
              süreçlerinde hekim değerlendirmesi esas alınmalıdır.
            </p>

            <div>
              PathoVision · Medikal Görüntüleme Sistemi · Rapor No: PV-R-
              {String(report.id).padStart(6, "0")}
            </div>
          </footer>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportDetail;
