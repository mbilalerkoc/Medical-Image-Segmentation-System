# evaluate.py
import os
import matplotlib.pyplot as plt
import numpy as np
from config_colab import SONUC_KLASOR

def sonuclari_degerlendir_ve_kaydet(model, test_generator, history):
    # Çıktı klasörü yoksa oluştur
    os.makedirs(SONUC_KLASOR, exist_ok=True)
    
    # ─── 1. Eğitim Kayıp (Loss) ve Başarı Grafikleri ───
    plt.figure(figsize=(14, 5))
    
    plt.subplot(1, 2, 1)
    plt.plot(history.history['loss'], label='Eğitim Loss', color='blue')
    plt.plot(history.history['val_loss'], label='Doğrulama Loss', color='red')
    plt.title('Model Kayıp (Loss) Eğrisi')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    
    if 'accuracy' in history.history:
        plt.subplot(1, 2, 2)
        plt.plot(history.history['accuracy'], label='Eğitim Acc', color='blue')
        plt.plot(history.history['val_accuracy'], label='Doğrulama Acc', color='red')
        plt.title('Model Doğruluk (Accuracy) Eğrisi')
        plt.xlabel('Epoch')
        plt.ylabel('Accuracy')
        plt.legend()
        
    plt.tight_layout()
    plt.savefig(f'{SONUC_KLASOR}/egitim_grafikleri.png')
    plt.close()

    # ─── 2. Test Seti Üzerinde Metrik Hesaplama (Batch Batch) ───
    print("\n🔍 Test seti üzerinde nihai metrikler hesaplanıyor (Bu işlem biraz sürebilir)...")
    
    TP = FP = FN = 0
    esik = 0.5
    
    for i in range(len(test_generator)):
        X_batch, y_batch = test_generator[i]
        tahminler = model.predict(X_batch, verbose=0)
        tahmin_binary = (tahminler > esik).astype(np.float32)
        gercek = y_batch.astype(np.float32)

        TP += np.sum(tahmin_binary * gercek)
        FP += np.sum(tahmin_binary * (1 - gercek))
        FN += np.sum((1 - tahmin_binary) * gercek)

    precision = TP / (TP + FP + 1e-7)
    recall    = TP / (TP + FN + 1e-7)
    iou       = TP / (TP + FP + FN + 1e-7)

    test_sonuclari = model.evaluate(test_generator, verbose=0)
    test_loss = test_sonuclari[0]
    test_acc = test_sonuclari[1]
    test_dice = test_sonuclari[2] if len(test_sonuclari) > 2 else 0.0

    sonuc_metni = f"""
╔══════════════════════════════════════════╗
║            TEST SONUÇLARI                ║
╠══════════════════════════════════════════╣
║  Accuracy  : {test_acc:.4f}                     ║
║  Dice Score: {test_dice:.4f}   (hedef: 0.70+)   ║
║  IoU       : {iou:.4f}                     ║
║  Precision : {precision:.4f}                     ║
║  Recall    : {recall:.4f}                     ║
║  Loss      : {test_loss:.4f}                     ║
╚══════════════════════════════════════════╝
    """
    print(sonuc_metni)
    
    with open(f'{SONUC_KLASOR}/test_metrikleri.txt', 'w', encoding='utf-8') as f:
        f.write(sonuc_metni)

    # ─── 3. Örnek Tahminlerin Görselleştirilmesi (Sadece Tümörlüler) ───
    print("\n🎨 Örnek maske tahminleri oluşturuluyor...")
    ornek_X, ornek_Y, ornek_Tahmin = [], [], []
    
    # Tümörlü 5 resim bulana kadar tarama yap
    for i in range(len(test_generator)):
        X_batch, Y_batch = test_generator[i]
        tahminler_batch = model.predict(X_batch, verbose=0)
        
        for j in range(len(Y_batch)):
            if Y_batch[j].max() > 0: # Tümör varsa listeye ekle
                ornek_X.append(X_batch[j])
                ornek_Y.append(Y_batch[j])
                ornek_Tahmin.append(tahminler_batch[j])
                
                if len(ornek_X) == 5:
                    break
        if len(ornek_X) == 5:
            break

    if len(ornek_X) > 0:
        plt.figure(figsize=(15, 9))
        for i in range(len(ornek_X)):
            plt.subplot(3, 5, i + 1)
            plt.imshow(ornek_X[i].squeeze(), cmap='gray')
            plt.title("Orijinal MR")
            plt.axis('off')

            plt.subplot(3, 5, i + 6)
            plt.imshow(ornek_Y[i].squeeze(), cmap='gray')
            plt.title("Gerçek Maske")
            plt.axis('off')

            plt.subplot(3, 5, i + 11)
            plt.imshow(ornek_Tahmin[i].squeeze() > esik, cmap='gray')
            plt.title("Model Tahmini")
            plt.axis('off')

        plt.tight_layout()
        plt.savefig(f'{SONUC_KLASOR}/ornek_tahminler.png', dpi=150)
        plt.close()
        print(f"✅ Harika! Tüm grafikler ve metrikler Drive'daki '{SONUC_KLASOR}' klasörüne kaydedildi.")