# config_colab.py
# Colab'da kullanılır — Drive yolları burada

DRIVE_KLASOR = '/content/drive/MyDrive/bitirme_projesi'

# Eğitim hızını artırmak için verileri Colab'in kendi diskinden okuyoruz
# ── Veri Yolları ──────────────────────────────
DATASETS = {
    "brain": {
        "img_dir":  '/content/dataset_yerel/brain/images', 
        
        # Maskelerin klasör adını sol taraftan açıp kontrol et, muhtemelen 'masks' veya benzeri bir şeydir.
        # Eğer 'masks' ise aşağıdaki gibi yapmalısın:
        "mask_dir": '/content/dataset_yerel/brain/masks', 
    }
}

# ── Çıktı Yolları ─────────────────────────────
# Bunların Drive'da kalması ÇOK DOĞRU. Colab çökse bile eğitilen model Drive'a kaydolur.
MODEL_KAYIT  = f'{DRIVE_KLASOR}/ai_engine/saved_models'
SONUC_KLASOR = f'{DRIVE_KLASOR}/docs/results'

# ── Görüntü Ayarları ──────────────────────────
IMG_SIZE = 256

# ── Eğitim Ayarları ───────────────────────────
BATCH_SIZE    = 16
EPOCHS        = 50
LEARNING_RATE = 1e-4
TEST_ORANI    = 0.2
RANDOM_SEED   = 42

# ── Denge Ayarı ───────────────────────────────
TUMORSUZE_KOTA = 4