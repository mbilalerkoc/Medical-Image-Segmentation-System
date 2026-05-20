# config_local.py
import os

PROJE_KLASORU = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_KAYIT  = os.path.join(PROJE_KLASORU, 'ai_engine', 'saved_models')
SONUC_KLASOR = os.path.join(PROJE_KLASORU, 'docs', 'results','')
VERI_KLASORU = os.path.join(PROJE_KLASORU, 'processed_data')

IMG_SIZE = 256

BATCH_SIZE    = 16
EPOCHS        = 50
LEARNING_RATE = 1e-4

TEST_ORANI     = 0.2
RANDOM_SEED    = 42
TUMORSUZE_KOTA = 4