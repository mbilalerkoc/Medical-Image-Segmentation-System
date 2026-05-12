import os
import numpy as np
import matplotlib.pyplot as plt
import tkinter as tk
from tkinter import filedialog
from tensorflow.keras.utils import load_img, img_to_array

from demo.data_ops import gercek_veri_sayisi_bul, metrik_oku, model_yukle, veri_yukle
from ai_engine.utils import tumor_analizi_yap


def gorsel_goster(yol, baslik):
    if not os.path.exists(yol):
        print(f"\n  Dosya bulunamadi: {yol}")
        return
    img = mpimg.imread(yol)
    plt.figure(figsize=(16, 6))
    plt.imshow(img)
    plt.title(baslik, fontsize=14, fontweight='bold')
    plt.axis('off')
    plt.tight_layout()
    plt.show()


def bolum_veri(X_test, y_test, organ_ad, model_ad, ham_veri_klasoru):
    print("\n" + "=" * 50)
    print(f"  VERI SETI — {organ_ad} / {model_ad}")
    print("=" * 50)
    tumoru_olan = np.sum(y_test.max(axis=(1, 2, 3)) > 0)
    tumoru_olmayan = len(y_test) - tumoru_olan
    gercek_toplam_veri = gercek_veri_sayisi_bul(ham_veri_klasoru)

    print(f"\n  Ham Veri Havuzu          : {gercek_toplam_veri} goruntu")
    print(f"  Kritik Test Seti         : {len(X_test)} goruntu")
    print(f"  Goruntu boyutu           : {X_test.shape[1]}x{X_test.shape[2]} piksel")
    print(f"\n  --- Test Seti Icerigi ---")
    print(f"  Tumorlu (Pozitif) Vaka   : {tumoru_olan} adet")
    print(f"  Tumorsuz (Negatif) Vaka  : {tumoru_olmayan} adet")

    tumoru_olan_idx = np.where(y_test.max(axis=(1, 2, 3)) > 0)[0]
    ornekler = tumoru_olan_idx[np.linspace(0, len(tumoru_olan_idx) - 1, min(5, len(tumoru_olan_idx)), dtype=int)]

    plt.figure(figsize=(15, 6))
    plt.suptitle(f"Ornek MR Goruntuleri — {organ_ad} / {model_ad}", fontsize=14, fontweight='bold')
    for i, idx in enumerate(ornekler):
        plt.subplot(2, len(ornekler), i + 1)
        plt.imshow(X_test[idx].squeeze(), cmap='gray')
        plt.title(f"MR [{idx}]")
        plt.axis('off')
        plt.subplot(2, len(ornekler), i + 1 + len(ornekler))
        plt.imshow(y_test[idx].squeeze(), cmap='gray')
        plt.title(f"Maske [{idx}]")
        plt.axis('off')
    plt.tight_layout()
    plt.show()




