# --- en_iyileri_kaydet.py ---

import os
import numpy as np
import matplotlib.pyplot as plt
import tensorflow as tf

# Projendeki kendi modüllerimizden import ediyoruz
from sunum import ORGANLAR
from demo.data_ops import veri_yukle, model_yukle
from ai_engine.utils import tumor_analizi_yap


def en_iyi_tahminleri_bul_ve_kaydet():
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

    # 1. U-Net++ Modelinin Ayarlarını Çek
    print("--- 🏆 EN IYI TAHMINLERI BULMA VE KAYDETME ARACI ---")
    cfg = ORGANLAR["1"]["modeller"]["1"]  # 1: Beyin, 3: U-Net++
    organ_ad = "Beyin Tumoru"
    model_ad = cfg["ad"]

    print(f"\n[*] {model_ad} ve test verileri yukleniyor...")
    model = model_yukle(cfg["model"])
    X_test, y_test = veri_yukle(cfg)

    # Sadece içinde tümör olan gerçek vakaları al
    tumoru_olan_idxler = np.where(y_test.max(axis=(1, 2, 3)) > 0)[0]

    print(
        f"[*] Toplam {len(tumoru_olan_idxler)} tumorlu vaka uzerinde tahmin yapiliyor (Bu islem birkac dakika surebilir)...")
    # Tümörlü vakalar için tahmin üret
    tahminler = model.predict(X_test[tumoru_olan_idxler], batch_size=8, verbose=1)

    print("[*] Dice (Piksel Ortusme) skorlari hesaplaniyor ve siralaniryor...")
    skorlar = []
    for i, idx in enumerate(tumoru_olan_idxler):
        g_maske = y_test[idx]
        t_maske = tahminler[i]

        intersection = np.sum((g_maske > 0) * (t_maske > 0.5))
        union = np.sum(g_maske > 0) + np.sum(t_maske > 0.5)
        dice_skoru = (2. * intersection) / (union + 1e-7)

        skorlar.append((dice_skoru, idx, t_maske))

    # Skorları büyükten küçüğe sırala ve en iyi 5'i al
    skorlar.sort(key=lambda x: x[0], reverse=True)
    en_iyiler = skorlar[:5]

    # --- 🎨 GÖRSELLEŞTİRME VE KAYDETME ---
    print("[*] Gorseller olusturuluyor...")
    # Yazıların sığması için figürü büyüttük (18x12)
    plt.figure(figsize=(18, 12))
    plt.suptitle(f"En Iyi Tahmin Sonuclari (Top 5) — {organ_ad} / {model_ad}", fontsize=16, fontweight='bold', y=0.95)

    for i, (dice, idx, t_maske) in enumerate(en_iyiler):
        gercek_analiz = tumor_analizi_yap(y_test[idx])
        tahmin_analiz = tumor_analizi_yap(t_maske)

        # 1. Sütun: Orijinal MR
        plt.subplot(3, 5, i + 1)
        plt.imshow(X_test[idx].squeeze(), cmap='gray')
        plt.title(f"MR [{idx}]\nBaşarı: %{(dice * 100):.1f}", fontsize=11, fontweight='bold')
        plt.axis('off')

        # 2. Sütun: Gerçek Maske
        plt.subplot(3, 5, i + 1 + 5)
        plt.imshow(y_test[idx].squeeze(), cmap='gray')
        plt.title("Gercek Maske", pad=15)  # Başlığı biraz yukarı kaldırdık
        plt.axis('off')

        # YAZI KAYMASINI ÖNLEYEN AYAR (y=-0.25 ve pad artırıldı)
        bilgi_gercek = f"Alan: {gercek_analiz['alan']:.1f} mm²"
        plt.text(0.5, -0.25, bilgi_gercek, size=11, ha="center", va="top", transform=plt.gca().transAxes,
                 bbox=dict(boxstyle="round,pad=0.4", ec=(0.2, 0.6, 0.2), fc=(0.9, 1.0, 0.9), alpha=0.9))

        # 3. Sütun: Model Tahmini
        plt.subplot(3, 5, i + 1 + 10)
        plt.imshow(t_maske.squeeze() > 0.5, cmap='gray')
        plt.title("Model Tahmini", pad=15)  # Başlığı biraz yukarı kaldırdık
        plt.axis('off')

        # YAZI KAYMASINI ÖNLEYEN AYAR (y=-0.25)
        bilgi_tahmin = f"Alan: {tahmin_analiz['alan']:.1f} mm²"
        plt.text(0.5, -0.25, bilgi_tahmin, size=11, ha="center", va="top", transform=plt.gca().transAxes,
                 bbox=dict(boxstyle="round,pad=0.4", ec=(0.1, 0.5, 0.8), fc=(0.9, 0.95, 1.0), alpha=0.9))

    # YAZILARIN ÇAKIŞMASINI ENGELLEYEN ANA AYAR (hspace=0.7)
    plt.subplots_adjust(top=0.88, bottom=0.10, hspace=0.7, wspace=0.3)

    # Görüntüyü 'docs/results' klasörüne yüksek çözünürlüklü kaydet
    # Bir üst klasöre çık, docs klasörüne gir ve results içine kaydet
    kayit_yolu = os.path.join("..", "docs", "results", "UNET_en_iyi_5_tahmin.png")
    os.makedirs(os.path.dirname(kayit_yolu), exist_ok=True)

    plt.savefig(kayit_yolu, bbox_inches='tight', dpi=300)
    print(f"\n[✅] Islem tamam! Muazzam bir gorsel suraya kaydedildi:\n -> {kayit_yolu}")

    # Kullanıcıya istersen ekranda da göster
    plt.show()


if __name__ == "__main__":
    en_iyi_tahminleri_bul_ve_kaydet()