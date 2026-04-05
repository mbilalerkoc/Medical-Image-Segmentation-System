# evaluate.py
# PyCharm'da calistirilir
# Drive'dan indirilen model ve test verisiyle metrik, grafik, tahmin uretir

import os
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
from config_local import MODEL_KAYIT, SONUC_KLASOR
from model import birlesik_loss, dice_katsayisi

os.makedirs(SONUC_KLASOR, exist_ok=True)

# ─────────────────────────────────────────────
# MODEL VE TEST VERİSİNİ YÜKLE
# ─────────────────────────────────────────────
PROJE_KLASORU = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

print("Model yukleniyor...")
model = tf.keras.models.load_model(
    os.path.join(MODEL_KAYIT, 'beyin_v1.h5'),
    custom_objects={
        'birlesik_loss' : birlesik_loss,
        'dice_katsayisi': dice_katsayisi
    }
)
print("Model yuklendi!")

print("Test verisi yukleniyor...")
X_test = np.load(os.path.join(PROJE_KLASORU, 'processed_data', 'X_test.npy'))
y_test = np.load(os.path.join(PROJE_KLASORU, 'processed_data', 'y_test.npy'))
print(f"Test seti yuklendi! X: {X_test.shape} | y: {y_test.shape}")

# ─────────────────────────────────────────────
# METRİKLER
# ─────────────────────────────────────────────
def ek_metrikler_hesapla(esik=0.5):
    tahminler     = model.predict(X_test, verbose=0)
    tahmin_binary = (tahminler > esik).astype(np.float32)
    gercek        = y_test.astype(np.float32)

    TP = np.sum(tahmin_binary * gercek)
    FP = np.sum(tahmin_binary * (1 - gercek))
    FN = np.sum((1 - tahmin_binary) * gercek)

    precision = TP / (TP + FP + 1e-7)
    recall    = TP / (TP + FN + 1e-7)
    iou       = TP / (TP + FP + FN + 1e-7)
    return precision, recall, iou


def sonuclari_yazdir():
    test_loss, test_acc, test_dice = model.evaluate(X_test, y_test, verbose=0)
    precision, recall, iou         = ek_metrikler_hesapla()

    print(f"""
╔══════════════════════════════════════════╗
║            TEST SONUÇLARI               ║
╠══════════════════════════════════════════╣
║  Accuracy  : {test_acc:.4f}                    ║
║  Dice Score: {test_dice:.4f}  (hedef: 0.70+)   ║
║  IoU       : {iou:.4f}                    ║
║  Precision : {precision:.4f}                    ║
║  Recall    : {recall:.4f}                    ║
║  Loss      : {test_loss:.4f}                    ║
╚══════════════════════════════════════════╝

Metrik Aciklamalari:
   Dice      -> Tumor bolgesi ortusme orani
   IoU       -> Kesisim / Birlesim orani
   Precision -> Tahmin edilen tumorun dogruluk orani
   Recall    -> Gercek tumorun bulunma orani
    """)

# ─────────────────────────────────────────────
# TAHMİN GÖRSELLEŞTİRME
# ─────────────────────────────────────────────
def tahminleri_goster():
    tumoru_olan_test = np.where(y_test.max(axis=(1, 2, 3)) > 0)[0]
    ornek_idxler     = tumoru_olan_test[:5]
    tahminler        = model.predict(X_test[ornek_idxler], verbose=0)

    plt.figure(figsize=(15, 9))
    for i, idx in enumerate(ornek_idxler):
        plt.subplot(3, 5, i + 1)
        plt.imshow(X_test[idx]); plt.title("Orijinal MR"); plt.axis('off')

        plt.subplot(3, 5, i + 6)
        plt.imshow(y_test[idx].squeeze(), cmap='gray')
        plt.title("Gercek Maske"); plt.axis('off')

        plt.subplot(3, 5, i + 11)
        plt.imshow(tahminler[i].squeeze(), cmap='gray')
        plt.title("Model Tahmini"); plt.axis('off')

    plt.tight_layout()
    kayit_yolu = os.path.join(SONUC_KLASOR, 'beyin_v1_tahmin_sonucları.png')
    plt.savefig(kayit_yolu, dpi=150)
    plt.show()
    print(f"Kaydedildi: {kayit_yolu}")


# ─────────────────────────────────────────────
# EĞİTİM GRAFİKLERİ
# ─────────────────────────────────────────────
def grafikleri_goster():
    """Drive'dan indirilen egitim grafigini gosterir."""
    yol = os.path.join(SONUC_KLASOR, 'beyin_v1_egitim_grafikleri.png')
    if os.path.exists(yol):
        img = plt.imread(yol)
        plt.figure(figsize=(16, 6))
        plt.imshow(img); plt.title("Egitim Grafikleri"); plt.axis('off')
        plt.tight_layout(); plt.show()
    else:
        print(f"Grafik bulunamadi: {yol}")
        print("Drive'dan docs/results/beyin_v1_egitim_grafikleri.png dosyasini indirip projeye ekle.")


# ─────────────────────────────────────────────
# ÇALIŞTIR
# ─────────────────────────────────────────────
if __name__ == '__main__':
    sonuclari_yazdir()
    grafikleri_goster()
    tahminleri_goster()