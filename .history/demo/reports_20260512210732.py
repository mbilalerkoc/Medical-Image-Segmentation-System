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
