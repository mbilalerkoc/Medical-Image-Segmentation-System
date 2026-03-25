import os
import shutil


kaynak_ana_klasor = 'dataset/brain/lgg-mri-segmentation/kaggle_3m'
hedef_images = 'dataset/brain/images'
hedef_masks = 'dataset/brain/masks'

os.makedirs(hedef_images, exist_ok=True)
os.makedirs(hedef_masks, exist_ok=True)

print("Beyin verileri (TIF dosyaları) toplanıyor, lütfen bekleyin...")

kopyalanan_resim = 0
kopyalanan_maske = 0

for root, dirs, files in os.walk(kaynak_ana_klasor):
    for dosya in files:
        if dosya.endswith('.tif'):
            kaynak_yol = os.path.join(root, dosya)

            if '_mask' in dosya:
                shutil.copy(kaynak_yol, os.path.join(hedef_masks, dosya))
                kopyalanan_maske += 1
            else:
                shutil.copy(kaynak_yol, os.path.join(hedef_images, dosya))
                kopyalanan_resim += 1

print("-" * 30)
print("BEYİN VERİ SETİ AYRILDI!")
print(f"Toplam Resim: {kopyalanan_resim}")
print(f"Toplam Maske: {kopyalanan_maske}")