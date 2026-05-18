# config.py
# Tüm ayarlar burada — değişiklik yapmak istersen sadece bu dosyaya bak

DRIVE_KLASOR = '/content/drive/MyDrive/bitirme_projesi'

# ── Veri Yolları ──────────────────────────────
DATASETS = {
    "brain": {
        "img_dir":  f'{DRIVE_KLASOR}/dataset/brain/resim_donusturulmus',
        "mask_dir": f'{DRIVE_KLASOR}/dataset/brain/maske_donusturulmus',
    }
    # Yeni veri seti eklemek için buraya satır ekle:
    # "yeni": {
    #     "img_dir":  f'{DRIVE_KLASOR}/dataset/yeni/resim_donusturulmus',
    #     "mask_dir": f'{DRIVE_KLASOR}/dataset/yeni/maske_donusturulmus',
    # }
}

# ── Çıktı Yolları ─────────────────────────────
MODEL_KAYIT  = f'{DRIVE_KLASOR}/ai_engine/saved_models'
SONUC_KLASOR = f'{DRIVE_KLASOR}/docs/results'

# ── Görüntü Ayarları ──────────────────────────
IMG_SIZE = 256

# ── Eğitim Ayarları ───────────────────────────
BATCH_SIZE   = 16
EPOCHS       = 50
LEARNING_RATE = 1e-4
TEST_ORANI   = 0.2
RANDOM_SEED  = 42

# ── Denge Ayarı ───────────────────────────────
# Tümörsüz slice'lardan tümörlünün kaçta biri alınsın
TUMORSUZE_KOTA = 4  # 1/4'ü