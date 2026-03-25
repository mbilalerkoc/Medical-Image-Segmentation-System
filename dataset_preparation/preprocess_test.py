import os
import cv2
import numpy as np

# Yol Tanımlamaları
base_path = os.path.dirname(os.path.abspath(__file__))
img_dir = '../dataset/brain/images'
mask_dir = '../dataset/brain/masks'


def apply_clahe(img):
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l_enhanced = clahe.apply(l)
    enhanced_img = cv2.merge((l_enhanced, a, b))
    return cv2.cvtColor(enhanced_img, cv2.COLOR_LAB2BGR)


# Resim listesini al
resimler = sorted([f for f in os.listdir(img_dir) if f.endswith('.tif')])

print("--- ETKİLEŞİMLİ ÖN İŞLEME İZLEYİCİ ---")
print("Sıradaki resim için herhangi bir tuşa basın.")
print("Çıkmak için 'q' tuşuna basın.")

for i in range(min(20, len(resimler))):  # İlk 20 resim için
    resim_adi = resimler[i]
    test_img_path = os.path.join(img_dir, resim_adi)
    test_mask_path = os.path.join(mask_dir, resim_adi.replace('.tif', '_mask.tif'))

    # Okuma ve Kontrol
    raw_img = cv2.imread(test_img_path)
    mask = cv2.imread(test_mask_path)

    if raw_img is None or mask is None:
        continue

    # Ön İşlem Uygula
    clahe_img = apply_clahe(raw_img)

    # Görselleri yan yana birleştir (Ham - CLAHE - Maske)
    # Hepsinin boyutunu eşitleyelim (256x256)
    display_raw = cv2.resize(raw_img, (300, 300))
    display_clahe = cv2.resize(clahe_img, (300, 300))
    display_mask = cv2.resize(mask, (300, 300))

    # Üçünü yatayda birleştir
    combined = np.hstack((display_raw, display_clahe, display_mask))

    # Bilgi metni ekle
    cv2.putText(combined, f"Resim: {i + 1}/20 - {resim_adi[:15]}", (10, 25),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

    # Pencereyi Göster
    cv2.imshow('Brain Segmentation Preprocessing (Q to Quit)', combined)

    # Tuş bekleme
    key = cv2.waitKey(0) & 0xFF
    if key == ord('q'):
        break

cv2.destroyAllWindows()
print("İnceleme tamamlandı.")