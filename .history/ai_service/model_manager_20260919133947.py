# model yüklemek ve yönetmek için gerekli sınıfları ve fonksiyonları içerir.
import tensorflow as tf
import os

# ── Kayıp ve Metrik Fonksiyonları ─────────────────────────
# Modeller bu fonksiyonlarla eğitildi
# Yüklerken tanıması için burada tekrar tanımlıyoruz

def dice_katsayisi(y_gercek, y_tahmin):
    y_gercek_duz = tf.reshape(y_gercek, [-1])
    y_tahmin_duz = tf.reshape(y_tahmin, [-1])
    kesisim = tf.reduce_sum(y_gercek_duz * y_tahmin_duz)
    return (2. * kesisim + 1e-5) / (
        tf.reduce_sum(y_gercek_duz) + tf.reduce_sum(y_tahmin_duz) + 1e-5
    )

def dice_loss(y_gercek, y_tahmin):
    return 1.0 - dice_katsayisi(y_gercek, y_tahmin)

def birlesik_loss(y_gercek, y_tahmin):
    bce = tf.keras.losses.binary_crossentropy(y_gercek, y_tahmin)
    return dice_loss(y_gercek, y_tahmin) + bce

def agirlikli_birlesik_loss(y_gercek, y_tahmin):
    bce = tf.keras.losses.binary_crossentropy(y_gercek, y_tahmin)
    return (0.7 * bce) + (0.3 * dice_loss(y_gercek, y_tahmin))

# ── Model Yolları ──────────────────────────────────────────
# Kendi klasör yapına göre bu yolları güncelle
PROJE_KLASORU = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_KLASORU = os.path.join(PROJE_KLASORU, 'ai_engine', 'saved_models')

MODEL_YOLLARI = {
    "beyin_unet"      : os.path.join(MODEL_KLASORU, 'beyin_v2.h5'),
    "beyin_unet_plus" : os.path.join(MODEL_KLASORU, 'beyin_v3.h5'),
    "bobrek_unet"     : os.path.join(MODEL_KLASORU, 'bobrek_U-Net.h5'),
    "bobrek_unet_plus": os.path.join(MODEL_KLASORU, 'bobrek_U-Net++.h5'),
}

# ── Özel Objeler ──────────────────────────────────────────
# Modeli yüklerken TensorFlow'un tanıması gereken fonksiyonlar
OZEL_OBJELER = {
    'dice_katsayisi'       : dice_katsayisi,
    'birlesik_loss'        : birlesik_loss,
    'agirlikli_birlesik_loss': agirlikli_birlesik_loss,
    'dice_loss'            : dice_loss,
}

# ── Model Yükleyici ───────────────────────────────────────
# Sözlük: { "beyin_unet": <model>, "bobrek_unet": <model>, ... }
yuklenen_modeller = {}

def modelleri_yukle():
    """
    Uygulama başlarken bir kez çalışır.
    Tüm modelleri belleğe alır.
    """
    print("\n🔄 Modeller yükleniyor...")

    for model_adi, model_yolu in MODEL_YOLLARI.items():
        if not os.path.exists(model_yolu):
            print(f"  ⚠️  {model_adi} bulunamadı: {model_yolu}")
            continue

        try:
            model = tf.keras.models.load_model(
                model_yolu,
                custom_objects=OZEL_OBJELER
            )
            yuklenen_modeller[model_adi] = model
            print(f"  ✅ {model_adi} yüklendi")
        except Exception as e:
            print(f"  ❌ {model_adi} yüklenemedi: {e}")

    print(f"\n✅ Toplam {len(yuklenen_modeller)} model hazır\n")

def model_getir(model_adi: str):
    """
    İstenen modeli döndürür.
    Model yoksa hata fırlatır.
    """
    if model_adi not in yuklenen_modeller:
        raise ValueError(
            f"'{model_adi}' modeli bulunamadı. "
            f"Mevcut modeller: {list(yuklenen_modeller.keys())}"
        )
    return yuklenen_modeller[model_adi]