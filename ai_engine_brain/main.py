import os
from dataset import veri_yukle, train_test_ayir, DataGenerator
from config_colab import BATCH_SIZE, EPOCHS, MODEL_KAYIT
from evaluate import sonuclari_degerlendir_ve_kaydet
from model import unet_plus_plus_modeli_kur # U-Net++ geçişi yapıldı

# Eğitim sürecini optimize eden kütüphaneler
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau

print("🚀 U-Net++ ile Eğitim Süreci Başlıyor...\n")

# 1. Adım: Yolları yükle ve ayır (Manuel temizlenen veriden doğrudan okuma)
X_yollar, Y_yollar = veri_yukle()
X_train_yollar, X_test_yollar, y_train_yollar, y_test_yollar = train_test_ayir(X_yollar, Y_yollar)

# 2. Adım: RAM dostu Generator'ler
train_generator = DataGenerator(X_train_yollar, y_train_yollar, BATCH_SIZE, is_train=True)
test_generator = DataGenerator(X_test_yollar, y_test_yollar, BATCH_SIZE, is_train=False)

# 3. Adım: U-Net++ Modelini oluştur
print("\n🧠 U-Net++ Modeli oluşturuluyor ve hibrit loss ile derleniyor...")
model = unet_plus_plus_modeli_kur()

# 4. Adım: Akıllı Eğitim Kontrolleri (Callbacks)
os.makedirs(MODEL_KAYIT, exist_ok=True)
checkpoint_yolu = f'{MODEL_KAYIT}/beyin_v2_unetplusplus_en_iyi.h5'

callbacks = [
    # En iyi Dice skoruna sahip modeli kaydeder
    ModelCheckpoint(
        checkpoint_yolu,
        monitor='val_dice_katsayisi', 
        save_best_only=True, 
        mode='max',
        verbose=1
    ),
    # 10 epoch boyunca iyileşme olmazsa eğitimi durdurur (Overfitting engelleme)
    EarlyStopping(
        monitor='val_dice_katsayisi',
        patience=10,
        mode='max',
        restore_best_weights=True,
        verbose=1
    ),
    # İyileşme yavaşladığında öğrenme oranını düşürür (Hassas öğrenme)
    ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=5,
        min_lr=1e-7,
        verbose=1
    )
]

# 5. Adım: Eğitimi Başlat
print("\n⏳ Eğitim başlıyor. U-Net++ derinliği nedeniyle süreç biraz daha uzun sürebilir...")
history = model.fit(
    train_generator, 
    validation_data=test_generator, 
    epochs=EPOCHS,
    callbacks=callbacks
)

# 6. Adım: Final Modeli Kaydet
kayit_yolu = f'{MODEL_KAYIT}/beyin_v2_tamamlandi.h5'
model.save(kayit_yolu)
print(f"\n💾 v2 Modeli başarıyla kaydedildi: {kayit_yolu}")

# 7. Adım: Değerlendirme
sonuclari_degerlendir_ve_kaydet(model, test_generator, history)