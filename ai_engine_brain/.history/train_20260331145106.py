# train.py
# Eğitim döngüsü ve callbacks

import tensorflow as tf
from config import MODEL_KAYIT, BATCH_SIZE, EPOCHS


def callbacks_olustur():
    return [
        tf.keras.callbacks.ModelCheckpoint(
            f'{MODEL_KAYIT}/en_iyi_model.h5',
            monitor='val_dice_katsayisi',
            mode='max',
            save_best_only=True,
            verbose=1
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=1e-6,
            verbose=1
        ),
        tf.keras.callbacks.EarlyStopping(
            monitor='val_dice_katsayisi',
            mode='max',
            patience=10,
            restore_best_weights=True,
            verbose=1
        )
    ]


def egit(model, X_egitim, y_egitim):
    """Modeli eğitir ve eğitim geçmişini döndürür."""
    print("\n🚀 Eğitim başlıyor...\n")
    gecmis = model.fit(
        X_egitim, y_egitim,
        validation_split=0.1,
        batch_size=BATCH_SIZE,
        epochs=EPOCHS,
        callbacks=callbacks_olustur(),
        verbose=1
    )
    model.save(f'{MODEL_KAYIT}/beyin_tumoru_son_model.h5')
    print(f"✅ Model kaydedildi → {MODEL_KAYIT}")
    return gecmis