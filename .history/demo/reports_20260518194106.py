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
    # Dinamik terim ayarı
    is_beyin = "beyin" in organ_ad.lower()
    hastalik_ad = "Tumor" if is_beyin else "Tas"
    
    dosya_adi = f"{model_ad.replace(' ', '_').replace('/', '-')}_klinik_rapor.txt"
    rapor_yolu = os.path.join("docs", "results", dosya_adi)

    # ... (Kodun önbellek kontrol kısmı aynen kalıyor) ...

    # İstatistik değişken isimlerini genel bir ada kavuştur (tumorlu_sayisi -> pozitif_sayisi)
    gercek_pozitif_sayisi = 0
    tahmin_edilen_pozitif_sayisi = 0
    dogru_tespit_sayisi = 0

    toplam_alan_farki = 0.0
    toplam_genislik_farki = 0.0
    toplam_yukseklik_farki = 0.0
    hesaplanan_vaka_sayisi = 0

    for i in range(len(y_test)):
        g_maske = y_test[i]
        t_maske = tahminler[i]

        gercek_var = np.max(g_maske) > 0
        tahmin_var = np.max(t_maske) > 0.5

        if gercek_var:
            gercek_pozitif_sayisi += 1
            if tahmin_var:
                dogru_tespit_sayisi += 1
                # Fonksiyon adını daha genel yapabiliriz (Aşağıda belirttim)
                g_analiz = tumor_analizi_yap(g_maske) 
                t_analiz = tumor_analizi_yap(t_maske)

                toplam_alan_farki += abs(g_analiz['alan'] - t_analiz['alan'])
                toplam_genislik_farki += abs(g_analiz['genislik'] - t_analiz['genislik'])
                toplam_yukseklik_farki += abs(g_analiz['yukseklik'] - t_analiz['yukseklik'])
                hesaplanan_vaka_sayisi += 1

        if tahmin_var:
            tahmin_edilen_pozitif_sayisi += 1

    # ... (Matematiksel metrik hesapları mse, rmse kısımları aynen kalıyor) ...

    # 🎯 ŞABLONU DİNAMİK YAPTIK:
    rapor_metni = f"""
============================================================
    GENEL KLINIK DEGERLENDIRME RAPORU — {organ_ad} / {model_ad}
============================================================
  --- TEST SETI GENEL ISTATISTIKLERI ---
  Toplam Test Vakasi         : {len(y_test)}
  Gercek {hastalik_ad}li Vaka Sayisi : {gercek_pozitif_sayisi}
  Modelin Buldugu Vaka Sayisi: {tahmin_edilen_pozitif_sayisi}
------------------------------------------------------------
  Basarili Tespit (TP)       : {dogru_tespit_sayisi} vaka
  Yanlis Alarm (FP)          : {tahmin_edilen_pozitif_sayisi - dogru_tespit_sayisi} vaka ({hastalik_ad} yokken var dedi)
  Kacirilan Vaka (FN)        : {gercek_pozitif_sayisi - dogru_tespit_sayisi} vaka ({hastalik_ad} varken gormedi)
------------------------------------------------------------
  Klinik Tespit Basarisi     : % {tespit_orani:.2f}

  --- KLINIK OLCUM SAPMALARI ---
  Ortalama Alan Sapmasi      : ± {ortalama_alan_sapmasi:.2f} mm²
  Ortalama Genislik Sapmasi  : ± {ortalama_genislik_sapmasi:.2f} mm
  Ortalama Yukseklik Sapmasi : ± {ortalama_yukseklik_sapmasi:.2f} mm
------------------------------------------------------------
"""