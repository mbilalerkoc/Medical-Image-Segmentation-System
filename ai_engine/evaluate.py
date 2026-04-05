# evaluate.py
# PyCharm'da calistirilir
# Drive'dan indirilen model, egitim grafikleri ve Colab'in test metrikleri ile sunum uretir

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
        'birlesik_loss': birlesik_loss,
        'dice_katsayisi': dice_katsayisi
    }
)
print("Model yuklendi!")

print("Test verisi yukleniyor (Sadece canli tahminler icin)...")
X_test = np.load(os.path.join(PROJE_KLASORU, 'processed_data', 'X_test.npy'))
y_test = np.load(os.path.join(PROJE_KLASORU, 'processed_data', 'y_test.npy'))
print(f"Test seti yuklendi! X: {X_test.shape} | y: {y_test.shape}")


# ─────────────────────────────────────────────
# METRİKLERİ YAZDIR (COLAB'DEN OKUYARAK)
# ─────────────────────────────────────────────
def sonuclari_yazdir():
    # Colab'de uretip indirdigimiz .txt dosyasinin yolu
    txt_yolu = os.path.join(SONUC_KLASOR, 'test_sonuclari.txt')

    if os.path.exists(txt_yolu):
        with open(txt_yolu, 'r', encoding='utf-8') as f:
            print("\n" + f.read())
    else:
        print(f"\n❌ Hata: {txt_yolu} bulunamadi!")
        print("Lutfen Colab'de uretilen test_sonuclari.txt dosyasini Drive'dan indirip 'docs/results' klasorune koyun.")


# ─────────────────────────────────────────────
# TAHMİN GÖRSELLEŞTİRME (SADECE 5 ÖRNEK İÇİN)
# ─────────────────────────────────────────────
def tahminleri_goster():
    print("\n🎨 Canli tahminler uretiliyor...")
    tumoru_olan_test = np.where(y_test.max(axis=(1, 2, 3)) > 0)[0]
    ornek_idxler = tumoru_olan_test[:5]

    # Sadece 5 resim tahmini yapildigi icin CPU'yu hic yormaz, aninda biter.
    tahminler = model.predict(X_test[ornek_idxler], verbose=0)

    plt.figure(figsize=(15, 9))
    for i, idx in enumerate(ornek_idxler):
        # Orijinal MR - Squeeze eklendi
        plt.subplot(3, 5, i + 1)
        plt.imshow(X_test[idx].squeeze(), cmap='gray')
        plt.title("Orijinal MR");
        plt.axis('off')

        # Gercek Maske
        plt.subplot(3, 5, i + 6)
        plt.imshow(y_test[idx].squeeze(), cmap='gray')
        plt.title("Gercek Maske");
        plt.axis('off')

        # Model Tahmini
        plt.subplot(3, 5, i + 11)
        plt.imshow(tahminler[i].squeeze() > 0.5, cmap='gray')
        plt.title("Model Tahmini");
        plt.axis('off')

    plt.tight_layout()
    kayit_yolu = os.path.join(SONUC_KLASOR, 'beyin_v1_tahmin_sonuclari.png')
    plt.savefig(kayit_yolu, dpi=150)
    plt.show()
    print(f"✅ Tahmin gorselleri kaydedildi: {kayit_yolu}")


# ─────────────────────────────────────────────
# EĞİTİM GRAFİKLERİ
# ─────────────────────────────────────────────
def grafikleri_goster():
    """Drive'dan indirilen egitim grafigini gosterir."""
    yol = os.path.join(SONUC_KLASOR, 'beyin_v1_egitim_grafikleri.png')

    if os.path.exists(yol):
        img = plt.imread(yol)
        plt.figure(figsize=(16, 6))
        plt.imshow(img);
        plt.title("Egitim Grafikleri");
        plt.axis('off')
        plt.tight_layout();
        plt.show()
    else:
        print(f"\n❌ Grafik bulunamadi: {yol}")
        print("Drive'dan 'beyin_v1_egitim_grafikleri.png' dosyasini indirip projeye ekleyin.")


# ─────────────────────────────────────────────
# ÇALIŞTIR
# ─────────────────────────────────────────────
if __name__ == '__main__':
    sonuclari_yazdir()
    grafikleri_goster()
    tahminleri_goster()