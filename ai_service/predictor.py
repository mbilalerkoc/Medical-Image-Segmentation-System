# predictor.py
# Tek görevi: görüntüyü işle, modele ver, sonuçları döndür

import cv2
import base64
import numpy as np
from model_manager import model_getir

# ── Sabitler ──────────────────────────────────────────────
IMG_SIZE = 256   # Modelimiz 256x256 görüntü bekliyor
ESIK     = 0.5   # Bu değerin üzeri -> taş/tümör var
PIXEL_ALAN_MM2 = 0.115 # 1 pikselin fiziksel karşılığı (Örnek varsayılan: 0.115 mm2)

# ── Ön İşleme ─────────────────────────────────────────────
def goruntu_isle(dosya_bytes: bytes) -> np.ndarray:
    nparr = np.frombuffer(dosya_bytes, np.uint8)
    img   = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Görüntü okunamadı. Geçerli bir PNG/JPG dosyası gönderin.")

    lab        = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b    = cv2.split(lab)
    clahe      = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l          = clahe.apply(l)
    lab        = cv2.merge((l, a, b))
    img        = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)

    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img = img.astype(np.float32) / 255.0
    img = np.expand_dims(img, axis=0)

    return img

# ── Tahmin ────────────────────────────────────────────────
def tahmin_yap(model_adi: str, dosya_bytes: bytes) -> dict:
    img = goruntu_isle(dosya_bytes)
    model = model_getir(model_adi)
    
    tahmin = model.predict(img, verbose=0)
    ham_tahmin = tahmin[0, :, :, 0]
    
    # Binary maskeye çevir (0 veya 1)
    maske = (ham_tahmin > ESIK).astype(np.uint8)

    # 5. Temel Piksel Metrikleri
    toplam_piksel    = IMG_SIZE * IMG_SIZE            
    patoloji_piksel  = int(np.sum(maske))             
    saglikli_piksel  = toplam_piksel - patoloji_piksel
    patoloji_yuzdesi = round((patoloji_piksel / toplam_piksel) * 100, 2)

    # 5.1 YENİ: Fiziksel Büyüklük (Alan ve Çevre)
    alan_mm2 = round(patoloji_piksel * PIXEL_ALAN_MM2, 2)
    
    contours, _ = cv2.findContours(maske, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cevre_piksel = sum([cv2.arcLength(cnt, True) for cnt in contours])
    cevre_mm = round(cevre_piksel * np.sqrt(PIXEL_ALAN_MM2), 2)

    # 5.2 YENİ: Başarı Oranı / Güven Skoru (Sadece tümör/taş olan bölgedeki olasılık)
    if patoloji_piksel > 0:
        guven_skoru = round(float(np.mean(ham_tahmin[maske > 0]) * 100), 2)
    else:
        guven_skoru = 0.0

    max_olasilik  = round(float(np.max(ham_tahmin)), 4)   
    ort_olasilik  = round(float(np.mean(ham_tahmin)), 4)  

    # 6. Base64 Dönüşümü
    maske_gorsel = maske * 255
    _, buffer = cv2.imencode('.png', maske_gorsel)
    maske_base64 = base64.b64encode(buffer).decode('utf-8')

    return {
        "model_adi"        : model_adi,
        "maske_base64"     : maske_base64,
        "metrikler": {
            "toplam_piksel"    : toplam_piksel,
            "patoloji_piksel"  : patoloji_piksel,
            "saglikli_piksel"  : saglikli_piksel,
            "patoloji_yuzdesi" : patoloji_yuzdesi, 
            "alan_mm2"         : alan_mm2,          
            "cevre_mm"         : cevre_mm,          
            "guven_skoru"      : guven_skoru,       
            "max_olasilik"     : max_olasilik,     
            "ort_olasilik"     : ort_olasilik,     
        }
    }