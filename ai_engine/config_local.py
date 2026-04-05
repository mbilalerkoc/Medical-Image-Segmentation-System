# config_local.py
# PyCharm'da kullanılır — yerel yollar burada

import os

PROJE_KLASORU = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ── Çıktı Yolları ─────────────────────────────
MODEL_KAYIT  = os.path.join(PROJE_KLASORU, 'ai_engine', 'saved_models')
SONUC_KLASOR = os.path.join(PROJE_KLASORU, 'docs', 'results')

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