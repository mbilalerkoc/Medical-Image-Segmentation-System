import os
import tensorflow as tf

from ai_engine.config_local import PROJE_KLASORU, MODEL_KAYIT, SONUC_KLASOR

from demo.data_ops import veri_yukle, model_yukle
from demo.reports import (
    bolum_mimari,
    bolum_sonuclar,
    karsılastir_metrik,
    genel_klinik_rapor_olustur
)
from demo.visualizer import (
    bolum_veri,
    bolum_tahminler,
    bolum_grafik,
    karsılastir_tahmin, 
)
from demo.simulation import disaridan_mr_tahmin_et
1
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
tf.get_logger().setLevel('ERROR')

VERI_KLASORU = os.path.join(PROJE_KLASORU, 'processed_data')
HAM_VERI_KLASORU = os.path.join(PROJE_KLASORU, 'dataset', 'brain', 'images')

ORGANLAR = {
    "1": {
        "ad": "Beyin Tumoru",
        "modeller": {

            # "1": {
            #     "ad"      : "Model v1",
            #     "model"   : os.path.join(MODEL_KAYIT, 'beyin_v1.h5'),
            #     "X_test"  : os.path.join(VERI_KLASORU, 'beyin_v1_X.npy'),
            #     "y_test"  : os.path.join(VERI_KLASORU, 'beyin_v1_Y.npy'),
            #     "X_npy"   : os.path.join(VERI_KLASORU, 'beyin_v1_X.npy'),
            #     "y_npy"   : os.path.join(VERI_KLASORU, 'beyin_v1_Y.npy'),
            #     "grafik"  : os.path.join(SONUC_KLASOR, 'beyin_v1_egitim_grafikleri.png'),
            #     "tahmin"  : os.path.join(SONUC_KLASOR, 'beyin_v1_tahmin_sonuclari.png'),
            #     "txt"     : os.path.join(SONUC_KLASOR, 'beyin_v1_test_metrikleri.txt'),
            # },
            "1": {
                "ad"      : "U-NET Modeli",
                "model"   : os.path.join(MODEL_KAYIT, 'beyin_v2.h5'),
                "X_test"  : os.path.join(VERI_KLASORU, 'beyin_v2_X.npy'),
                "y_test"  : os.path.join(VERI_KLASORU, 'beyin_v2_Y.npy'),
                "X_npy"   : None,
                "y_npy"   : None,
                "grafik"  : os.path.join(SONUC_KLASOR, 'beyin_v2_egitim_grafikleri.png'),
                "tahmin"  : os.path.join(SONUC_KLASOR, 'beyin_v2_tahmin_sonuclari.png'),
                "txt"     : os.path.join(SONUC_KLASOR, 'beyin_v2_test_metrikleri.txt'),
            },
            "2": {
                "ad"      : "U-NET++ Modeli",
                "model"   : os.path.join(MODEL_KAYIT, 'beyin_v3.h5'),
                "X_test"  : os.path.join(VERI_KLASORU, 'beyin_v3_X.npy'),
                "y_test"  : os.path.join(VERI_KLASORU, 'beyin_v3_Y.npy'),
                "X_npy"   : None,
                "y_npy"   : None,
                "grafik"  : os.path.join(SONUC_KLASOR, 'beyin_v3_egitim_grafikleri.png'),
                "tahmin"  : os.path.join(SONUC_KLASOR, 'beyin_v3_tahmin_sonuclari.png'),
                "txt"     : os.path.join(SONUC_KLASOR, 'beyin_v3_test_metrikleri.txt'),
            },
        }
    },
    "2": {
        "ad": "Böbrek taşı",
        "modeller": {
            "1": {
                "ad"      : "U-NET++ Modeli",
                "model"   : os.path.join(MODEL_KAYIT, 'bobrek_v1.h5'),
                "X_test"  : os.path.join(VERI_KLASORU, 'bobrek_v1_X.npy'),
                "y_test"  : os.path.join(VERI_KLASORU, 'bobrek_v1_Y.npy'),
                "X_npy"   : None,
                "y_npy"   : None,
                "grafik"  : os.path.join(SONUC_KLASOR, 'bobrek_v3_egitim_grafikleri.png'),
                "tahmin"  : os.path.join(SONUC_KLASOR, 'bobrek_v3_tahmin_sonuclari.png'),
                "txt"     : os.path.join(SONUC_KLASOR, 'beyin_v3_test_metrikleri.txt'),
            },
        }
    }
}

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
        if secim == '1': karsılastir_metrik(organ_cfg, organ_ad)
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
            "cfg": cfg, "model": model_yukle(cfg["model"]),
            "X_test": X_test, "y_test": y_test,
        }

    while True:
        print(f"\n{'=' * 50}")
        print(f"  {organ_ad} — Model Secimi")
        print(f"{'=' * 50}")
        for key, cfg in organ_cfg["modeller"].items():
            durum = "✓" if key in yuklenen else "✗ (dosya eksik)"
            print(f"  {key} -> {cfg['ad']} {durum}")
        print(f"  4 -> Modelleri Karsilastir") # Burası 4 olarak düzeltildi
        print(f"  0 -> Geri")

        secim = input("\n  Seciminiz: ").strip()
        if secim == '0': break
        elif secim == '4': karsılastir_menu(organ_cfg, organ_ad)
        elif secim in yuklenen:
            veri = yuklenen[secim]
            while True:
                print(f"\n  {organ_ad} / {veri['cfg']['ad']}")
                print("  1 -> Veri Seti Analizi")
                print("  2 -> Model Mimarisi")
                print("  3 -> Test Sonuclari")
                print("  4 -> Tahmin Gorselleri (Klinik Analiz Ile)")
                print("  5 -> Egitim Grafikleri")
                print("  6 -> Genel Klinik Degerlendirme Raporu (TUM TEST SETI)")
                print("  7 -> Disaridan Yeni MR Yukle (CANLI SIMULASYON)") # <--- YENİ
                print("  0 -> Geri")

                alt_secim = input("\n  Seciminiz: ").strip()
                if alt_secim == '1': bolum_veri(veri["X_test"], veri["y_test"], organ_ad, veri['cfg']['ad'], HAM_VERI_KLASORU)
                elif alt_secim == '2': bolum_mimari(veri["model"], organ_ad, veri['cfg']['ad'])
                elif alt_secim == '3': bolum_sonuclar(veri["cfg"], organ_ad, veri['cfg']['ad'])
                elif alt_secim == '4': bolum_tahminler(veri["model"], veri["X_test"], veri["y_test"], organ_ad, veri['cfg']['ad'])
                elif alt_secim == '5': bolum_grafik(veri["cfg"], organ_ad, veri['cfg']['ad'])
                elif alt_secim == '6': genel_klinik_rapor_olustur(veri["model"], veri["X_test"], veri["y_test"], organ_ad, veri['cfg']['ad'])
                elif alt_secim == '7': disaridan_mr_tahmin_et(veri["model"], organ_ad, veri['cfg']['ad']) # <--- YENİ ÇAĞRI
                elif alt_secim == '0': break
                else: print("  Gecersiz secim")
        else: print("  Gecersiz secim")

def ana_menu():
    while True:
        print("\tAna Menu")
        for key, organ in ORGANLAR.items(): print(f" {key} -> {organ['ad']:<44} ")
        print(" 0 -> Cikis                                   ║")
        secim = input("\n  Seciminiz: ").strip()
        if secim == '0': break
        elif secim in ORGANLAR: model_menu(ORGANLAR[secim], ORGANLAR[secim]["ad"])
        else: print("  Gecersiz secim")

if __name__ == '__main__':
    ana_menu()