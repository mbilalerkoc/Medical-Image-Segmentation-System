import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UTIF from "utif";
import DashboardLayout from "../../layouts/DashboardLayout";
import { predictAnalysis } from "../../services/analysisService";
import useToast from "../../hooks/useToast";
import styles from "./NewAnalysis.module.css";

import AnalysisForm from "./components/AnalysisForm";
import AnalysisResults from "./components/AnalysisResults";
import OverlayModal from "./components/OverlayModal";
import ReportModal from "./components/ReportModal";

const NewAnalysis = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [tcKimlik, setTcKimlik] = useState("");
  const [analizAdi, setAnalizAdi] = useState("");
  const [organ, setOrgan] = useState("beyin");
  const [model, setModel] = useState("unet");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [doktorKlinikId, setDoktorKlinikId] = useState("1");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [analizId, setAnalizId] = useState(null);

  const [processedMask, setProcessedMask] = useState(null);
  const [overlayImage, setOverlayImage] = useState(null);

  const [isOverlayModalOpen, setIsOverlayModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  /* KULLANICI KLİNİK BİLGİSİ */
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;

      const userObj = JSON.parse(userStr);

      if (userObj.klinik_id) {
        setDoktorKlinikId(userObj.klinik_id);
      }
    } catch (error) {
      console.error("Kullanıcı bilgisi okunamadı:", error);
    }
  }, []);

  /* MASKENİN SİYAH ARKA PLANINI ŞEFFAF YAP */
  useEffect(() => {
    if (!result?.maske_base64) {
      setProcessedMask(null);
      return;
    }

    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        );

        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          if (
            data[i] < 30 &&
            data[i + 1] < 30 &&
            data[i + 2] < 30
          ) {
            data[i + 3] = 0;
          }
        }

        ctx.putImageData(imageData, 0, 0);
        setProcessedMask(canvas.toDataURL("image/png"));
      } catch (error) {
        console.error("Maske işleme hatası:", error);

        setProcessedMask(
          `data:image/png;base64,${result.maske_base64}`,
        );
      }
    };

    img.onerror = () => {
      console.error("Maske görüntüsü yüklenemedi.");

      setProcessedMask(
        `data:image/png;base64,${result.maske_base64}`,
      );
    };

    img.src = `data:image/png;base64,${result.maske_base64}`;
  }, [result]);

  /* MR + AI OVERLAY */
  useEffect(() => {
    if (!preview || !processedMask) {
      setOverlayImage(null);
      return;
    }

    const baseImage = new Image();
    const maskImage = new Image();

    baseImage.onload = () => {
      maskImage.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          canvas.width = baseImage.naturalWidth;
          canvas.height = baseImage.naturalHeight;

          ctx.drawImage(
            baseImage,
            0,
            0,
            canvas.width,
            canvas.height,
          );

          ctx.drawImage(
            maskImage,
            0,
            0,
            canvas.width,
            canvas.height,
          );

          setOverlayImage(canvas.toDataURL("image/png"));
        } catch (error) {
          console.error("Overlay oluşturma hatası:", error);
          setOverlayImage(null);
        }
      };

      maskImage.src = processedMask;
    };

    baseImage.onerror = () => {
      console.error(
        "Orijinal görüntü overlay için yüklenemedi.",
      );

      setOverlayImage(null);
    };

    maskImage.onerror = () => {
      console.error("Maske overlay için yüklenemedi.");
      setOverlayImage(null);
    };

    baseImage.src = preview;
  }, [preview, processedMask]);

  /* DOSYA */
  const processFile = (selectedFile) => {
    setFile(selectedFile);
    setValidationError(null);

    if (!selectedFile) {
      setPreview(null);
      return;
    }

    const fileName = selectedFile.name.toLowerCase();

    if (
      fileName.endsWith(".tif") ||
      fileName.endsWith(".tiff")
    ) {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const buffer = event.target.result;
          const ifds = UTIF.decode(buffer);

          UTIF.decodeImage(buffer, ifds[0]);

          const rgba = UTIF.toRGBA8(ifds[0]);
          const canvas = document.createElement("canvas");

          canvas.width = ifds[0].width;
          canvas.height = ifds[0].height;

          const ctx = canvas.getContext("2d");
          const imageData = ctx.createImageData(
            canvas.width,
            canvas.height,
          );

          imageData.data.set(rgba);
          ctx.putImageData(imageData, 0, 0);

          setPreview(canvas.toDataURL("image/png"));
        } catch (error) {
          console.error("TIFF önizleme hatası:", error);
          setPreview(null);

          toast.warning(
            "TIFF dosyası önizlenemedi, ancak analiz için gönderilebilir.",
          );
        }
      };

      reader.readAsArrayBuffer(selectedFile);
      return;
    }

    setPreview(URL.createObjectURL(selectedFile));
  };

  /* ANALİZ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError(null);

    if (!tcKimlik || tcKimlik.length !== 11) {
      setValidationError(
        "Lütfen 11 haneli Hasta TC Kimlik numarasını giriniz.",
      );

      return;
    }

    if (!file) {
      setValidationError(
        "Lütfen analiz edilecek bir resim seçin.",
      );

      return;
    }

    setLoading(true);
    setResult(null);
    setAnalizId(null);
    setProcessedMask(null);
    setOverlayImage(null);

    const finalAnalizAdi =
      analizAdi.trim() ||
      `${
        organ === "beyin"
          ? "Beyin"
          : organ === "bobrek"
            ? "Böbrek"
            : "Medikal"
      } Analizi`;

    const formData = new FormData();

    formData.append("tc_kimlik", tcKimlik);
    formData.append("analiz_adi", finalAnalizAdi);
    formData.append("klinik_id", doktorKlinikId);
    formData.append("organ", organ);
    formData.append("sira_no", "1");
    formData.append("file", file);

    try {
      const data = await predictAnalysis(
        model,
        formData,
      );

      if (!data.basarili) {
        toast.error(
          data.mesaj ||
            "Analiz işlemi tamamlanamadı.",
        );

        return;
      }

      setResult(data.sonuclar);
      setAnalizId(data.analiz_id);
      setAnalizAdi(finalAnalizAdi);

      toast.success("Analiz başarıyla tamamlandı.");
    } catch (error) {
      console.error("Analiz hatası:", error);

      toast.error(
        error.response?.data?.mesaj ||
          "Analiz sırasında bir hata oluştu.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ANALİZ DETAYI */
  const handleViewAnalysis = (doktorNotu = "") => {
    if (!analizId) return;

    navigate(`/analyses/${analizId}`, {
      state: {
        analysis: {
          id: analizId,
          analizAdi,
          analiz_adi: analizAdi,
          tcKimlik,
          organ,
          model,
          preview,
          processedMask,
          overlayImage,
          result,
          doktorNotu,
          tarih: new Date().toISOString(),
        },
      },
    });
  };

  return (
    <DashboardLayout title="Yeni Analiz">
      <div className={styles.container}>
        <AnalysisForm
          tcKimlik={tcKimlik}
          setTcKimlik={setTcKimlik}
          analizAdi={analizAdi}
          setAnalizAdi={setAnalizAdi}
          organ={organ}
          setOrgan={setOrgan}
          model={model}
          setModel={setModel}
          preview={preview}
          loading={loading}
          error={validationError}
          processFile={processFile}
          handleSubmit={handleSubmit}
        />

        <AnalysisResults
          result={result}
          preview={preview}
          loading={loading}
          processedMask={processedMask}
          onOpenOverlay={() =>
            setIsOverlayModalOpen(true)
          }
          onOpenReport={() =>
            setIsReportModalOpen(true)
          }
        />
      </div>

      <OverlayModal
        isOpen={isOverlayModalOpen}
        onClose={() =>
          setIsOverlayModalOpen(false)
        }
        preview={preview}
        processedMask={processedMask}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() =>
          setIsReportModalOpen(false)
        }
        tcKimlik={tcKimlik}
        organ={organ}
        preview={preview}
        result={result}
        processedMask={processedMask}
        overlayImage={overlayImage}
        analizId={analizId}
        onViewAnalysis={handleViewAnalysis}
      />
    </DashboardLayout>
  );
};

export default NewAnalysis;