from pathlib import Path
from PIL import Image
from tqdm import tqdm
import os

PROJE_KLASORU = Path(os.path.dirname(os.path.abspath(__file__))).parent

RESIM_KLASORU = PROJE_KLASORU / 'dataset' / 'brain' / 'images'
MASKE_KLASORU = PROJE_KLASORU / 'dataset' / 'brain' / 'masks'

RESIM_HEDEF   = PROJE_KLASORU / 'dataset' / 'brain' / 'resim_donusturulmus'
MASKE_HEDEF   = PROJE_KLASORU / 'dataset' / 'brain' / 'maske_donusturulmus'

RESIM_HEDEF.mkdir(parents=True, exist_ok=True)
MASKE_HEDEF.mkdir(parents=True, exist_ok=True)

resim_dosyalari = sorted(RESIM_KLASORU.glob('*.tif')) + \
                  sorted(RESIM_KLASORU.glob('*.tiff'))

print(f"Bulunan TIF resim sayısı: {len(resim_dosyalari)}")

if len(resim_dosyalari) == 0:
    print(f" Hiç TIF dosyası bulunamadı! Klasör: {RESIM_KLASORU}")
else:
    print("Resimler JPG'ye dönüştürülüyor...")
    for dosya in tqdm(resim_dosyalari):
        hedef = RESIM_HEDEF / (dosya.stem + '.jpg')
        img = Image.open(dosya).convert('RGB')
        img.save(hedef, 'JPEG', quality=95)
    print(f"{len(resim_dosyalari)} resim JPG'ye dönüştürüldü!")

maske_dosyalari = sorted(MASKE_KLASORU.glob('*.tif')) + \
                  sorted(MASKE_KLASORU.glob('*.tiff'))

print(f"\nBulunan TIF maske sayısı: {len(maske_dosyalari)}")

if len(maske_dosyalari) == 0:
    print(f"Hiç TIF dosyası bulunamadı! Klasör: {MASKE_KLASORU}")
else:
    print("Maskeler PNG'ye dönüştürülüyor...")
    for dosya in tqdm(maske_dosyalari):
        hedef = MASKE_HEDEF / (dosya.stem + '.png')
        mask = Image.open(dosya).convert('L')  # gri tonlamalı
        mask.save(hedef, 'PNG')
    print(f"{len(maske_dosyalari)} maske PNG'ye dönüştürüldü!")
