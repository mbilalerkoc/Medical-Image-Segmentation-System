import os
import cv2
import matplotlib.pyplot as plt

img_dir = '../dataset/brain/images'
mask_dir = '../dataset/brain/masks'


resimler = sorted([f for f in os.listdir(img_dir) if f.endswith('.tif')])

print(f"Toplam {len(resimler)} beyin MR görüntüsü bulundu. Görselleştiriliyor...")

for i in range(10):
    resim_adi = resimler[i]
    maske_adi = resim_adi.replace('.tif', '_mask.tif')

    resim_yolu = os.path.join(img_dir, resim_adi)
    maske_yolu = os.path.join(mask_dir, maske_adi)

    if os.path.exists(maske_yolu):
        img = cv2.imread(resim_yolu)
        mask = cv2.imread(maske_yolu)

        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        plt.figure(figsize=(10, 5))

        plt.subplot(1, 2, 1)
        plt.imshow(img)
        plt.title(f"Brain MR: {resim_adi[:15]}...")
        plt.axis('off')

        plt.subplot(1, 2, 2)
        plt.imshow(mask, cmap='gray')
        plt.title("Tumor Maskesi")
        plt.axis('off')

        plt.show()
    else:
        print(f"Uyarı: {maske_adi} bulunamadı!")