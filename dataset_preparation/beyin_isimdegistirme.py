import os

base_path = r'C:\Users\yazilimci20\OneDrive\Masaüstü\projeler\Medical-Image-Segmentation-System\dataset\brain'
img_dir = os.path.join(base_path, 'images')
mask_dir = os.path.join(base_path, 'masks')

resimler = sorted([f for f in os.listdir(img_dir) if f.endswith('.tif')])

count = 0
for eski_isim in resimler:
    eski_maske_ismi = eski_isim.replace('.tif', '_mask.tif')

    eski_img_yol = os.path.join(img_dir, eski_isim)
    eski_maske_yol = os.path.join(mask_dir, eski_maske_ismi)

    if os.path.exists(eski_maske_yol):
        count += 1
        yeni_isim = f"{count}.tif"

        yeni_img_yol = os.path.join(img_dir, yeni_isim)
        yeni_maske_yol = os.path.join(mask_dir, yeni_isim)

        os.rename(eski_img_yol, yeni_img_yol)
        os.rename(eski_maske_yol, yeni_maske_yol)

print("-" * 30)
print(f" {count} adet resim-maske çifti 1'den {count}'e kadar isimlendirildi.")
