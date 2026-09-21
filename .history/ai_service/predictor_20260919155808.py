# predictor.py
# Tek görevi: görüntüyü işle, modele ver, sonuçları döndür

import cv2
import base64
import numpy as np
from model_manager import model_getir

# ── Sabitler ──────────────────────────────────────────────
IMG_SIZE = 256   # Modelimiz 256×256 görüntü bekliyor
ESIK     = 0.5   # Bu değerin üzeri → taş/tümör var


# ── Ön İşleme ─────────────────────────────────────────────
def goruntu_isle(dosya_bytes: bytes) -> np.ndarray:
    """
    Byte olarak gelen görüntüyü modele hazırlar.

    Adımlar:
    1. Byte → NumPy dizisi
    2. Renkli görüntüye çevir (BGR)
    3. CLAHE ile kontrast artır
    4. 256×256'ya yeniden boyutlandır
    5. 0-1 arasına normalize et
    6. Batch boyutu ekle: (256,256,3) → (1,256,256,3)
    """

    # 1. Byte → görüntü
    nparr = np.frombuffer(dosya_bytes, np.uint8)
    img   = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Görüntü okunamadı. Geçerli bir PNG/JPG dosyası gönderin.")

    # 2. CLAHE — eğitimde de uygulamıştık, tutarlılık için burada da var
    lab        = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b    = cv2.split(lab)
    clahe      = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l          = clahe.apply(l)
    lab        = cv2.merge((l, a, b))
    img        = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)

    # 3. Yeniden boyutlandır
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))

    # 4. Normalize et: 0-255 → 0.0-1.0
    img = img.astype(np.float32) / 255.0

    # 5. Batch boyutu ekle
    # Model tek görüntü değil, batch bekliyor
    # (256,256,3) → (1,256,256,3)
    img = np.expand_dims(img, axis=0)

    return img


# ── Tahmin ────────────────────────────────────────────────
def tahmin_yap(model_adi: str, dosya_bytes: bytes) -> dict:
    """
    Ana fonksiyon. Şunları yapar:
    1. Görüntüyü ön işle
    2. Doğru modeli al
    3. model.predict() çalıştır
    4. Maskeyi üret
    5. Metrikleri hesapla
    6. Sonuçları döndür (Base64 Optimizasyonu ile)
    """

    # 1. Görüntüyü hazırla
    img = goruntu_isle(dosya_bytes)

    # 2. Modeli al (model_manager'dan)
    model = model_getir(model_adi)

    # 3. Tahmin yap
    # Çıktı: (1, 256, 256, 1) — her piksel için 0-1 arası olasılık
    tahmin = model.predict(img, verbose=0)

    # 4. Binary maskeye çevir
    # 0.5 üzeri → 1 (patoloji var), altı → 0 (sağlıklı doku)
    maske = (tahmin[0, :, :, 0] > ESIK).astype(np.uint8)

    # 5. Metrikleri hesapla
    toplam_piksel    = IMG_SIZE * IMG_SIZE            # 65536
    patoloji_piksel  = int(np.sum(maske))             # beyaz piksel sayısı
    saglikli_piksel  = toplam_piksel - patoloji_piksel
    patoloji_yuzdesi = round((patoloji_piksel / toplam_piksel) * 100, 2)

    # Ham olasılık değerleri
    ham_tahmin = tahmin[0, :, :, 0]
    max_olasilik  = round(float(np.max(ham_tahmin)), 4)   # en yüksek güven
    ort_olasilik  = round(float(np.mean(ham_tahmin)), 4)  # ortalama

    # 6. YENİ EKLENEN KISIM: Maskeyi Base64 PNG formatına çevir
    # Görsel olarak (React'te) gösterebilmek için 1'leri 255 (beyaz) yapıyoruz
    maske_gorsel = maske * 255
    
    # Bellek üzerinde PNG olarak sıkıştır
    _, buffer = cv2.imencode('.png', maske_gorsel)
    
    # Base64 metnine çevir
    maske_base64 = base64.b64encode(buffer).decode('utf-8')

    return {
        "model_adi"        : model_adi,
        "maske_base64"     : maske_base64,       # Hafifletilmiş Base64 metni
        "metrikler": {
            "toplam_piksel"    : toplam_piksel,
            "patoloji_piksel"  : patoloji_piksel,
            "saglikli_piksel"  : saglikli_piksel,
            "patoloji_yuzdesi" : patoloji_yuzdesi, 
            "max_olasilik"     : max_olasilik,     
            "ort_olasilik"     : ort_olasilik,     
        }
    }