# --- demo/visualizer.py ---

import os
import numpy as np
import matplotlib.pyplot as plt
from matplotlib import image as mpimg

# Diğer dosyalardan gereken fonksiyonlar
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


def bolum_mimari(model, organ_ad, model_ad):
    print("\n" + "=" * 50)
    print(f"  MODEL MIMARISI — {organ_ad} / {model_ad}")
    print("=" * 50)
    model.summary()


def bolum_sonuclar(cfg, organ_ad, model_ad):
    print("\n" + "=" * 50)
    print(f"  TEST SONUCLARI — {organ_ad} / {model_ad}")
    print("=" * 50)
    txt_yolu = cfg.get("txt", "")
    if os.path.exists(txt_yolu):
        with open(txt_yolu, 'r', encoding='utf-8') as f:
            print("\n" + f.read())
    else:
        print(f"\n  Hata: {os.path.basename(txt_yolu)} dosyasi bulunamadi!")


def bolum_tahminler(model, X_test, y_test, organ_ad, model_ad):
    print("\n" + "=" * 50)
    print(f"  TAHMIN GORSELLESTIRME VE KLINIK ANALIZ — {organ_ad} / {model_ad}")
    print("=" * 50)

    tumoru_olan_test = np.where(y_test.max(axis=(1, 2, 3)) > 0)[0]

    while True:
        print("\n  🎲 Veri setinden rastgele kesitler seciliyor...")
        secilecek_sayi = min(5, len(tumoru_olan_test))
        ornek_idxler = np.random.choice(tumoru_olan_test, secilecek_sayi, replace=False)
        tahminler = model.predict(X_test[ornek_idxler], verbose=0)

        # Figür boyutunu biraz daha açtık (Kutucuklar rahat sığsın diye)
        plt.figure(figsize=(15, 11))
        plt.suptitle(f"Canli Tahmin Sonuclari — {organ_ad} / {model_ad}", fontsize=14, fontweight='bold')

        for i, idx in enumerate(ornek_idxler):
            # Analizleri İki Maske İçin de Yap
            gercek_analiz = tumor_analizi_yap(y_test[idx])
            tahmin_analiz = tumor_analizi_yap(tahminler[i])

            # 1. Sütun: Orijinal MR
            plt.subplot(3, secilecek_sayi, i + 1)
            plt.imshow(X_test[idx].squeeze(), cmap='gray')
            plt.title(f"MR [{idx}]")
            plt.axis('off')

            # 2. Sütun: Gerçek Maske (Doktorun Çizdiği)
            plt.subplot(3, secilecek_sayi, i + 1 + secilecek_sayi)
            plt.imshow(y_test[idx].squeeze(), cmap='gray')
            plt.title("Gercek Maske")
            plt.axis('off')

            # --- GERÇEK MASKENİN ALTINA BİLGİ KUTUSU (Yeşilimsi) ---
            bilgi_gercek = f"Gercek Alan: {gercek_analiz['alan']:.1f} mm²\nBoyut: {gercek_analiz['genislik']:.1f}x{gercek_analiz['yukseklik']:.1f} mm"
            plt.text(0.5, -0.15, bilgi_gercek, size=9, ha="center", va="top",
                     transform=plt.gca().transAxes,
                     bbox=dict(boxstyle="round,pad=0.3", ec=(0.2, 0.6, 0.2), fc=(0.9, 1.0, 0.9), alpha=0.9))

            # 3. Sütun: Model Tahmini
            plt.subplot(3, secilecek_sayi, i + 1 + 2 * secilecek_sayi)
            plt.imshow(tahminler[i].squeeze() > 0.5, cmap='gray')
            plt.title("Model Tahmini")
            plt.axis('off')

            # --- TAHMİN EDİLEN MASKENİN ALTINA BİLGİ KUTUSU (Mavimsi) ---
            bilgi_tahmin = f"Tahmini Alan: {tahmin_analiz['alan']:.1f} mm²\nBoyut: {tahmin_analiz['genislik']:.1f}x{tahmin_analiz['yukseklik']:.1f} mm"
            plt.text(0.5, -0.15, bilgi_tahmin, size=9, ha="center", va="top",
                     transform=plt.gca().transAxes,
                     bbox=dict(boxstyle="round,pad=0.3", ec=(0.1, 0.5, 0.8), fc=(0.9, 0.95, 1.0), alpha=0.9))

        plt.tight_layout()
        # Kutucukların resimlerin üzerine binmemesi ve alttan kesilmemesi için boşluk ayarı
        plt.subplots_adjust(bottom=0.12, hspace=0.4)
        plt.show()

        # Terminalde de Karşılaştırmalı Gösterim
        print("\n  --- 🩺 HESAPLANAN KLINIK TUMOR VERILERI KARSILASTIRMASI ---")
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


