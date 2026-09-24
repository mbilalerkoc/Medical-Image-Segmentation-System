import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import styles from './AnalysisDetail.module.css';

const AnalysisDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  /*
    Şimdilik analiz verisini bir önceki sayfadan state ile taşıyoruz.

    Daha sonra:
    GET /api/analyses/:id

    şeklinde backend'den çekebiliriz.
  */
  const analysis = location.state?.analysis;

  if (!analysis) {
    return (
      <DashboardLayout title="Analiz Detayı">
        <div className={styles.container}>
          <div className={styles.emptyCard}>
            <div className={styles.emptyIcon}>!</div>

            <h2>Analiz bilgisi bulunamadı</h2>

            <p>
              Analiz #{id} bilgileri bu oturumda bulunamadı.
            </p>

            <button
              className={styles.primaryButton}
              onClick={() => navigate('/analyze')}
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
    doktorNotu
  } = analysis;

  const tarih = new Date().toLocaleString('tr-TR');

  return (
    <DashboardLayout title="Analiz Detayı">
      <div className={styles.container}>

        {/* ÜST BAŞLIK */}
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
            onClick={() => navigate('/analyze')}
          >
            + Yeni Analiz
          </button>
        </div>

        {/* HASTA VE ANALİZ BİLGİLERİ */}
        <div className={styles.infoGrid}>

          <div className={styles.infoCard}>
            <span className={styles.infoLabel}>
              Hasta TC Kimlik
            </span>

            <strong className={styles.infoValue}>
              {tcKimlik}
            </strong>
          </div>

          <div className={styles.infoCard}>
            <span className={styles.infoLabel}>
              İncelenen Organ
            </span>

            <strong className={styles.infoValue}>
              {organ === 'beyin'
                ? 'Beyin'
                : organ === 'bobrek'
                ? 'Böbrek'
                : organ}
            </strong>
          </div>

          <div className={styles.infoCard}>
            <span className={styles.infoLabel}>
              Yapay Zeka Modeli
            </span>

            <strong className={styles.infoValue}>
              {model === 'unet'
                ? 'U-Net'
                : model === 'unet_plus'
                ? 'U-Net++'
                : model}
            </strong>
          </div>

          <div className={styles.infoCard}>
            <span className={styles.infoLabel}>
              Analiz Tarihi
            </span>

            <strong className={styles.infoValue}>
              {tarih}
            </strong>
          </div>

        </div>

        {/* GÖRÜNTÜLER */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Görüntüleme Sonuçları</h2>
              <p>
                Orijinal görüntü, AI segmentasyonu ve birleştirilmiş sonuç
              </p>
            </div>
          </div>

          <div className={styles.imageGrid}>

            <div className={styles.imageCard}>
              <div className={styles.imageCardHeader}>
                <span>Orijinal MR</span>
              </div>

              <div className={styles.imageWrapper}>
                {preview && (
                  <img
                    src={preview}
                    alt="Orijinal MR"
                  />
                )}
              </div>
            </div>

            <div className={styles.imageCard}>
              <div className={styles.imageCardHeader}>
                <span>AI Segmentasyonu</span>
              </div>

              <div className={styles.imageWrapper}>
                {processedMask && (
                  <img
                    src={processedMask}
                    alt="AI Segmentasyonu"
                  />
                )}
              </div>
            </div>

            <div className={styles.imageCard}>
              <div className={styles.imageCardHeader}>
                <span>MR + AI Örtüşmesi</span>
              </div>

              <div className={styles.imageWrapper}>
                {overlayImage && (
                  <img
                    src={overlayImage}
                    alt="MR ve AI Örtüşmesi"
                  />
                )}
              </div>
            </div>

          </div>
        </div>

        {/* METRİKLER */}
        <div className={styles.sectionCard}>

          <div className={styles.sectionHeader}>
            <div>
              <h2>Analiz Metrikleri</h2>
              <p>Yapay zeka modeli tarafından oluşturulan ölçümler</p>
            </div>
          </div>

          <div className={styles.metricsGrid}>

            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>
                Patoloji / Tümör
              </span>

              <strong className={styles.metricDanger}>
                %{result?.tumor_yuzdesi ?? result?.patoloji_yuzdesi ?? '-'}
              </strong>
            </div>

            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>
                AI Güven Skoru
              </span>

              <strong className={styles.metricSuccess}>
                %{result?.guven_skoru ?? '-'}
              </strong>
            </div>

            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>
                Fiziksel Alan
              </span>

              <strong className={styles.metricValue}>
                {result?.alan_mm2 ?? result?.alan ?? '-'} mm²
              </strong>
            </div>

            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>
                Çevre Uzunluğu
              </span>

              <strong className={styles.metricValue}>
                {result?.cevre_mm ?? result?.cevre ?? '-'} mm
              </strong>
            </div>

          </div>

        </div>

        {/* DOKTOR DEĞERLENDİRMESİ */}
        <div className={styles.sectionCard}>

          <div className={styles.sectionHeader}>
            <div>
              <h2>Doktor Değerlendirmesi</h2>
              <p>Analiz sonucuna ilişkin klinik değerlendirme</p>
            </div>
          </div>

          <div className={styles.doctorNote}>
            {doktorNotu ? (
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