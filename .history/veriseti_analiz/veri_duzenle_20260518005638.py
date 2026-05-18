import os
import cv2
import numpy as np

def veri_seti_temizle_ve_yeniden_isimlendir(resim_klasoru, maske_klasoru, cikti_resim_klasoru, cikti_maske_klasoru):
    print("\n" + "="*60)
    print(" 🚀 VERI SETI DUZENLEYICI, TEMIZLEYICI VE YENIDEN ISIMLENDIRICI")
    print("="*60)

    # Temiz çıktı klasörlerini oluştur (Yoksa yaratır)
    os.makedirs(cikti_resim_klasoru, exist_ok=True)
    os.makedirs(cikti_maske_klasoru, exist_ok=True)

    # Mevcut tüm resimleri ve maskeleri listele 
    resim_dosyalari = [d for d in os.listdir(resim_klasoru) if d.lower().endswith(('.png', '.jpg', '.jpeg', '.tif'))]
    maske_dosyalari = [d for d in os.listdir(maske_klasoru) if d.lower().endswith(('.png', '.jpg', '.jpeg', '.tif'))]

    # Uzantıları görmezden gelip sadece isimleri eşleştirmek için sözlük (dictionary) kullanalım
    # Örn: 'resim_001.jpg' -> 'resim_001'
    resim_haritasi = {os.path.splitext(d)[0]: d for d in resim_dosyalari}
    maske_haritasi = {os.path.splitext(d)[0]: d for d in maske_dosyalari}

    resim_isimleri_seti = set(resim_haritasi.keys())
    maske_isimleri_seti = set(maske_haritasi.keys())

    # Ortak olanları (hem resmi hem maskesi olanları) bul
    ortak_isimler = sorted(list(resim_isimleri_seti.intersection(maske_isimleri_seti)))
    yetim_resim_sayisi = len(resim_isimleri_seti - maske_isimleri_seti)
    yetim_maske_sayisi = len(maske_isimleri_seti - resim_isimleri_seti)

    print(f" [*] Toplam Bulunan Ham Resim: {len(resim_dosyalari)}")
    print(f" [*] Toplam Bulunan Ham Maske: {len(maske_dosyalari)}")
    print(f" [!] Maskesi Olmayan (Yetim) Resim Sayisi: {yetim_resim_sayisi}")
    print(f" [!] Resmi Olmayan (Yetim) Maske Sayisi: {yetim_maske_sayisi}")
    print(f" [*] Islenecek Ortak Eslenik Veri Sayisi: {len(ortak_isimler)}")
    print("\n [*] Donusturme ve yeniden isimlendirme islemi basliyor...\n")

    basarili_sayac = 0

    # 1'den başlayarak yeniden isimlendir ve formatları dönüştürerek kaydet
    for i, ortak_isim in enumerate(ortak_isimler, start=1):
        eski_resim_adi = resim_haritasi[ortak_isim]
        eski_maske_adi = maske_haritasi[ortak_isim]

        eski_resim_yolu = os.path.join(resim_klasoru, eski_resim_adi)
        eski_maske_yolu = os.path.join(maske_klasoru, eski_maske_adi)

        # Senin istediğin format: 1.jpg ve 1_mask.png
        yeni_resim_adi = f"{i}.jpg"
        yeni_maske_adi = f"{i}_mask.png"

        yeni_resim_yolu = os.path.join(cikti_resim_klasoru, yeni_resim_adi)
        yeni_maske_yolu = os.path.join(cikti_maske_klasoru, yeni_maske_adi)

        try:
            # 1. Resim İşleme (.jpg olarak kaydet)
            resim = cv2.imread(eski_resim_yolu)
            if resim is None: continue
            cv2.imwrite(yeni_resim_yolu, resim, [int(cv2.IMWRITE_JPEG_QUALITY), 100])

            # 2. Maske İşleme (.png olarak kaydet, mutlaka siyah beyaz modda oku)
            maske = cv2.imread(eski_maske_yolu, cv2.IMREAD_GRAYSCALE)
            if maske is None: continue
            cv2.imwrite(yeni_maske_yolu, maske)

            basarili_sayac += 1

        except Exception as e:
            print(f" [❌] Beklenmedik hata ({ortak_isim}): {str(e)}")

    print("-" * 60)
    print(f" [✅] ISLEM TAMAMLANDI!")
    print(f" [📊] Basariyla Islenen ve Eslenen Cift Sayisi: {basarili_sayac}")
    print(f" [📂] Yeni Temiz Resimler: {cikti_resim_klasoru}")
    print(f" [📂] Yeni Temiz Maskeler: {cikti_maske_klasoru}")
    print(" [💡] Not: Orijinal klasorlerinizdeki verilere dokunulmadi. Guvenle kontrol edebilirsiniz.")

# --- DINAMIK DOSYA YOLLARI ---
mevcut_dizin = os.path.dirname(os.path.abspath(__file__))
proje_ana_dizini = os.path.abspath(os.path.join(mevcut_dizin, ".."))

# Senin şu an 1500 veriyi topladıgın mevcut ham klasor yollarin (Kendine göre kontrol et):
ham_resimler_yolu = os.path.join(proje_ana_dizini, "dataset", "bobrek_tasi", "images")
ham_maskeler_yolu = os.path.join(proje_ana_dizini, "dataset", "bobrek_tasi", "masks")

# Islemler bittikten sonra projede açılacak olan Pırıl Pırıl yeni klasörler:
temiz_resimler_yolu = os.path.join(proje_ana_dizini, "dataset", "bobrek_tasi_temiz", "images")
temiz_maskeler_yolu = os.path.join(proje_ana_dizini, "dataset", "bobrek_tasi_temiz", "masks")

# Betigi Çalistir
veri_seti_temizle_ve_yeniden_isimlendir(ham_resimler_yolu, ham_maskeler_yolu, temiz_resimler_yolu, temiz_maskeler_yolu)