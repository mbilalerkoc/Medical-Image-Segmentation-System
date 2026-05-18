# main.py
# Sadece bu dosyayı çalıştır — her şeyi sırayla yapar

from google.colab import drive
drive.mount('/content/drive')

import os
from config import MODEL_KAYIT, SONUC_KLASOR
from dataset import veri_yukle, dengeli_ayir, train_test_ayir
from model import unet_modeli_kur
from train import egit
from evaluate import grafikleri_goster, tahminleri_goster, sonuclari_yazdir

# Klasörleri oluştur
os.makedirs(MODEL_KAYIT,  exist_ok=True)
os.makedirs(SONUC_KLASOR, exist_ok=True)

# ── 1. Veri ───────────────────────────────────
X, Y                         = veri_yukle()
X_dengeli, Y_dengeli         = dengeli_ayir(X, Y)
X_egitim, X_test, y_egitim, y_test = train_test_ayir(X_dengeli, Y_dengeli)

# ── 2. Model ──────────────────────────────────
model = unet_modeli_kur()
model.summary()

# ── 3. Eğitim ─────────────────────────────────
gecmis = egit(model, X_egitim, y_egitim)

# ── 4. Değerlendirme ──────────────────────────
grafikleri_goster(gecmis)
tahminleri_goster(model, X_test, y_test)
sonuclari_yazdir(model, X_test, y_test)