def bolum_tahminler(model, X_test, y_test, organ_ad, model_ad):
    print("\n" + "=" * 50)
    print(f"  TAHMIN GORSELLESTIRME VE KLINIK ANALIZ — {organ_ad} / {model_ad}")
    print("=" * 50)

    tumoru_olan_test = np.where(y_test.max(axis=(1, 2, 3)) > 0)[0]

    while True:
        print("\n Veri setinden rastgele kesitler seciliyor...")
        secilecek_sayi = min(5, len(tumoru_olan_test))
        ornek_idxler = np.random.choice(tumoru_olan_test, secilecek_sayi, replace=False)
        tahminler = model.predict(X_test[ornek_idxler], verbose=0)

        plt.figure(figsize=(15, 11))
        plt.suptitle(f"Canli Tahmin Sonuclari — {organ_ad} / {model_ad}", fontsize=14, fontweight='bold')

        for i, idx in enumerate(ornek_idxler):
            gercek_analiz = tumor_analizi_yap(y_test[idx])
            tahmin_analiz = tumor_analizi_yap(tahminler[i])

            # 1. Sütun: Orijinal MR
            plt.subplot(3, secilecek_sayi, i + 1)
            plt.imshow(X_test[idx].squeeze(), cmap='gray')
            plt.title(f"MR [{idx}]")
            plt.axis('off')

            # 2. Sütun: Gerçek Maske
            plt.subplot(3, secilecek_sayi, i + 1 + secilecek_sayi)
            plt.imshow(y_test[idx].squeeze(), cmap='gray')
            plt.title("Gercek Maske")
            plt.axis('off')

            bilgi_gercek = f"Gercek Alan: {gercek_analiz['alan']:.1f} mm²\nBoyut: {gercek_analiz['genislik']:.1f}x{gercek_analiz['yukseklik']:.1f} mm"
            plt.text(0.5, -0.15, bilgi_gercek, size=9, ha="center", va="top",
                     transform=plt.gca().transAxes,
                     bbox=dict(boxstyle="round,pad=0.3", ec=(0.2, 0.6, 0.2), fc=(0.9, 1.0, 0.9), alpha=0.9))

            # 3. Sütun: Model Tahmini
            plt.subplot(3, secilecek_sayi, i + 1 + 2 * secilecek_sayi)
            plt.imshow(tahminler[i].squeeze() > 0.5, cmap='gray')
            plt.title("Model Tahmini")
            plt.axis('off')

            bilgi_tahmin = f"Tahmini Alan: {tahmin_analiz['alan']:.1f} mm²\nBoyut: {tahmin_analiz['genislik']:.1f}x{tahmin_analiz['yukseklik']:.1f} mm"
            plt.text(0.5, -0.15, bilgi_tahmin, size=9, ha="center", va="top",
                     transform=plt.gca().transAxes,
                     bbox=dict(boxstyle="round,pad=0.3", ec=(0.1, 0.5, 0.8), fc=(0.9, 0.95, 1.0), alpha=0.9))

        plt.tight_layout()

        plt.subplots_adjust(bottom=0.12, hspace=0.4)
        plt.show()

        print("\n  --- HESAPLANAN KLINIK TUMOR VERILERI KARSILASTIRMASI ---")
        for i, idx in enumerate(ornek_idxler):
            g = tumor_analizi_yap(y_test[idx])
            t = tumor_analizi_yap(tahminler[i])
            fark_mm2 = abs(g['alan'] - t['alan'])
            print(
                f"  MR [{idx}] -> GERCEK: {g['alan']:.1f} mm² | TAHMIN: {t['alan']:.1f} mm² | FARK: {fark_mm2:.1f} mm²")

        secim = input("\n  Baska rastgele ornekler uretilsin mi? (e/h): ").strip().lower()
        if secim != 'e':
            break

def bolum_grafik(cfg, organ_ad, model_ad):
    print("\n" + "=" * 50)
    print(f"  EGITIM GRAFIKLERI — {organ_ad} / {model_ad}")
    print("=" * 50)
    gorsel_goster(cfg["grafik"], f"Egitim Grafikleri — {organ_ad} / {model_ad}")


