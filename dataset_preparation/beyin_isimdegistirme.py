import os

# Klasör yollarını senin yapına göre ayarla
base_path = r'C:\Users\yazilimci20\OneDrive\Masaüstü\projeler\Medical-Image-Segmentation-System\dataset\brain'
img_dir = os.path.join(base_path, 'images')
mask_dir = os.path.join(base_path, 'masks')

print("🚀 Tüm veri seti numaralandırılarak senkronize ediliyor...")

# Klasördeki tüm resimleri al (maske olmayanları baz alıyoruz)
resimler = sorted([f for f in os.listdir(img_dir) if f.endswith('.tif')])

count = 0
for eski_isim in resimler:
    # Maske ismini tahmin et (TCGA_..._1.tif -> TCGA_..._1_mask.tif)
    eski_maske_ismi = eski_isim.replace('.tif', '_mask.tif')

    # Dosya yolları
    eski_img_yol = os.path.join(img_dir, eski_isim)
    eski_maske_yol = os.path.join(mask_dir, eski_maske_ismi)

    # Eğer her iki dosya da mevcutsa isimlendir
    if os.path.exists(eski_maske_yol):
        count += 1
        yeni_isim = f"{count}.tif"

        # Yeni yollar
        yeni_img_yol = os.path.join(img_dir, yeni_isim)
        yeni_maske_yol = os.path.join(mask_dir, yeni_isim)

        # Yeniden isimlendirme (Rename)
        os.rename(eski_img_yol, yeni_img_yol)
        os.rename(eski_maske_yol, yeni_maske_yol)

print("-" * 30)
print(f"✅ İŞLEM TAMAM! {count} adet resim-maske çifti 1'den {count}'e kadar isimlendirildi.")
print(f"Örnek: images/{count}.tif <--> masks/{count}.tif")