import os
import shutil

# Klasör yollarımız
kaynak_klasor = 'dataset/kidney/images_txt_mask'
hedef_images = 'dataset/kidney/images'
hedef_masks = 'dataset/kidney/masks'

print("Veriler ayrıştırılıyor, lütfen bekleyin...")

# SİHİRLİ KISIM: Eğer 'images' veya 'masks' klasörü yoksa, Python bunları otomatik oluşturur!
os.makedirs(hedef_images, exist_ok=True)
os.makedirs(hedef_masks, exist_ok=True)

kopyalanan_resim = 0
kopyalanan_maske = 0

# Kaynak klasördeki dosyaları tek tek inceleyip dağıtıyoruz
for dosya in os.listdir(kaynak_klasor):
    kaynak_yol = os.path.join(kaynak_klasor, dosya)

    # Eğer dosya bir MASKE ise (.png)
    if dosya.endswith('.png'):
        shutil.copy(kaynak_yol, os.path.join(hedef_masks, dosya))
        kopyalanan_maske += 1

    # Eğer dosya ORİJİNAL RESİM ise (.jpg veya .jpeg)
    elif dosya.lower().endswith(('.jpg', '.jpeg')):
        shutil.copy(kaynak_yol, os.path.join(hedef_images, dosya))
        kopyalanan_resim += 1

print("-" * 30)
print("✅ İŞLEM TAMAMLANDI!")
print(f"📁 Orijinal Resim Sayısı: {kopyalanan_resim} -> 'images' klasörüne kopyalandı.")
print(f"📁 Maske Sayısı: {kopyalanan_maske} -> 'masks' klasörüne kopyalandı.")