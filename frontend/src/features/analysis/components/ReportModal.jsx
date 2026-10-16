import React, { useEffect, useState } from "react";
import { createReport } from "../../../services/analysisService";
import useToast from "../../../hooks/useToast";
import styles from "./ReportModal.module.css";

const ReportModal = ({
  isOpen,
  onClose,
  tcKimlik,
  organ,
  preview,
  result,
  processedMask,
  overlayImage,
  analizId,
  onViewAnalysis,
}) => {
  const toast = useToast();

  const [doktorNotu, setDoktorNotu] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // YENİ ANALİZDE RAPORU SIFIRLA
  useEffect(() => {
    setSaved(false);
    setDoktorNotu("");
  }, [analizId]);

  if (!isOpen) return null;

  const handlePrintPDF = () => {
    window.print();
  };

  // RAPORU KAYDET
  const handleSaveAndShare = async () => {
    if (!analizId) {
      toast.error("Analiz ID bulunamadı. Lütfen önce analiz işlemini tamamlayın.");
      return;
    }

    let doktorId = null;

    try {
      const userStr = localStorage.getItem("user");
      const userObj = userStr ? JSON.parse(userStr) : null;
      doktorId = userObj?.id;
    } catch (error) {
      console.error("Kullanıcı bilgisi okunamadı:", error);
    }

    if (!doktorId) {
      toast.error("Doktor bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        tc_kimlik: tcKimlik,
        analiz_id: analizId,
        doktor_id: doktorId,
        pdf_yolu: "Sistem üzerinden PDF alınabilir",
        doktor_notu: doktorNotu,
      };

      const data = await createReport(payload);

      if (!data.basarili) {
        toast.error(data.mesaj || "Rapor kaydedilirken bir hata oluştu.");
        return;
      }

      setSaved(true);
      toast.success("Rapor başarıyla kaydedildi.");
    } catch (error) {
      console.error("Rapor kayıt hatası:", error);
      toast.error(
        error.response?.data?.mesaj ||
          "Rapor kaydı sırasında bir hata oluştu.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewAnalysis = () => {
    if (onViewAnalysis) onViewAnalysis(doktorNotu);
  };

  const organLabel =
    organ === "beyin" ? "Beyin" : organ === "bobrek" ? "Böbrek" : organ || "-";

  return (
    <div
      className={styles.modalOverlay}
      onMouseDown={() => !isSaving && onClose()}
    >
      <div className={styles.modalCard} onMouseDown={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className={styles.modalHeader}>
          <div>
            <h2>PathoVision Tıbbi Analiz Raporu</h2>
            <p>Analiz sonuçlarını değerlendirin ve raporu kaydedin.</p>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            disabled={isSaving}
            aria-label="Kapat"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* RAPOR */}
        <div className={styles.reportContent}>
          {/* RAPOR BAŞLIĞI */}
          <div className={styles.reportHeader}>
            <div>
              <h1>PathoVision</h1>
              <p>Yapay Zeka Destekli Tıbbi Görüntüleme Raporu</p>
            </div>

            <div className={styles.reportMeta}>
              <p>
                Analiz No: <span>#{analizId}</span>
              </p>
              <p>
                Hasta TC: <span>{tcKimlik}</span>
              </p>
              <p>
                Tarih: <span>{new Date().toLocaleDateString("tr-TR")}</span>
              </p>
              <p>
                İncelenen Organ: <span>{organLabel}</span>
              </p>
            </div>
          </div>

          {/* GÖRÜNTÜLER */}
          <div className={styles.reportSection}>
            <h3>Görüntüleme Sonuçları</h3>

            <div className={styles.imageGrid}>
              <div className={styles.imageItem}>
                <p>Orijinal Tarama</p>

                {preview ? (
                  <img src={preview} alt="Orijinal MR" className={styles.originalImage} />
                ) : (
                  <div className={styles.imageEmpty}>Görüntü bulunamadı</div>
                )}
              </div>

              <div className={styles.imageItem}>
                <p className={styles.maskLabel}>AI Segmentasyon</p>

                {processedMask || result?.maske_base64 ? (
                  <img
                    src={
                      processedMask ||
                      `data:image/png;base64,${result?.maske_base64}`
                    }
                    alt="AI Segmentasyon Maskesi"
                    className={styles.maskImage}
                  />
                ) : (
                  <div className={styles.imageEmpty}>Maske bulunamadı</div>
                )}
              </div>

              <div className={styles.imageItem}>
                <p className={styles.overlayLabel}>MR + AI Örtüşmesi</p>

                {overlayImage ? (
                  <img
                    src={overlayImage}
                    alt="MR ve AI Segmentasyon Örtüşmesi"
                    className={styles.overlayImage}
                  />
                ) : (
                  <div className={styles.imageEmpty}>
                    Örtüşme görüntüsü hazırlanıyor...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SAYISAL BULGULAR */}
          <div className={styles.reportSection}>
            <h3>Sayısal Bulgular</h3>

            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <span>Patoloji / Tümör</span>
                <strong className={styles.metricDanger}>
                  %{result?.metrikler?.patoloji_yuzdesi ?? 0}
                </strong>
              </div>

              <div className={styles.metricCard}>
                <span>AI Güven Skoru</span>
                <strong className={styles.metricSuccess}>
                  %{result?.metrikler?.guven_skoru ?? 0}
                </strong>
              </div>

              <div className={styles.metricCard}>
                <span>Fiziksel Alan</span>
                <strong>{result?.metrikler?.alan_mm2 ?? 0} mm²</strong>
              </div>

              <div className={styles.metricCard}>
                <span>Çevre Uzunluğu</span>
                <strong>{result?.metrikler?.cevre_mm ?? 0} mm</strong>
              </div>
            </div>
          </div>

          {/* DOKTOR NOTU */}
          <div className={styles.reportSection}>
            <h3>Doktor Değerlendirmesi ve Teşhis</h3>

            <textarea
              value={doktorNotu}
              onChange={(e) => setDoktorNotu(e.target.value)}
              disabled={saved}
              placeholder="Tıbbi değerlendirmenizi ve notlarınızı buraya giriniz..."
              className={styles.doctorNote}
            />

            <p className={styles.printDoctorNote}>
              {doktorNotu || "Doktor tarafından henüz not girilmemiştir."}
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className={styles.modalFooter}>
          <button type="button" onClick={handlePrintPDF} className={styles.printButton}>
            PDF Olarak İndir / Yazdır
          </button>

          {!saved ? (
            <button
              type="button"
              onClick={handleSaveAndShare}
              disabled={isSaving}
              className={styles.saveButton}
            >
              {isSaving ? "Kaydediliyor..." : "Veritabanına Kaydet"}
            </button>
          ) : (
            <>
              <button type="button" onClick={handleViewAnalysis} className={styles.viewButton}>
                Analizi Görüntüle →
              </button>

              <button type="button" onClick={onClose} className={styles.closeFooterButton}>
                Kapat
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportModal;