import os
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
from matplotlib import image as mpimg
from sklearn.model_selection import train_test_split

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
tf.get_logger().setLevel('ERROR')

PROJE_KLASORU = os.path.dirname(os.path.abspath(__file__))

# ─────────────────────────────────────────────
# ORGAN & MODEL TANIMI
# ─────────────────────────────────────────────
ORGANLAR = {
    "1": {
        "ad": "Beyin Tumoru",
        "modeller": {
            "1": {
                "ad"      : "Model v1",
                "model"   : os.path.join(PROJE_KLASORU, 'ai_engine', 'saved_models', 'beyin_v1.h5'),
                # X_test.npy varsa direkt okur, yoksa asagidaki npy'den otomatik olusturur
                "X_test"  : os.path.join(PROJE_KLASORU, 'processed_data', 'brain_X_dengeli.npy'),
                "y_test"  : os.path.join(PROJE_KLASORU, 'processed_data', 'brain_Y_dengeli.npy'),
                # X_test yoksa bu dosyalardan olusturulur
                "X_npy"   : os.path.join(PROJE_KLASORU, 'processed_data', 'brain_X_dengeli.npy'),
                "y_npy"   : os.path.join(PROJE_KLASORU, 'processed_data', 'brain_Y_dengeli.npy'),
                "grafik"  : os.path.join(PROJE_KLASORU, 'docs', 'results', 'beyin_v1_egitim_grafikleri.png'),
                "tahmin"  : os.path.join(PROJE_KLASORU, 'docs', 'results', 'beyin_v1_tahmin_sonuclari.png'),
            },
            "2": {
                "ad"      : "Model v2",
                "model"   : os.path.join(PROJE_KLASORU, 'ai_engine', 'saved_models', 'beyin_v2.h5'),
                "X_test"  : os.path.join(PROJE_KLASORU, 'processed_data', 'beyin_v2_X_test.npy'),
                "y_test"  : os.path.join(PROJE_KLASORU, 'processed_data', 'beyin_v2_y_test.npy'),
                "X_npy"   : None,
                "y_npy"   : None,
                "grafik"  : os.path.join(PROJE_KLASORU, 'docs', 'results', 'beyin_v2_egitim_grafikleri.png'),
                "tahmin"  : os.path.join(PROJE_KLASORU, 'docs', 'results', 'beyin_v2_tahmin_sonuclari.png'),
            },
        }
    },
    # Yeni organ eklemek için buraya kopyala:
    # "2": {
    #     "ad": "Bobrek",
    #     "modeller": {
    #         "1": { "ad": "Model v1", "model": "...", "X_test": "...", "X_npy": "...", ... },
    #     }
    # },
}

# ─────────────────────────────────────────────
# YARDIMCI FONKSİYONLAR
# ─────────────────────────────────────────────
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

def model_yukle(yol):
    return tf.keras.models.load_model(
        yol,
        custom_objects={
            'birlesik_loss' : birlesik_loss,
            'dice_katsayisi': dice_katsayisi
        }
    )

def veri_yukle(cfg):
    """
    X_test.npy varsa direkt okur.
    Yoksa X_npy'den train_test_split ile otomatik olusturur.
    """
    if os.path.exists(cfg["X_test"]) and os.path.exists(cfg["y_test"]):
        print(f"  Test verisi yukleniyor: {os.path.basename(cfg['X_test'])}")
        X_test = np.load(cfg["X_test"])
        y_test = np.load(cfg["y_test"])
    elif cfg.get("X_npy") and os.path.exists(cfg["X_npy"]):
        print(f"  X_test bulunamadi, {os.path.basename(cfg['X_npy'])}'den olusturuluyor...")
        X = np.load(cfg["X_npy"])
        y = np.load(cfg["y_npy"])
        np.random.seed(42)
        ornek_idx = np.random.choice(len(X), min(500, len(X)), replace=False)
        _, X_test, _, y_test = train_test_split(
            X[ornek_idx], y[ornek_idx], test_size=0.2, random_state=42
        )
    else:
        print("  Veri dosyasi bulunamadi!")
        return None, None

    X_test = X_test / 255.0 if X_test.max() > 1.0 else X_test
    return X_test, y_test

def gorsel_goster(yol, baslik):
    if not os.path.exists(yol):
        print(f"\n  Dosya bulunamadi: {yol}")
        return
    img = mpimg.imread(yol)
    plt.figure(figsize=(16, 6))
    plt.imshow(img); plt.title(baslik, fontsize=14, fontweight='bold')
    plt.axis('off'); plt.tight_layout(); plt.show()

def metrik_hesapla(model, X_test, y_test):
    test_loss, test_acc, test_dice = model.evaluate(X_test, y_test, verbose=0)
    tahminler     = model.predict(X_test, verbose=0)
    tahmin_binary = (tahminler > 0.5).astype(np.float32)
    gercek        = y_test.astype(np.float32)
    TP = np.sum(tahmin_binary * gercek)
    FP = np.sum(tahmin_binary * (1 - gercek))
    FN = np.sum((1 - tahmin_binary) * gercek)
    precision = TP / (TP + FP + 1e-7)
    recall    = TP / (TP + FN + 1e-7)
    iou       = TP / (TP + FP + FN + 1e-7)
    return {
        "accuracy" : test_acc,
        "dice"     : test_dice,
        "iou"      : iou,
        "precision": precision,
        "recall"   : recall,
        "loss"     : test_loss,
    }

# ─────────────────────────────────────────────
# BÖLÜM FONKSİYONLARI
# ─────────────────────────────────────────────
def bolum_veri(X_test, y_test, organ_ad, model_ad):
    print("\n" + "="*50)
    print(f"  VERI SETI — {organ_ad} / {model_ad}")
    print("="*50)
    tumoru_olan    = np.sum(y_test.max(axis=(1,2,3)) > 0)
    tumoru_olmayan = len(y_test) - tumoru_olan
    print(f"\n  Test seti boyutu  : {len(X_test)}")
    print(f"  Goruntu boyutu    : {X_test.shape[1]}x{X_test.shape[2]} piksel")
    print(f"  Tumorlu slice     : {tumoru_olan}")
    print(f"  Tumorsuz slice    : {tumoru_olmayan}")

    tumoru_olan_idx = np.where(y_test.max(axis=(1,2,3)) > 0)[0]
    ornekler = tumoru_olan_idx[np.linspace(0, len(tumoru_olan_idx)-1, 5, dtype=int)]

    plt.figure(figsize=(15, 6))
    plt.suptitle(f"Ornek MR Goruntuleri — {organ_ad} / {model_ad}",
                 fontsize=14, fontweight='bold')
    for i, idx in enumerate(ornekler):
        plt.subplot(2, 5, i+1)
        plt.imshow(X_test[idx]); plt.title(f"MR [{idx}]"); plt.axis('off')
        plt.subplot(2, 5, i+6)
        plt.imshow(y_test[idx].squeeze(), cmap='gray')
        plt.title(f"Maske [{idx}]"); plt.axis('off')
    plt.tight_layout(); plt.show()


def bolum_mimari(model, organ_ad, model_ad):
    print("\n" + "="*50)
    print(f"  MODEL MIMARISI — {organ_ad} / {model_ad}")
    print("="*50)
    print("""
  Neden U-Net?
    - Medikal goruntu segmentasyonunda standart
    - Az veriyle yuksek basarim saglar
    - Skip connection ile detay korunur

  Mimari:
    Encoder    ->  Conv2D x2 + MaxPooling
    Bottleneck ->  En derin ozellik haritasi
    Decoder    ->  UpSampling + Skip Connection + Conv2D x2
    Cikti      ->  Sigmoid (piksel basina 0-1)
    """)
    model.summary()


def bolum_sonuclar(model, X_test, y_test, organ_ad, model_ad):
    print("\n" + "="*50)
    print(f"  TEST SONUCLARI — {organ_ad} / {model_ad}")
    print("="*50)
    m = metrik_hesapla(model, X_test, y_test)
    print(f"""
  Accuracy  : {m['accuracy']:.4f}
  Dice Score: {m['dice']:.4f}  (hedef: 0.70+)
  IoU       : {m['iou']:.4f}
  Precision : {m['precision']:.4f}
  Recall    : {m['recall']:.4f}
  Loss      : {m['loss']:.4f}

  Metrik Aciklamalari:
    Dice      -> Tumor bolgesi ortusme orani
    IoU       -> Kesisim / Birlesim orani
    Precision -> Tahmin edilen tumorun dogruluk orani
    Recall    -> Gercek tumorun bulunma orani
    """)


