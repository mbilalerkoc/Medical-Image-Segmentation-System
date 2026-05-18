import os
import numpy as np
from tensorflow.keras.utils import load_img, img_to_array

def bobrek_tasi_veri_analizi(maske_klasoru):
    print("\n" + "="*50)
    print(f" 🔍 VERI SETI TARANIYOR: {maske_klasoru}")
    print("="*50)
    
    if not os.path.exists(maske_klasoru):
        print("\n [❌] Hata: Klasor bulunamadi.")
        print(" Lutfen 'dataset/bobrek_tasi/maskeler' klasorunun var oldugundan emin ol.")
        return

    maskeler = os.listdir(maske_klasoru)
    toplam = len(maskeler)
    tasli_sayisi = 0
    saglikli_sayisi = 0

    print(" [*] Resimler okunuyor, pikseller analiz ediliyor...\n")

    for dosya in maskeler:
        # Sadece resim dosyalarını oku
        if not dosya.lower().endswith(('.png', '.jpg', '.jpeg', '.tif')):
            continue
            
        yol = os.path.join(maske_klasoru, dosya)
        
        # Maskeyi siyah-beyaz oku
        img = img_to_array(load_img(yol, color_mode="grayscale"))
        
        # Eğer maskenin içinde 0'dan büyük (beyaz) bir piksel varsa taş vardır
        if np.max(img) > 0:
            tasli_sayisi += 1
        else:
            saglikli_sayisi += 1  # Tamamen simsiyah maske (Taş yok)

    print(" 📊 VERI SETI RAPORU")
    print("-" * 30)
    print(f" Toplam Goruntu         : {toplam}")
    print(f" Tasli (Pozitif) Vaka   : {tasli_sayisi}")
    print(f" Saglikli (Negatif) Vaka: {saglikli_sayisi}")
    
    if saglikli_sayisi == 0:
        print("\n 🚨 UYARI: Veri setinde hic 'Saglikli' (siyah maskeli) ornek yok!")
        print(" Modelin yalanci alarm vermemesi (False Positive) icin veri setine en az %10-%20 oraninda")
        print(" tas icermeyen bobrek resmi ve onlara karsilik gelen SIMSIYAH maskeler eklemelisiniz.")
    else:
        print("\n ✅ HARIKA: Veri setin dengeli gorunuyor.")

# --- DINAMIK DOSYA YOLU BULMA ---
# Bulunduğumuz dosyanın konumu: demo/veriseti_analiz/veri_kontrol.py
mevcut_dizin = os.path.dirname(os.path.abspath(__file__))

# İki üst klasöre (ana projeye) çık, oradan dataset/bobrek_tasi/maskeler içine gir
proje_ana_dizini = os.path.abspath(os.path.join(mevcut_dizin, "..", ".."))
hedef_klasor = os.path.join(proje_ana_dizini, "dataset", "bobrek_tasi", "maskeler")

# Analizi Başlat
bobrek_tasi_veri_analizi(hedef_klasor)