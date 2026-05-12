import os
import numpy as np
from demo.data_ops import metrik_oku
from ai_engine.utils import tumor_analizi_yap

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


def genel_klinik_rapor_olustur(model, X_test, y_test, organ_ad, model_ad):
    """
    Tüm test setini tarayarak genel klinik başarıyı hesaplar.
    Sonuçları önbelleğe (cache) alarak sunum esnasında anında gösterim sağlar.
    """
    dosya_adi = f"{model_ad.replace(' ', '_').replace('/', '-')}_klinik_rapor.txt"
    rapor_yolu = os.path.join("docs", "results", dosya_adi)

    if os.path.exists(rapor_yolu):
        print("\n  [⚡ SISTEM ONBELLEGINDEN (CACHE) ANINDA YUKLENIYOR...]")
        with open(rapor_yolu, 'r', encoding='utf-8') as f:
            print(f.read())
        input("\n  Devam etmek icin Enter'a basin...")
        return

    print("\n" + "=" * 60)
    print(f" GENEL KLINIK DEGERLENDIRME RAPORU — {organ_ad} / {model_ad}")
    print("=" * 60)
    print("  Hesaplaniyor... Tum test seti taraniyor)...")
    print("  Model tahminleri uretiyor... Bu islem bilgisayarinizin hizina gore 3-10 dakika surebilir.")

    tahminler = model.predict(X_test, batch_size=8, verbose=1)

    toplam_vaka = len(y_test)
    gercek_tumorlu_sayisi = 0
    tahmin_edilen_tumor_sayisi = 0
    dogru_tespit_sayisi = 0

    # Hocanın istediği ekstra hesaplamalar için değişkenler
    toplam_alan_farki = 0.0
    toplam_genislik_farki = 0.0
    toplam_yukseklik_farki = 0.0
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

                # Hem Alan Hem Boyut (Genişlik/Yükseklik) farklarını al
                g_analiz = tumor_analizi_yap(g_maske)
                t_analiz = tumor_analizi_yap(t_maske)

                toplam_alan_farki += abs(g_analiz['alan'] - t_analiz['alan'])
                toplam_genislik_farki += abs(g_analiz['genislik'] - t_analiz['genislik'])
                toplam_yukseklik_farki += abs(g_analiz['yukseklik'] - t_analiz['yukseklik'])

                hesaplanan_tumor_sayisi += 1

        if tahmin_var:
            tahmin_edilen_tumor_sayisi += 1

    tespit_orani = (dogru_tespit_sayisi / gercek_tumorlu_sayisi * 100) if gercek_tumorlu_sayisi > 0 else 0.0
    ortalama_alan_sapmasi = (toplam_alan_farki / hesaplanan_tumor_sayisi) if hesaplanan_tumor_sayisi > 0 else 0.0
    ortalama_genislik_sapmasi = (
                toplam_genislik_farki / hesaplanan_tumor_sayisi) if hesaplanan_tumor_sayisi > 0 else 0.0
    ortalama_yukseklik_sapmasi = (
                toplam_yukseklik_farki / hesaplanan_tumor_sayisi) if hesaplanan_tumor_sayisi > 0 else 0.0

    yanlis_alarmlar = tahmin_edilen_tumor_sayisi - dogru_tespit_sayisi
    kacirilan_vakalar = gercek_tumorlu_sayisi - dogru_tespit_sayisi

    y_gercek_duz = y_test.flatten()
    y_tahmin_duz = tahminler.flatten()

    mse = np.mean(np.square(y_gercek_duz - y_tahmin_duz))
    rmse = np.sqrt(mse)
    mae = np.mean(np.abs(y_gercek_duz - y_tahmin_duz))

    rapor_metni = f"""
============================================================
    GENEL KLINIK DEGERLENDIRME RAPORU — {organ_ad} / {model_ad}
============================================================
  --- TEST SETI GENEL ISTATISTIKLERI ---
  Toplam Test Vakasi         : {toplam_vaka}
  Gercek Tumorlu Vaka Sayisi : {gercek_tumorlu_sayisi}
  Modelin Buldugu Vaka Sayisi: {tahmin_edilen_tumor_sayisi}
------------------------------------------------------------
  Basarili Tespit (TP)       : {dogru_tespit_sayisi} vaka
  Yanlis Alarm (FP)          : {yanlis_alarmlar} vaka (Tumor yokken var dedi)
  Kacirilan Vaka (FN)        : {kacirilan_vakalar} vaka (Tumor varken gormedi)
------------------------------------------------------------
  Klinik Tespit Basarisi     : % {tespit_orani:.2f}

  --- KLINIK OLCUM SAPMALARI ---
  Ortalama Alan Sapmasi      : ± {ortalama_alan_sapmasi:.2f} mm²
  Ortalama Genislik Sapmasi  : ± {ortalama_genislik_sapmasi:.2f} mm
  Ortalama Yukseklik Sapmasi : ± {ortalama_yukseklik_sapmasi:.2f} mm
------------------------------------------------------------
  --- MATEMATIKSEL HATA METRIKLERI ---
  Ortalama Kare Hatasi (MSE) : {mse:.6f}
  Kok Ort. Kare Hatasi (RMSE): {rmse:.6f}
  Ortalama Mutlak Hata (MAE) : {mae:.6f}
============================================================
"""

    print(rapor_metni)

    os.makedirs(os.path.dirname(rapor_yolu), exist_ok=True)
    with open(rapor_yolu, 'w', encoding='utf-8') as f:
        f.write(rapor_metni)

    print(f"  [ℹ] Rapor hesaplandi ve onbellege kaydedildi: {rapor_yolu}")
    input("\n  Devam etmek icin Enter'a basin...")