def bolum_tahminler(model, X_test, y_test, organ_ad, model_ad):
    print("\n" + "="*50)
    print(f"  TAHMIN GORSELLESTIRME — {organ_ad} / {model_ad}")
    print("="*50)
    tumoru_olan_test = np.where(y_test.max(axis=(1,2,3)) > 0)[0]
    ornek_idxler     = tumoru_olan_test[:5]
    tahminler        = model.predict(X_test[ornek_idxler], verbose=0)

    plt.figure(figsize=(15, 9))
    plt.suptitle(f"Tahmin Sonuclari — {organ_ad} / {model_ad}",
                 fontsize=14, fontweight='bold')
    for i, idx in enumerate(ornek_idxler):
        plt.subplot(3, 5, i+1)
        plt.imshow(X_test[idx]); plt.title("Orijinal MR"); plt.axis('off')
        plt.subplot(3, 5, i+6)
        plt.imshow(y_test[idx].squeeze(), cmap='gray')
        plt.title("Gercek Maske"); plt.axis('off')
        plt.subplot(3, 5, i+11)
        plt.imshow(tahminler[i].squeeze(), cmap='gray')
        plt.title("Model Tahmini"); plt.axis('off')
    plt.tight_layout(); plt.show()


def bolum_grafik(cfg, organ_ad, model_ad):
    print("\n" + "="*50)
    print(f"  EGITIM GRAFIKLERI — {organ_ad} / {model_ad}")
    print("="*50)
    gorsel_goster(cfg["grafik"], f"Egitim Grafikleri — {organ_ad} / {model_ad}")


# ─────────────────────────────────────────────
# KARŞILAŞTIRMA FONKSİYONLARI
# ─────────────────────────────────────────────
def karsılastir_metrik(organ_cfg, organ_ad):
    print("\n" + "="*50)
    print(f"  METRIK KARSILASTIRMASI — {organ_ad}")
    print("="*50)

    modeller  = organ_cfg["modeller"]
    metrikler = {}

    for key, cfg in modeller.items():
        if not os.path.exists(cfg["model"]):
            print(f"  {cfg['ad']} model dosyasi bulunamadi, atlaniyor.")
            continue
        print(f"  {cfg['ad']} yukleniyor...")
        m      = model_yukle(cfg["model"])
        X, y   = veri_yukle(cfg)
        if X is None:
            continue
        metrikler[cfg["ad"]] = metrik_hesapla(m, X, y)

    if len(metrikler) < 2:
        print("  Karsilastirma icin en az 2 model gerekli!")
        return

    isimler = list(metrikler.keys())
    print(f"\n  {'Metrik':<12} {isimler[0]:<15} {isimler[1]:<15} Kazanan")
    print(f"  {'-'*55}")

    for metrik in ["accuracy", "dice", "iou", "precision", "recall"]:
        v1      = metrikler[isimler[0]][metrik]
        v2      = metrikler[isimler[1]][metrik]
        kazanan = isimler[0] if v1 > v2 else isimler[1]
        print(f"  {metrik.capitalize():<12} {v1:<15.4f} {v2:<15.4f} {kazanan}")


def karsılastir_tahmin(organ_cfg, organ_ad):
    print("\n" + "="*50)
    print(f"  TAHMIN KARSILASTIRMASI — {organ_ad}")
    print("="*50)

    modeller = list(organ_cfg["modeller"].values())
    if len(modeller) < 2:
        print("  Karsilastirma icin en az 2 model gerekli!")
        return

    cfg1, cfg2 = modeller[0], modeller[1]

    if not os.path.exists(cfg1["model"]) or not os.path.exists(cfg2["model"]):
        print("  Model dosyalari bulunamadi!")
        return

    model1     = model_yukle(cfg1["model"])
    model2     = model_yukle(cfg2["model"])
    X1, y1     = veri_yukle(cfg1)
    X2, y2     = veri_yukle(cfg2)

    if X1 is None or X2 is None:
        return

    tumoru_olan = np.where(y1.max(axis=(1,2,3)) > 0)[0]
    idxler      = tumoru_olan[:3]
    tahmin1     = model1.predict(X1[idxler], verbose=0)
    tahmin2     = model2.predict(X2[idxler], verbose=0)

    plt.figure(figsize=(16, 10))
    plt.suptitle(f"Tahmin Karsilastirmasi — {organ_ad}", fontsize=14, fontweight='bold')

    sutunlar = 4
    for i, idx in enumerate(idxler):
        plt.subplot(3, sutunlar, i*sutunlar + 1)
        plt.imshow(X1[idx]); plt.title("Orijinal MR"); plt.axis('off')
        plt.subplot(3, sutunlar, i*sutunlar + 2)
        plt.imshow(y1[idx].squeeze(), cmap='gray')
        plt.title("Gercek Maske"); plt.axis('off')
        plt.subplot(3, sutunlar, i*sutunlar + 3)
        plt.imshow(tahmin1[i].squeeze(), cmap='gray')
        plt.title(cfg1["ad"]); plt.axis('off')
        plt.subplot(3, sutunlar, i*sutunlar + 4)
        plt.imshow(tahmin2[i].squeeze(), cmap='gray')
        plt.title(cfg2["ad"]); plt.axis('off')

    plt.tight_layout(); plt.show()


