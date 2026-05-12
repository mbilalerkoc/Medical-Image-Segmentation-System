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