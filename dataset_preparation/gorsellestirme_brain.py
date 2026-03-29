import os
import cv2
import matplotlib.pyplot as plt

# Yollar (Görece yollarını koruyoruz)
img_dir = '../dataset/brain/images'
mask_dir = '../dataset/brain/masks'

# Kontrol: Klasörler yerinde mi?
if not os.path.exists(img_dir) or not os.path.exists(mask_dir):
    print("HATA: '../dataset/brain/' klasör yolları bulunamadı!")
    exit()

# Resim listesini al
resimler = sorted([f for f in os.listdir(img_dir) if f.endswith('.tif')])

print(f"Toplam {len(resimler)} beyin MR görüntüsü bulundu.")

# İlk 10 resmi göster
for i in range(min(10, len(resimler))):
    resim_adi = resimler[i]

    maske_adi = resim_adi

    resim_yolu = os.path.join(img_dir, resim_adi)
    maske_yolu = os.path.join(mask_dir, maske_adi)

    if os.path.exists(maske_yolu):
        # Oku
        img = cv2.imread(resim_yolu)
        mask = cv2.imread(maske_yolu)


        if img is None or mask is None:
            print(f"{resim_adi} veya {maske_adi} okunamadı, bozuk olabilir.")
            continue

        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        plt.figure(figsize=(10, 5))

        plt.subplot(1, 2, 1)
        plt.imshow(img)
        plt.title(f"Brain MR: {resim_adi}")
        plt.axis('off')

        plt.subplot(1, 2, 2)
        plt.imshow(mask, cmap='gray')
        plt.title("Tumor Maskesi")
        plt.axis('off')

        plt.show()
    else:
        print(f"Uyarı: {maske_adi} bulunamadı!")

