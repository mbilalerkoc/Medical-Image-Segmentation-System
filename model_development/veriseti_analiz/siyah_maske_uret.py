# --- veriseti_analiz/siyah_maske_uret.py ---

import os
import numpy as np
import cv2

def saglikli_maske_uret(saglikli_resim_klasoru, cikti_maske_klasoru):
    print("\n" + "="*50)
    print(" 🖤 OTOMATIK SIYAH MASKE URETICI (NEGATIF VERI)")
    print("="*50)

    if not os.path.exists(saglikli_resim_klasoru):
        print(f" [❌] Hata: {saglikli_resim_klasoru} klasoru bulunamadi!")
        print(" Lutfen saglikli resimleri dogru klasore koydugundan emin ol.")
        return

    os.makedirs(cikti_maske_klasoru, exist_ok=True)
    resimler = [d for d in os.listdir(saglikli_resim_klasoru) if d.lower().endswith(('.png', '.jpg', '.jpeg', '.tif'))]
    
    if len(resimler) == 0:
        print(" [!] Klasorde hic resim bulunamadi.")
        return

    print(f" [*] Toplam {len(resimler)} adet saglikli resim tespit edildi.")
    print(" [*] Sifir pikselli (simsiyah) maskeler uretiliyor...\n")

    uretilen_sayi = 0
    for dosya in resimler:
        resim_yolu = os.path.join(saglikli_resim_klasoru, dosya)
        
        # Orijinal resmi oku (boyutunu ogrenmek icin)
        img = cv2.imread(resim_yolu, cv2.IMREAD_GRAYSCALE)
        if img is None:
            continue
        h, w = img.shape
        
        # Tamamen 0 (siyah) matris olustur
        siyah_maske = np.zeros((h, w), dtype=np.uint8)
        
        # Maskeyi kaydet (Orijinal resimle birebir ayni isimde)
        maske_kayit_yolu = os.path.join(cikti_maske_klasoru, dosya)
        cv2.imwrite(maske_kayit_yolu, siyah_maske)
        uretilen_sayi += 1

    print(f" [✅] ISLEM TAMAM! {uretilen_sayi} adet siyah maske basariyla uretildi.")
    print(f" [📂] Kaydedilen Yer: {cikti_maske_klasoru}")

# --- DINAMIK DOSYA YOLLARI ---
mevcut_dizin = os.path.dirname(os.path.abspath(__file__))
proje_ana_dizini = os.path.abspath(os.path.join(mevcut_dizin, ".."))

# Saglikli resimleri koydugun klasor (Istersen ismini degistirebilirsin)
resimlerin_yolu = os.path.join(proje_ana_dizini, "dataset", "normal")
# Siyah maskelerin cikacagi klasor
maskelerin_yolu = os.path.join(proje_ana_dizini, "dataset", "normal_maske")

# Islemi baslat
saglikli_maske_uret(resimlerin_yolu, maskelerin_yolu)