# ─────────────────────────────────────────────
# MENÜLER
# ─────────────────────────────────────────────
def karsılastir_menu(organ_cfg, organ_ad):
    while True:
        print(f"\n  Karsilastirma — {organ_ad}")
        print("  1 -> Metrik Karsilastirmasi")
        print("  2 -> Tahmin Gorselleri Yan Yana")
        print("  0 -> Geri")
        secim = input("\n  Seciminiz: ").strip()
        if   secim == '1': karsılastir_metrik(organ_cfg, organ_ad)
        elif secim == '2': karsılastir_tahmin(organ_cfg, organ_ad)
        elif secim == '0': break
        else: print("  Gecersiz secim")


def model_menu(organ_cfg, organ_ad):
    yuklenen = {}
    for key, cfg in organ_cfg["modeller"].items():
        if not os.path.exists(cfg["model"]):
            print(f"  {cfg['ad']} model dosyasi eksik, atlaniyor.")
            continue
        X_test, y_test = veri_yukle(cfg)
        if X_test is None:
            print(f"  {cfg['ad']} veri dosyasi eksik, atlaniyor.")
            continue
        print(f"  {cfg['ad']} yukleniyor...")
        yuklenen[key] = {
            "cfg"   : cfg,
            "model" : model_yukle(cfg["model"]),
            "X_test": X_test,
            "y_test": y_test,
        }

    while True:
        print(f"\n{'='*50}")
        print(f"  {organ_ad} — Model Secimi")
        print(f"{'='*50}")
        for key, cfg in organ_cfg["modeller"].items():
            durum = "✓" if key in yuklenen else "✗ (dosya eksik)"
            print(f"  {key} -> {cfg['ad']} {durum}")
        print(f"  3 -> Modelleri Karsilastir")
        print(f"  0 -> Geri")

        secim = input("\n  Seciminiz: ").strip()

        if secim == '0':
            break
        elif secim == '3':
            karsılastir_menu(organ_cfg, organ_ad)
        elif secim in yuklenen:
            veri     = yuklenen[secim]
            model_ad = veri["cfg"]["ad"]
            X_test   = veri["X_test"]
            y_test   = veri["y_test"]
            model    = veri["model"]

            while True:
                print(f"\n  {organ_ad} / {model_ad}")
                print("  1 -> Veri Seti Analizi")
                print("  2 -> Model Mimarisi")
                print("  3 -> Test Sonuclari")
                print("  4 -> Tahmin Gorselleri")
                print("  5 -> Egitim Grafikleri")
                print("  0 -> Geri")

                alt_secim = input("\n  Seciminiz: ").strip()
                if   alt_secim == '1': bolum_veri(X_test, y_test, organ_ad, model_ad)
                elif alt_secim == '2': bolum_mimari(model, organ_ad, model_ad)
                elif alt_secim == '3': bolum_sonuclar(model, X_test, y_test, organ_ad, model_ad)
                elif alt_secim == '4': bolum_tahminler(model, X_test, y_test, organ_ad, model_ad)
                elif alt_secim == '5': bolum_grafik(veri["cfg"], organ_ad, model_ad)
                elif alt_secim == '0': break
                else: print("  Gecersiz secim")
        else:
            print("  Gecersiz secim")


def ana_menu():
    while True:
        print("\n" + "╔" + "═"*48 + "╗")
        print("║     MEDİKAL GORUNTU SEGMENTASYON SİSTEMİ     ║")
        print("║                 Ana Menu                      ║")
        print("╠" + "═"*48 + "╣")
        for key, organ in ORGANLAR.items():
            print(f"║  {key} -> {organ['ad']:<44}║")
        print("║  0 -> Cikis                                   ║")
        print("╚" + "═"*48 + "╝")

        secim = input("\n  Seciminiz: ").strip()
        if secim == '0':
            print("\n  Iyi sunumlar!\n")
            break
        elif secim in ORGANLAR:
            model_menu(ORGANLAR[secim], ORGANLAR[secim]["ad"])
        else:
            print("  Gecersiz secim")


if __name__ == '__main__':
    ana_menu()