def karsılastir_metrik(organ_cfg, organ_ad):
    print("\n" + "=" * 50)
    print(f"  METRIK KARSILASTIRMASI — {organ_ad}")
    print("=" * 50)
    modeller = organ_cfg["modeller"]
    metrikler = {}
    for key, cfg in modeller.items():
        if os.path.exists(cfg["txt"]):
            metrikler[cfg["ad"]] = metrik_oku(cfg["txt"])

    isimler = list(metrikler.keys())
    if len(isimler) < 2:
        print("\n  En az 2 metrik dosyasi gerekli!")
        return

    print(f"\n  {'Metrik':<12} {isimler[0]:<15} {isimler[1]:<15} Kazanan")
    print(f"  {'-' * 55}")
    for metrik in ["accuracy", "dice", "iou", "precision", "recall"]:
        v1 = metrikler[isimler[0]][metrik]
        v2 = metrikler[isimler[1]][metrik]
        kazanan = isimler[0] if v1 > v2 else isimler[1]
        print(f"  {metrik.capitalize():<12} {v1:<15.4f} {v2:<15.4f} {kazanan}")


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
        print("  ❌ Hatali secim!")
        return

    cfg1, cfg2 = modeller[s1], modeller[s2]
    print(f"  Modeller yukleniyor ({cfg1['ad']} vs {cfg2['ad']})... Lutfen bekleyin.")
    model1 = model_yukle(cfg1["model"])
    model2 = model_yukle(cfg2["model"])

    # Ortak test verisini yüklüyoruz
    X_test, y_test = veri_yukle(cfg1)
    if X_test is None:
        print("  ❌ Ortak test verisi yuklenemedi!")
        return

    tumoru_olan = np.where(y_test.max(axis=(1, 2, 3)) > 0)[0]

    while True:
        print("\n  🎲 Ortak test setinden rastgele 3 kesit seciliyor...")
        idxler = np.random.choice(tumoru_olan, 3, replace=False)

        tahmin1 = model1.predict(X_test[idxler], verbose=0)
        tahmin2 = model2.predict(X_test[idxler], verbose=0)

        # 4 sütun olacağı için figürü biraz daha genişletiyoruz
        plt.figure(figsize=(18, 12))
        plt.suptitle(f"Tahmin Karsilastirmasi — {organ_ad} ({cfg1['ad']} vs {cfg2['ad']})", fontsize=14,
                     fontweight='bold')

        for i, idx in enumerate(idxler):
            # Analizleri üç maske için de yap
            g_analiz = tumor_analizi_yap(y_test[idx])
            t1_analiz = tumor_analizi_yap(tahmin1[i])
            t2_analiz = tumor_analizi_yap(tahmin2[i])

            # 1. Sütun: Orijinal MR
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


