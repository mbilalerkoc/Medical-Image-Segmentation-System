import os
import numpy as np
import matplotlib.pyplot as plt
import tkinter as tk
from tkinter import filedialog
from tensorflow.keras.utils import load_img, img_to_array
from ai_engine.utils import tumor_analizi_yap

def disaridan_mr_tahmin_et(model, organ_ad, model_ad):
    print("\n" + "=" * 50)
    print(f"  🏥 CANLI HASTANE SIMULASYONU — {organ_ad} / {model_ad}")
    print("=" * 50)
    
    root = tk.Tk()
    root.withdraw() 
    root.attributes('-topmost', True) 
    
    print("\n  [*] Lutfen acilan pencereden analiz edilecek MR goruntusunu secin...")
    
    # 2. Dosya Seçme Ekranını Aç
    dosya_yolu = filedialog.askopenfilename(
        title="MR Goruntusu Sec",
        filetypes=[
            ("Resim Dosyalari", "*.png;*.jpg;*.jpeg;*.tif;*.tiff"),
            ("Tum Dosyalar", "*.*")
        ]
    )
   
    if not dosya_yolu:
        print("Islem iptal edildi: Herhangi bir resim secilmedi.")
        return

    try:
        print(f"  [*] Secilen Dosya: {dosya_yolu}")
        print("  [*] MR goruntusu sisteme yukleniyor ve isleniyor...")
        
        _, h, w, c = model.input_shape

        renk_modu = "rgb" if c == 3 else "grayscale"
        img = load_img(dosya_yolu, color_mode=renk_modu, target_size=(h, w))
        img_array = img_to_array(img) / 255.0
        
        img_batch = np.expand_dims(img_array, axis=0)
        
        print("  [*] Yapay zeka lezyon aramasi yapiyor...")
        # Tahmin üret
        tahmin = model.predict(img_batch, verbose=0)
        t_maske = tahmin[0] # Sadece ilk (ve tek) sonucu al
        
        # Klinik Analiz (Alan ve Boyut)
        tahmin_analiz = tumor_analizi_yap(t_maske)
        tumor_var_mi = np.max(t_maske) > 0.5
        
        # Terminal Çıktısı
        if tumor_var_mi:
            print(f"\n  [🚨] DIKKAT: Model lezyon tespit etti!")
            print(f"  -> Hesaplanan Alan: {tahmin_analiz['alan']:.1f} mm²")
            print(f"  -> Genislik: {tahmin_analiz['genislik']:.1f} mm | Yukseklik: {tahmin_analiz['yukseklik']:.1f} mm")
        else:
            print("\n  [✅] TEMIZ: Model herhangi bir tumor lezyonu bulamadi.")

        # Görselleştirme
        plt.figure(figsize=(12, 6))
        plt.suptitle(f"Gercek Zamanli Teshis Ekrani — {organ_ad}", fontsize=15, fontweight='bold')
        
        # 1. Ham MR Görüntüsü
        plt.subplot(1, 2, 1)
        plt.imshow(img_array.squeeze(), cmap='gray')
        plt.title("Yuklenen Ham MR Goruntusu")
        plt.axis('off')
        
        # 2. Yapay Zeka Çıktısı (Maske)
        plt.subplot(1, 2, 2)
        plt.imshow(t_maske.squeeze() > 0.5, cmap='gray')
        
        if tumor_var_mi:
            plt.title("Yapay Zeka Teshisi (Cizilen Maske)", color='red', fontweight='bold')
            bilgi = f"Teshis Edilen Alan: {tahmin_analiz['alan']:.1f} mm²\nBoyut: {tahmin_analiz['genislik']:.1f} x {tahmin_analiz['yukseklik']:.1f} mm"
            plt.text(0.5, -0.15, bilgi, size=12, ha="center", va="top", transform=plt.gca().transAxes, 
                     bbox=dict(boxstyle="round,pad=0.4", ec=(0.8, 0.1, 0.1), fc=(1.0, 0.9, 0.9), alpha=0.9))
        else:
            plt.title("Yapay Zeka Teshisi", color='green', fontweight='bold')
            plt.text(0.5, -0.15, "LEZYON BULUNAMADI (TEMIZ)", size=12, color='green', ha="center", va="top", transform=plt.gca().transAxes, fontweight='bold')
            
        plt.tight_layout()
        plt.show()

    except Exception as e:
        print(f"  [❌] Bir hata olustu: Goruntu islenemedi. Detay: {e}")