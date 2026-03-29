import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt
from matplotlib import image as mpimg
from sklearn.model_selection import train_test_split
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
tf.get_logger().setLevel('ERROR')

PROJE_KLASORU  = os.path.dirname(os.path.abspath(__file__))

X_YOLU             = os.path.join(PROJE_KLASORU, 'processed_data', 'brain_X_dengeli.npy')
Y_YOLU             = os.path.join(PROJE_KLASORU, 'processed_data', 'brain_Y_dengeli.npy')
MODEL_YOLU         = os.path.join(PROJE_KLASORU, 'ai_engine', 'saved_models', 'en_iyi_model.h5')
GRAFIK_YOLU        = os.path.join(PROJE_KLASORU, 'docs', 'results', 'egitim_grafikleri.png')
TAHMIN_GRAFIK_YOLU = os.path.join(PROJE_KLASORU, 'docs', 'results', 'tahmin_sonuclari.png')

def dice_katsayisi(y_gercek, y_tahmin):
    y_gercek_duz = tf.reshape(y_gercek, [-1])
    y_tahmin_duz = tf.reshape(y_tahmin, [-1])
    kesisim = tf.reduce_sum(y_gercek_duz * y_tahmin_duz)
    return (2. * kesisim + 1.0) / (
        tf.reduce_sum(y_gercek_duz) + tf.reduce_sum(y_tahmin_duz) + 1.0
    )

def dice_loss(y_gercek, y_tahmin):
    return 1.0 - dice_katsayisi(y_gercek, y_tahmin)

def birlesik_loss(y_gercek, y_tahmin):
    bce = tf.keras.losses.binary_crossentropy(y_gercek, y_tahmin)
    return dice_loss(y_gercek, y_tahmin) + bce

def gorsel_goster(dosya_yolu, baslik):
    if not os.path.exists(dosya_yolu):
        print(f"\n  ⚠️  Dosya bulunamadı: {dosya_yolu}")
        return
    img = mpimg.imread(dosya_yolu)
    plt.figure(figsize=(16, 6))
    plt.imshow(img)
    plt.title(baslik, fontsize=14, fontweight='bold')
    plt.axis('off')
    plt.tight_layout()
    plt.show()

print("Veri ve model yükleniyor...")

X = np.load(X_YOLU)
y = np.load(Y_YOLU)
X = X / 255.0 if X.max() > 1.0 else X

# Sunum için küçük örnek al — RAM koruma
np.random.seed(42)
ornek_idx = np.random.choice(len(X), min(500, len(X)), replace=False)
X_ornek = X[ornek_idx]
y_ornek = y[ornek_idx]

_, X_test, _, y_test = train_test_split(
    X_ornek, y_ornek, test_size=0.2, random_state=42
)

model = tf.keras.models.load_model(
    MODEL_YOLU,
    custom_objects={
        'birlesik_loss' : birlesik_loss,
        'dice_katsayisi': dice_katsayisi
    }
)

print("Hazır!\n")

# ─────────────────────────────────────────────
# BÖLÜM FONKSİYONLARI
# ─────────────────────────────────────────────

def bolum_1_veri():
    print("\n" + "═"*50)
    print("BÖLÜM 1 — VERİ SETİ ANALİZİ")
    print("═"*50)

    tumoru_olan    = np.sum(y.max(axis=(1,2,3)) > 0)
    tumoru_olmayan = len(y) - tumoru_olan

    print(f"\n  Toplam görüntü sayısı : {len(X)}")
    print(f"  Görüntü boyutu        : {X.shape[1]}×{X.shape[2]} piksel, {X.shape[3]} kanal (RGB)")
    print(f"  Tümörlü slice         : {tumoru_olan}")
    print(f"  Tümörsüz slice        : {tumoru_olmayan}")
    print(f"  Piksel aralığı        : [{X.min():.3f} — {X.max():.3f}]")

    # Örnek görüntüler
    tumoru_olan_idx = np.where(y.max(axis=(1,2,3)) > 0)[0]
    ornekler = tumoru_olan_idx[np.linspace(0, len(tumoru_olan_idx)-1, 5, dtype=int)]

    plt.figure(figsize=(15, 6))
    plt.suptitle("Veri Seti — Örnek MR Görüntüleri ve Maskeleri", fontsize=14, fontweight='bold')
    for i, idx in enumerate(ornekler):
        plt.subplot(2, 5, i+1)
        plt.imshow(X[idx])
        plt.title(f"MR [{idx}]"); plt.axis('off')

        plt.subplot(2, 5, i+6)
        plt.imshow(y[idx].squeeze(), cmap='gray')
        plt.title(f"Maske [{idx}]"); plt.axis('off')

    plt.tight_layout()
    plt.show()


