import os
import numpy as np
from demo.data_ops import metrik_oku
from ai_engine.utils import tumor_analizi_yap

def bolum_mimari(model, organ_ad, model_ad):
    print("\n" + "=" * 50)
    print(f"  MODEL MIMARISI — {organ_ad} / {model_ad}")
    print("=" * 50)
    model.summary()