def karsılastir_tahmin(organ_cfg, organ_ad):
    print("\n" + "=" * 50)
    print(f"  TAHMIN KARSILASTIRMASI VE KLINIK ANALIZ — {organ_ad}")
    print("=" * 50)
    modeller = organ_cfg["modeller"]

    print("\n  Hangi modelleri karsilastirmak istersiniz?")
    for key, cfg in modeller.items():
        print(f"  [{key}] -> {cfg['ad']}")
    s1 = input("  Birinci modelin numarasini girin: ").strip()
    s2 = input("  Ikinci modelin numarasini girin: ").strip()

    if s1 not in modeller or s2 not in modeller:
        print(" Hatali secim!")
        return

    cfg1, cfg2 = modeller[s1], modeller[s2]
    print(f"  Modeller yukleniyor ({cfg1['ad']} vs {cfg2['ad']})... Lutfen bekleyin.")
    model1 = model_yukle(cfg1["model"])
    model2 = model_yukle(cfg2["model"])

    X_test, y_test = veri_yukle(cfg1)
    if X_test is None:
        print(" Ortak test verisi yuklenemedi!")
        return

    tumoru_olan = np.where(y_test.max(axis=(1, 2, 3)) > 0)[0]

    while True:
        print("\n Ortak test setinden rastgele 3 kesit seciliyor...")
        idxler = np.random.choice(tumoru_olan, 3, replace=False)

        tahmin1 = model1.predict(X_test[idxler], verbose=0)
        tahmin2 = model2.predict(X_test[idxler], verbose=0)

        plt.figure(figsize=(18, 12))
        plt.suptitle(f"Tahmin Karsilastirmasi — {organ_ad} ({cfg1['ad']} vs {cfg2['ad']})", fontsize=14,
                     fontweight='bold')

        for i, idx in enumerate(idxler):
            g_analiz = tumor_analizi_yap(y_test[idx])
            t1_analiz = tumor_analizi_yap(tahmin1[i])
            t2_analiz = tumor_analizi_yap(tahmin2[i]
            plt.subplot(3, 4, i * 4 + 1)
            plt.imshow(X_test[idx].squeeze(), cmap='gray')
            plt.title(f"Orijinal MR [{idx}]")
            plt.axis('off')

            # 2. Sütun: Gerçek Maske
            plt.subplot(3, 4, i * 4 + 2)
            plt.imshow(y_test[idx].squeeze(), cmap='gray')
            plt.title("Gercek Maske")
            plt.axis('off')
            bilgi_g = f"Alan: {g_analiz['alan']:.1f} mm²"
            plt.text(0.5, -0.15, bilgi_g, size=10, ha="center", va="top", transform=plt.gca().transAxes,
                     bbox=dict(boxstyle="round,pad=0.3", ec=(0.2, 0.6, 0.2), fc=(0.9, 1.0, 0.9), alpha=0.9))

            # 3. Sütun: Model 1 Tahmini
            plt.subplot(3, 4, i * 4 + 3)
            plt.imshow(tahmin1[i].squeeze() > 0.5, cmap='gray')
            plt.title(cfg1["ad"])
            plt.axis('off')
            bilgi_t1 = f"Alan: {t1_analiz['alan']:.1f} mm²"
            plt.text(0.5, -0.15, bilgi_t1, size=10, ha="center", va="top", transform=plt.gca().transAxes,
                     bbox=dict(boxstyle="round,pad=0.3", ec=(0.1, 0.5, 0.8), fc=(0.9, 0.95, 1.0), alpha=0.9))

            # 4. Sütun: Model 2 Tahmini
            plt.subplot(3, 4, i * 4 + 4)
            plt.imshow(tahmin2[i].squeeze() > 0.5, cmap='gray')
            plt.title(cfg2["ad"])
            plt.axis('off')
            bilgi_t2 = f"Alan: {t2_analiz['alan']:.1f} mm²"
            # İkinci modelin kutusunu biraz turuncu/sarımsı yapıyoruz ki fark edilsin
            plt.text(0.5, -0.15, bilgi_t2, size=10, ha="center", va="top", transform=plt.gca().transAxes,
                     bbox=dict(boxstyle="round,pad=0.3", ec=(0.8, 0.5, 0.1), fc=(1.0, 0.95, 0.9), alpha=0.9))

        plt.tight_layout()
        plt.subplots_adjust(bottom=0.12, hspace=0.4)
        plt.show()

        # Terminalde Yarışma Tablosu
        print("\n  --- 🩺 HESAPLANAN KLINIK TUMOR VERILERI KARSILASTIRMASI ---")
        for i, idx in enumerate(idxler):
            g = tumor_analizi_yap(y_test[idx])
            t1 = tumor_analizi_yap(tahmin1[i])
            t2 = tumor_analizi_yap(tahmin2[i])

            fark1 = abs(g['alan'] - t1['alan'])
            fark2 = abs(g['alan'] - t2['alan'])

            kazanan = cfg1['ad'] if fark1 < fark2 else cfg2['ad']

            print(
                f"  MR [{idx}] -> GERCEK: {g['alan']:.1f} mm² | {cfg1['ad']}: {t1['alan']:.1f} mm² (Sapma: {fark1:.1f}) | {cfg2['ad']}: {t2['alan']:.1f} mm² (Sapma: {fark2:.1f}) -> DAHA YAKIN: {kazanan}")

        if input("\n  Baska rastgele ornekler karsilastirilsin mi? (e/h): ").strip().lower() != 'e':
            break
