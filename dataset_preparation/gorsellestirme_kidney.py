import os
import matplotlib.pyplot as plt
import matplotlib.image as mpimg

img_dir = '../dataset/kidney/images'
mask_dir = '../dataset/kidney/masks'

resimler = sorted([f for f in os.listdir(img_dir) if f.endswith('.jpg')])

print("Veriler ekrana getiriliyor...")

for i in range(10):
    resim_adi = resimler[i]

    maske_adi = resim_adi.replace('.jpg', '_mask.png')

    resim_yolu = os.path.join(img_dir, resim_adi)
    maske_yolu = os.path.join(mask_dir, maske_adi)

    if os.path.exists(maske_yolu):
        plt.figure(figsize=(10, 5))

        plt.subplot(1, 2, 1)
        plt.imshow(mpimg.imread(resim_yolu), cmap='gray')
        plt.title("Orijinal Resim")
        plt.axis('off')

        plt.subplot(1, 2, 2)
        plt.imshow(mpimg.imread(maske_yolu), cmap='gray')
        plt.title("Böbrek Taşı Maskesi")
        plt.axis('off')

        plt.show()
    else:
        print(f"HATA: {maske_adi} bulunamadı!")