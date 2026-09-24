# --- demo/data_ops.py ---

import os
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split

# AI Engine importları
from ai_engine.model import birlesik_loss, dice_katsayisi, agirlikli_birlesik_loss

def gercek_veri_sayisi_bul(klasor_yolu):
    if not os.path.exists(klasor_yolu):
        return "Bilinmiyor (Klasor Yok)"
    toplam_resim = 0
    for root, dirs, files in os.walk(klasor_yolu):
        for dosya in files:
            if dosya.lower().endswith(('.png', '.jpg', '.jpeg', '.dcm', '.tif')):
                toplam_resim += 1
    return toplam_resim

def model_yukle(yol):
    return tf.keras.models.load_model(
        yol,
        custom_objects={
            'birlesik_loss': birlesik_loss,
            'agirlikli_birlesik_loss': agirlikli_birlesik_loss,
            'dice_katsayisi': dice_katsayisi
        }
    )

def veri_yukle(cfg):
    if os.path.exists(cfg["X_test"]) and os.path.exists(cfg["y_test"]):
        X_test = np.load(cfg["X_test"])
        y_test = np.load(cfg["y_test"])
    elif cfg.get("X_npy") and os.path.exists(cfg["X_npy"]):
        X = np.load(cfg["X_npy"])
        y = np.load(cfg["y_npy"])
        np.random.seed(42)
        ornek_idx = np.random.choice(len(X), min(500, len(X)), replace=False)
        _, X_test, _, y_test = train_test_split(X[ornek_idx], y[ornek_idx], test_size=0.2, random_state=42)
    else:
        return None, None

    X_test = X_test / 255.0 if X_test.max() > 1.0 else X_test
    return X_test, y_test

def metrik_oku(txt_yolu):
    m = {"accuracy": 0.0, "dice": 0.0, "iou": 0.0, "precision": 0.0, "recall": 0.0, "loss": 0.0}
    if not os.path.exists(txt_yolu):
        return m

    with open(txt_yolu, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    for line in lines:
        l = line.lower()
        try:
            if "accuracy" in l and ":" in l: m["accuracy"] = float(l.split(":")[1].split()[0])
            elif "dice score" in l and ":" in l: m["dice"] = float(l.split(":")[1].split()[0])
            elif "iou" in l and ":" in l: m["iou"] = float(l.split(":")[1].split()[0])
            elif "precision" in l and ":" in l: m["precision"] = float(l.split(":")[1].split()[0])
            elif "recall" in l and ":" in l: m["recall"] = float(l.split(":")[1].split()[0])
            elif "loss" in l and ":" in l: m["loss"] = float(l.split(":")[1].split()[0])
        except:
            continue
    return m