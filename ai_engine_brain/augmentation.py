# augmentation.py
# Veri artırma: flip, döndürme

import cv2
import numpy as np


def augment(img, mask):
    """
    Rastgele dönüşümler uygular.
    img ve mask aynı dönüşümü alır — eşleşme bozulmaz.
    """
    # Yatay çevirme (%50)
    if np.random.rand() > 0.5:
        img  = cv2.flip(img, 1)
        mask = cv2.flip(mask, 1)

    # Dikey çevirme (%30)
    if np.random.rand() > 0.7:
        img  = cv2.flip(img, 0)
        mask = cv2.flip(mask, 0)

    # Hafif döndürme (%30, ±10 derece)
    if np.random.rand() > 0.7:
        angle = np.random.uniform(-10, 10)
        h, w  = img.shape[:2]
        M     = cv2.getRotationMatrix2D((w // 2, h // 2), angle, 1.0)
        img   = cv2.warpAffine(img,  M, (w, h))
        mask  = cv2.warpAffine(mask, M, (w, h), flags=cv2.INTER_NEAREST)

    # Kanal boyutu kontrolü
    if len(mask.shape) == 2:
        mask = np.expand_dims(mask, axis=-1)

    return img, mask