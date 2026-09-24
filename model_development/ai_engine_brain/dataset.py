import os
import numpy as np
from sklearn.model_selection import train_test_split
import tensorflow as tf

from preprocess import preprocess
from augmentation import augment
from config_colab import BATCH_SIZE, TEST_ORANI, RANDOM_SEED

# ─── COLAB YEREL DİSK YOLLARI (Zipten çıkan yer) ───
# Not: Zipin içindeki klasör yapısına göre burayı ayarlıyoruz. 
# Eğer hata verirse ve zipin içinden ekstra bir 'brain' klasörü çıkıyorsa 
# yolları "/content/dataset_yerel/brain/images" şeklinde güncellemen gerekebilir.
IMG_DIR = "/content/dataset_yerel/brain/images"
MASK_DIR = "/content/dataset_yerel/brain/masks"

def veri_yukle():
    """Belirtilen klasörlerdeki tüm resim ve maskeleri olduğu gibi okur."""
    img_paths_tum = []
    mask_paths_tum = []

    # Klasör kontrolü
    if not os.path.exists(IMG_DIR) or not os.path.exists(MASK_DIR):
        raise FileNotFoundError(f"❌ Hata: {IMG_DIR} veya {MASK_DIR} bulunamadı! Zip içindeki klasör yapısını kontrol et.")

    images_list = sorted([f for f in os.listdir(IMG_DIR) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
    mask_files = set(os.listdir(MASK_DIR))

    for file_name in images_list:
        stem = os.path.splitext(file_name)[0]
        # Maske adını bul (uzantı esnekliği)
        mask_adi = next((m for m in [stem + '.png', stem + '.jpg', stem + '.jpeg'] if m in mask_files), None)

        if mask_adi is not None:
            img_paths_tum.append(os.path.join(IMG_DIR, file_name))
            mask_paths_tum.append(os.path.join(MASK_DIR, mask_adi))

    print(f"\n📐 Toplam yüklenen resim çifti: {len(img_paths_tum)}")
    return np.array(img_paths_tum), np.array(mask_paths_tum)


def train_test_ayir(img_paths, mask_paths):
    """Dosya yollarını doğrudan eğitim ve test olarak böler."""
    X_egitim, X_test, y_egitim, y_test = train_test_split(
        img_paths, mask_paths, test_size=TEST_ORANI, random_state=RANDOM_SEED
    )
    print(f"📊 Eğitim Seti: {len(X_egitim)} resim  |  Test Seti: {len(X_test)} resim")
    return X_egitim, X_test, y_egitim, y_test


class DataGenerator(tf.keras.utils.Sequence):
    """RAM'i korumak için eğitim sırasında batch batch veri üreten jeneratör."""
    def __init__(self, img_paths, mask_paths, batch_size, is_train=True):
        self.img_paths = img_paths
        self.mask_paths = mask_paths
        self.batch_size = batch_size
        self.is_train = is_train

    def __len__(self):
        return int(np.ceil(len(self.img_paths) / float(self.batch_size)))

    def __getitem__(self, idx):
        batch_x_paths = self.img_paths[idx * self.batch_size : (idx + 1) * self.batch_size]
        batch_y_paths = self.mask_paths[idx * self.batch_size : (idx + 1) * self.batch_size]

        X, Y = [], []
        for img_path, mask_path in zip(batch_x_paths, batch_y_paths):
            img, mask = preprocess(img_path, mask_path)

            if img is not None and mask is not None:
                # Sadece eğitim sırasında %50 ihtimalle augmentation uygula
                if self.is_train and np.random.rand() > 0.5:
                    img, mask = augment(img.copy(), mask.copy())

                X.append(img)
                Y.append(mask)

        return np.array(X, dtype=np.float32), np.array(Y, dtype=np.float32)

    def on_epoch_end(self):
        """Her epoch sonunda modelin ezberlememesi için verileri karıştırır."""
        if self.is_train:
            indices = np.arange(len(self.img_paths))
            np.random.shuffle(indices)
            self.img_paths = self.img_paths[indices]
            self.mask_paths = self.mask_paths[indices]