# dataset.py
# Veri yükleme, dengeleme, train/test ayırma

import os
import numpy as np
from tqdm import tqdm
from sklearn.model_selection import train_test_split

from preprocess import preprocess
from augmentation import augment
from config import DATASETS, TEST_ORANI, RANDOM_SEED, TUMORSUZE_KOTA


def prepare_dataset(dataset_name, config):
    """Tek bir veri setini yükler, ön işler ve augment eder."""
    img_dir  = config["img_dir"]
    mask_dir = config["mask_dir"]

    if not os.path.exists(img_dir):
        print(f"❌ Hata: {img_dir} yolu bulunamadı!")
        return None, None

    images_list = sorted([
        f for f in os.listdir(img_dir)
        if f.lower().endswith(('.jpg', '.jpeg', '.png'))
    ])
    mask_files = set(os.listdir(mask_dir))

    X_data, Y_data = [], []

    for file_name in tqdm(images_list, desc=f"{dataset_name} işleniyor"):
        stem     = os.path.splitext(file_name)[0]
        mask_adi = next(
            (m for m in [stem + '.png', stem + '.jpg', stem + '.jpeg']
             if m in mask_files), None
        )
        if mask_adi is None:
            continue

        img_path  = os.path.join(img_dir,  file_name)
        mask_path = os.path.join(mask_dir, mask_adi)
        img, mask = preprocess(img_path, mask_path)

        if img is not None and mask is not None:
            X_data.append(img)
            Y_data.append(mask)
            aug_img, aug_mask = augment(img.copy(), mask.copy())
            X_data.append(aug_img)
            Y_data.append(aug_mask)

    if len(X_data) == 0:
        print("❌ HATA: Geçerli veri bulunamadı!")
        return None, None

    X = np.stack(X_data, axis=0).astype(np.float32)
    Y = np.stack(Y_data, axis=0).astype(np.float32)
    print(f"✅ {dataset_name} → X: {X.shape} | Y: {Y.shape}")
    return X, Y


def veri_yukle():
    """Tüm datasetleri yükler ve birleştirir."""
    X_tum, Y_tum = [], []
    for name, cfg in DATASETS.items():
        X, Y = prepare_dataset(name, cfg)
        if X is not None:
            X_tum.append(X)
            Y_tum.append(Y)

    X_tum = np.concatenate(X_tum, axis=0)
    Y_tum = np.concatenate(Y_tum, axis=0)
    print(f"\n📐 Toplam veri: {X_tum.shape}")
    return X_tum, Y_tum


def dengeli_ayir(X, Y):
    """Tümörlü/tümörsüz dengesini kurar."""
    tumoru_olan    = np.where(Y.max(axis=(1, 2, 3)) > 0)[0]
    tumoru_olmayan = np.where(Y.max(axis=(1, 2, 3)) == 0)[0]

    kota = len(tumoru_olan) // TUMORSUZE_KOTA
    np.random.seed(RANDOM_SEED)
    tumoru_olmayan_secili = np.random.choice(
        tumoru_olmayan, min(kota, len(tumoru_olmayan)), replace=False
    )

    secili = np.concatenate([tumoru_olan, tumoru_olmayan_secili])
    np.random.shuffle(secili)

    print(f"✅ Dengeli veri  : {len(secili)} slice")
    print(f"   └─ Tümörlü   : {len(tumoru_olan)}")
    print(f"   └─ Tümörsüz  : {len(tumoru_olmayan_secili)}")

    return X[secili], Y[secili]


def train_test_ayir(X, Y):
    """Train/test olarak böler."""
    X_egitim, X_test, y_egitim, y_test = train_test_split(
        X, Y, test_size=TEST_ORANI, random_state=RANDOM_SEED
    )
    print(f"\n📊 Eğitim: {len(X_egitim)}  |  Test: {len(X_test)}")
    return X_egitim, X_test, y_egitim, y_test