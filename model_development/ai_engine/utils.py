import numpy as np


def tumor_analizi_yap(maske, pixel_mm_orani=0.5):
    """
    Segmentasyon maskesi üzerinden klinik veriler üretir.
    """
    # 1. ÇÖZÜM BURASI: Boyutu (256, 256, 1) olan maskeyi (256, 256) formatına sıkıştırıyoruz
    maske_2d = np.squeeze(maske)

    # 2. Maskeyi 0 ve 1'lere yuvarla
    binary_mask = (maske_2d > 0.5).astype(np.uint8)

    tumor_piksel_sayisi = np.sum(binary_mask)

    # Alan Hesabı
    alan_mm2 = tumor_piksel_sayisi * (pixel_mm_orani ** 2)

    # Boyut Hesabı (Bounding Box)
    y_idx, x_idx = np.where(binary_mask == 1)

    if len(x_idx) > 0:
        genislik_mm = (np.max(x_idx) - np.min(x_idx)) * pixel_mm_orani
        yukseklik_mm = (np.max(y_idx) - np.min(y_idx)) * pixel_mm_orani
    else:
        genislik_mm, yukseklik_mm = 0, 0

    return {
        "alan": alan_mm2,
        "genislik": genislik_mm,
        "yukseklik": yukseklik_mm
    }