def genel_klinik_rapor_olustur(model, X_test, y_test, organ_ad, model_ad):
    """
    Tüm test setini tarayarak genel klinik başarıyı hesaplar.
    Bu işlem tüm test seti üzerinde yapıldığı için birkaç saniye sürebilir.
    """
    print("\n" + "=" * 60)
    print(f"  🩺 GENEL KLINIK DEGERLENDIRME RAPORU — {organ_ad} / {model_ad}")
    print("=" * 60)
    print("  Hesaplaniyor... Lutfen bekleyin (Tum test seti taranıyor)...")

    # Tüm test seti için tahminleri al
    tahminler = model.predict(X_test, verbose=0)

    toplam_vaka = len(y_test)
    gercek_tumorlu_sayisi = 0
    tahmin_edilen_tumor_sayisi = 0
    dogru_tespit_sayisi = 0  # Gerçekte olanı bulanlar (True Positive)

    toplam_alan_farki = 0.0
    hesaplanan_tumor_sayisi = 0

    for i in range(toplam_vaka):
        g_maske = y_test[i]
        t_maske = tahminler[i]

        gercek_var = np.max(g_maske) > 0
        tahmin_var = np.max(t_maske) > 0.5

        if gercek_var:
            gercek_tumorlu_sayisi += 1
            if tahmin_var:
                dogru_tespit_sayisi += 1
                # Sadece doğru tespit edilenlerde alan hesabı yap (hata oranını bulmak için)
                g_analiz = tumor_analizi_yap(g_maske)
                t_analiz = tumor_analizi_yap(t_maske)
                alan_farki = abs(g_analiz['alan'] - t_analiz['alan'])
                toplam_alan_farki += alan_farki
                hesaplanan_tumor_sayisi += 1

        if tahmin_var:
            tahmin_edilen_tumor_sayisi += 1

    # İstatistiksel Hesaplamalar
    if gercek_tumorlu_sayisi > 0:
        tespit_orani = (dogru_tespit_sayisi / gercek_tumorlu_sayisi) * 100
    else:
        tespit_orani = 0.0

    if hesaplanan_tumor_sayisi > 0:
        ortalama_alan_sapmasi = toplam_alan_farki / hesaplanan_tumor_sayisi
    else:
        ortalama_alan_sapmasi = 0.0

    # Sahte pozitifler (Gerçekte yok ama model buldum sanıyor)
    yanlis_alarmlar = tahmin_edilen_tumor_sayisi - dogru_tespit_sayisi

    y_gercek_duz = y_test.flatten()
    y_tahmin_duz = tahminler.flatten()

    mse = np.mean(np.square(y_gercek_duz - y_tahmin_duz))
    rmse = np.sqrt(mse)
    mae = np.mean(np.abs(y_gercek_duz - y_tahmin_duz))

    print("\n  --- 📊 TEST SETI GENEL ISTATISTIKLERI ---")
    print(f"  Toplam Test Vakasi         : {toplam_vaka}")
    print(f"  Gercek Tumorlu Vaka Sayisi : {gercek_tumorlu_sayisi}")
    print(f"  Modelin Buldugu Vaka Sayisi: {tahmin_edilen_tumor_sayisi}")
    print("-" * 60)
    print(f"  Basarili Tespit (TP)       : {dogru_tespit_sayisi} vaka")
    print(f"  Yanlis Alarm (FP)          : {yanlis_alarmlar} vaka (Tumor yokken var dedi)")
    print(f"  Kacirilan Vaka (FN)        : {gercek_tumorlu_sayisi - dogru_tespit_sayisi} vaka (Tumor varken gormedi)")
    print("-" * 60)
    print(f"  Klinik Tespit Basarisi     : % {tespit_orani:.2f}")
    print(f"  Ortalama Alan Sapmasi      : ± {ortalama_alan_sapmasi:.2f} mm² (Vaka basina)")
    print("-" * 60)
    print("  --- 📐 MATEMATIKSEL HATA METRIKLERI ---")
    print(f"  Ortalama Kare Hatasi (MSE) : {mse:.6f}")
    print(f"  Kok Ort. Kare Hatasi (RMSE): {rmse:.6f}")
    print(f"  Ortalama Mutlak Hata (MAE) : {mae:.6f}")
    print("=" * 60)

    input("\n  Devam etmek icin Enter'a basin...")