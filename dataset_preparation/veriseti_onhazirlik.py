import os
import cv2
import numpy as np
from tqdm import tqdm

IMG_SIZE = 256
BASE_PATH = os.path.dirname(os.path.abspath(__file__))

DATASETS = {
    "brain": {
        "img_dir": os.path.join(BASE_PATH, "../dataset/brain/images"),
        "mask_dir": os.path.join(BASE_PATH, "../dataset/brain/masks"),
    }
}

OUTPUT_PATH = os.path.join(BASE_PATH, "../processed_data")
os.makedirs(OUTPUT_PATH, exist_ok=True)

# CLAHE (Kontrast Artırma)
def apply_clahe(img):
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    lab = cv2.merge((l, a, b))
    return cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)

# AUGMENTATION (Veri Artırma)
def augment(img, mask):
    # 1. Yatay Çevirme (%50 ihtimal)
    if np.random.rand() > 0.5:
        img = cv2.flip(img, 1)
        mask = cv2.flip(mask, 1)

    # 2. Dikey Çevirme (%30 ihtimal)
    if np.random.rand() > 0.7:
        img = cv2.flip(img, 0)
        mask = cv2.flip(mask, 0)

    # 3. Hafif Döndürme (Rotation) - %30 ihtimalle +-10 derece
    if np.random.rand() > 0.7:
        angle = np.random.uniform(-10, 10)
        h, w = img.shape[:2]
        M = cv2.getRotationMatrix2D((w // 2, h // 2), angle, 1.0)
        img = cv2.warpAffine(img, M, (w, h))
        mask = cv2.warpAffine(mask, M, (w, h), flags=cv2.INTER_NEAREST)  # Maske bozulmasın diye NEAREST

    # Kanal kontrolü
    if len(mask.shape) == 2:
        mask = np.expand_dims(mask, axis=-1)

    return img, mask

# PREPROCESS (Ön İşleme)
def preprocess(img_path, mask_path):
    img = cv2.imread(img_path)
    mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)

    if img is None or mask is None:
        return None, None

    img = apply_clahe(img)
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    mask = cv2.resize(mask, (IMG_SIZE, IMG_SIZE))

    # Normalizasyon
    img = img.astype(np.float32) / 255.0
    _, mask = cv2.threshold(mask, 127, 255, cv2.THRESH_BINARY)
    mask = mask.astype(np.float32) / 255.0

    # Kanal boyutu kontrolü
    if len(mask.shape) == 2:
        mask = np.expand_dims(mask, axis=-1)

    return img, mask

# DATASET HAZIRLA

def prepare_dataset(dataset_name, config):

    img_dir = config["img_dir"]
    mask_dir = config["mask_dir"]

    if not os.path.exists(img_dir):
        print(f"Hata: {img_dir} yolu bulunamadı!")
        return

    images_list = sorted([f for f in os.listdir(img_dir) if f.endswith('.tif')],
                         key=lambda x: int(os.path.splitext(x)[0]))
    mask_files = os.listdir(mask_dir)

    X_data, Y_data = [], []

    for file_name in tqdm(images_list):
        img_path = os.path.join(img_dir, file_name)

        if file_name not in mask_files:
            continue

        mask_path = os.path.join(mask_dir, file_name)
        img, mask = preprocess(img_path, mask_path)

        if img is not None and mask is not None:
            # Orijinal Veri
            X_data.append(img)
            Y_data.append(mask)

            # Artırılmış Veri (Augmentation)
            aug_img, aug_mask = augment(img.copy(), mask.copy())
            X_data.append(aug_img)
            Y_data.append(aug_mask)

    if len(X_data) == 0:
        print("HATA:geçerli veri bulunamadı!")
        return

    # Homojenlik hatasını önlemek için np.stack kullanıyoruz
    X = np.stack(X_data, axis=0).astype(np.float32)
    Y = np.stack(Y_data, axis=0).astype(np.float32)

    print(f"Bitti! X shape: {X.shape} | Y shape: {Y.shape}")

    np.save(os.path.join(OUTPUT_PATH, f"{dataset_name}_X.npy"), X)
    np.save(os.path.join(OUTPUT_PATH, f"{dataset_name}_Y.npy"), Y)
    print(f"Dosyalar '{OUTPUT_PATH}' klasörüne kaydedildi.")

if __name__ == "__main__":
    for name, cfg in DATASETS.items():
        prepare_dataset(name, cfg)
    print("\n🎉 Tüm işlemler başarıyla tamamlandı!")