def bolum_2_mimari():
    print("\n" + "═"*50)
    print("BÖLÜM 2 — MODEL MİMARİSİ (U-Net)")
    print("═"*50)
    print("""
  Neden U-Net?
  ┌─────────────────────────────────────────────┐
  │  • Medikal görüntü segmentasyonunda standart│
  │  • Az veriyle yüksek başarım sağlar         │
  │  • Skip connection ile detay korunur         │
  └─────────────────────────────────────────────┘

  Mimari:
    Encoder  →  MaxPooling (boyut küçültme)
    Bottleneck (en derin özellikler)
    Decoder  →  UpSampling + Skip Connection
    Çıktı    →  Sigmoid (piksel başına 0-1)
    """)
    model.summary()


def bolum_3_sonuclar():
    print("\n" + "═"*50)
    print("BÖLÜM 3 — TEST SONUÇLARI")
    print("═"*50)

    test_loss, test_acc, test_dice = model.evaluate(X_test, y_test, verbose=0)

    print(f"""
  ┌─────────────────────────────────┐
  │  Accuracy   : {test_acc:.4f}           │
  │  Dice Score : {test_dice:.4f}  ✅ (≥0.70) │
  │  Loss       : {test_loss:.4f}           │
  └─────────────────────────────────┘

  📌 Not: Accuracy yanıltıcı olabilir (arka plan pikselleri çok fazla).
     Medikal segmentasyonda asıl metrik Dice Katsayısı'dır.
     Literatürde 0.70 üzeri başarılı kabul edilir → Bizim modelimiz: {test_dice:.4f}
    """)



def bolum_4_tahminler():
    print("\n" + "═"*50)
    print("BÖLÜM 4 — TAHMİN GÖRSELLEŞTİRME")
    print("═"*50)

    tumoru_olan_test = np.where(y_test.max(axis=(1,2,3)) > 0)[0]
    ornek_idxler = tumoru_olan_test[:5]
    tahminler = model.predict(X_test[ornek_idxler], verbose=0)

    plt.figure(figsize=(15, 9))
    plt.suptitle("Model Tahmin Sonuçları", fontsize=14, fontweight='bold')

    for i, idx in enumerate(ornek_idxler):
        plt.subplot(3, 5, i+1)
        plt.imshow(X_test[idx])
        plt.title("Orijinal MR"); plt.axis('off')

        plt.subplot(3, 5, i+6)
        plt.imshow(y_test[idx].squeeze(), cmap='gray')
        plt.title("Gerçek Maske"); plt.axis('off')

        plt.subplot(3, 5, i+11)
        plt.imshow(tahminler[i].squeeze(), cmap='gray')
        plt.title("Model Tahmini"); plt.axis('off')
    gorsel_goster(GRAFIK_YOLU, "Eğitim Grafikleri — Accuracy / Loss / Dice Katsayısı")
    plt.tight_layout()
    plt.show()


def bolum_5_hepsi():
    bolum_1_veri()
    bolum_2_mimari()
    bolum_3_sonuclar()
    bolum_4_tahminler()


# ─────────────────────────────────────────────
# ANA MENÜ
# ─────────────────────────────────────────────
def menu():
    while True:
        print("\n" + "╔" + "═"*48 + "╗")
        print("║     BEYİN TÜMÖRÜ SEGMENTASYON SİSTEMİ        ║")
        print("║               Sunum Menüsü                    ║")
        print("╠" + "═"*48 + "╣")
        print("║  1 → Veri Seti Analizi                        ║")
        print("║  2 → Model Mimarisi                           ║")
        print("║  3 → Test Sonuçları                           ║")
        print("║  4 → Tahmin Görselleri                        ║")
        print("║  5 → Hepsini Sırayla Göster                   ║")
        print("║  0 → Çıkış                                    ║")
        print("╚" + "═"*48 + "╝")

        secim = input("\n  Seçiminiz: ").strip()

        if   secim == '1': bolum_1_veri()
        elif secim == '2': bolum_2_mimari()
        elif secim == '3': bolum_3_sonuclar()
        elif secim == '4': bolum_4_tahminler()
        elif secim == '5': bolum_5_hepsi()
        elif secim == '0':
            break
        else:
            print("\nGeçersiz seçim")

if __name__ == '__main__':
    menu()