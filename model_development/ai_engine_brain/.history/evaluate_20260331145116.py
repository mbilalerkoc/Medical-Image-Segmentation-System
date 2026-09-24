# evaluate.py
# Grafikler, tahmin görselleri ve test metrikleri

import numpy as np
import matplotlib.pyplot as plt
from config import SONUC_KLASOR


def grafikleri_goster(gecmis):
    """Eğitim geçmişinden grafik çizer ve kaydeder."""
    fig, axler = plt.subplots(1, 3, figsize=(18, 5))

    axler[0].plot(gecmis.history['accuracy'],         label='Eğitim')
    axler[0].plot(gecmis.history['val_accuracy'],     label='Doğrulama')
    axler[0].set_title('Doğruluk (Accuracy)')
    axler[0].set_xlabel('Epoch'); axler[0].set_ylabel('Doğruluk')
    axler[0].legend()

    axler[1].plot(gecmis.history['loss'],             label='Eğitim')
    axler[1].plot(gecmis.history['val_loss'],         label='Doğrulama')
    axler[1].set_title('Kayıp (Loss)')
    axler[1].set_xlabel('Epoch'); axler[1].set_ylabel('Kayıp')
    axler[1].legend()

    axler[2].plot(gecmis.history['dice_katsayisi'],     label='Eğitim')
    axler[2].plot(gecmis.history['val_dice_katsayisi'], label='Doğrulama')
    axler[2].set_title('Dice Katsayısı')
    axler[2].set_xlabel('Epoch'); axler[2].set_ylabel('Dice')
    axler[2].legend()

    plt.tight_layout()
    plt.savefig(f'{SONUC_KLASOR}/egitim_grafikleri.png', dpi=150)
    plt.show()
    print(f"💾 Grafik kaydedildi → {SONUC_KLASOR}/egitim_grafikleri.png")


def tahminleri_goster(model, X_test, y_test):
    """Test setinden tümörlü örnekler seçip tahminleri gösterir."""
    tumoru_olan_test = np.where(y_test.max(axis=(1, 2, 3)) > 0)[0]
    ornek_idxler     = tumoru_olan_test[:5]
    tahminler        = model.predict(X_test[ornek_idxler], verbose=0)

    plt.figure(figsize=(15, 9))
    for i, idx in enumerate(ornek_idxler):
        plt.subplot(3, 5, i + 1)
        plt.imshow(X_test[idx]); plt.title("Orijinal MR"); plt.axis('off')

        plt.subplot(3, 5, i + 6)
        plt.imshow(y_test[idx].squeeze(), cmap='gray')
        plt.title("Gerçek Maske"); plt.axis('off')

        plt.subplot(3, 5, i + 11)
        plt.imshow(tahminler[i].squeeze(), cmap='gray')
        plt.title("Model Tahmini"); plt.axis('off')

    plt.tight_layout()
    plt.savefig(f'{SONUC_KLASOR}/tahmin_sonuclari.png', dpi=150)
    plt.show()
    print(f"💾 Tahminler kaydedildi → {SONUC_KLASOR}/tahmin_sonuclari.png")


def sonuclari_yazdir(model, X_test, y_test):
    """Test seti üzerinde metrik hesaplar."""
    test_loss, test_acc, test_dice = model.evaluate(X_test, y_test, verbose=0)
    print(f"""
📊 Test Sonuçları:
   Accuracy  : {test_acc:.4f}
   Dice Score: {test_dice:.4f}  (hedef: 0.70+)
   Loss      : {test_loss:.4f}
    """)