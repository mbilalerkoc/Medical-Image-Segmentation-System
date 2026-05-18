# preprocess.py
# Görüntü ön işleme: CLAHE, resize, normalizasyon

import cv2
import numpy as np
from config_colab import IMG_SIZE


def apply_clahe(img):
    """Kontrast artırma (CLAHE)"""
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    lab = cv2.merge((l, a, b))
    return cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)


def preprocess(img_path, mask_path):
    """
    Tek bir görüntü-maske çiftini işler.
    Döndürür: (img, mask) veya (None, None) hata durumunda
    """
    img  = cv2.imread(img_path)
    mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)

    if img is None or mask is None:
        return None, None

    # Kontrast artır
    img = apply_clahe(img)

    # Boyutlandır
    img  = cv2.resize(img,  (IMG_SIZE, IMG_SIZE))
    mask = cv2.resize(mask, (IMG_SIZE, IMG_SIZE))

    # Normalizasyon
    img = img.astype(np.float32) / 255.0

    # Maskeyi binary yap (0 veya 1)
    _, mask = cv2.threshold(mask, 127, 255, cv2.THRESH_BINARY)
    mask = mask.astype(np.float32) / 255.0

    # Kanal boyutu ekle: (256, 256) → (256, 256, 1)
    if len(mask.shape) == 2:
        mask = np.expand_dims(mask, axis=-1)

    return img, mask