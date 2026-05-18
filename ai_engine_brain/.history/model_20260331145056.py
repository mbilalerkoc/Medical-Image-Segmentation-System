# model.py
# U-Net mimarisi, metrikler ve kayıp fonksiyonu

import tensorflow as tf
from tensorflow.keras import layers, models, Input
from config import LEARNING_RATE, IMG_SIZE


# ── Metrikler & Kayıp ─────────────────────────

def dice_katsayisi(y_gercek, y_tahmin):
    y_gercek_duz = tf.reshape(y_gercek, [-1])
    y_tahmin_duz = tf.reshape(y_tahmin, [-1])
    kesisim = tf.reduce_sum(y_gercek_duz * y_tahmin_duz)
    return (2. * kesisim + 1.0) / (
        tf.reduce_sum(y_gercek_duz) + tf.reduce_sum(y_tahmin_duz) + 1.0
    )

def dice_loss(y_gercek, y_tahmin):
    return 1.0 - dice_katsayisi(y_gercek, y_tahmin)

def birlesik_loss(y_gercek, y_tahmin):
    """Dice Loss + Binary Crossentropy"""
    bce = tf.keras.losses.binary_crossentropy(y_gercek, y_tahmin)
    return dice_loss(y_gercek, y_tahmin) + bce


# ── U-Net Mimarisi ────────────────────────────

def unet_modeli_kur(giris_boyutu=(IMG_SIZE, IMG_SIZE, 3)):
    girdiler = Input(giris_boyutu)

    # Encoder
    k1 = layers.Conv2D(16, (3, 3), activation='relu', padding='same')(girdiler)
    k1 = layers.Conv2D(16, (3, 3), activation='relu', padding='same')(k1)
    k1 = layers.Dropout(0.1)(k1)
    h1 = layers.MaxPooling2D((2, 2))(k1)

    k2 = layers.Conv2D(32, (3, 3), activation='relu', padding='same')(h1)
    k2 = layers.Conv2D(32, (3, 3), activation='relu', padding='same')(k2)
    k2 = layers.Dropout(0.1)(k2)
    h2 = layers.MaxPooling2D((2, 2))(k2)

    # Bottleneck
    k3 = layers.Conv2D(64, (3, 3), activation='relu', padding='same')(h2)
    k3 = layers.Conv2D(64, (3, 3), activation='relu', padding='same')(k3)

    # Decoder
    u4 = layers.UpSampling2D((2, 2))(k3)
    u4 = layers.Concatenate()([u4, k2])
    k4 = layers.Conv2D(32, (3, 3), activation='relu', padding='same')(u4)
    k4 = layers.Conv2D(32, (3, 3), activation='relu', padding='same')(k4)

    u5 = layers.UpSampling2D((2, 2))(k4)
    u5 = layers.Concatenate()([u5, k1])
    k5 = layers.Conv2D(16, (3, 3), activation='relu', padding='same')(u5)
    k5 = layers.Conv2D(16, (3, 3), activation='relu', padding='same')(k5)

    cikti = layers.Conv2D(1, (1, 1), activation='sigmoid')(k5)

    model = models.Model(inputs=girdiler, outputs=cikti)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=LEARNING_RATE),
        loss=birlesik_loss,
        metrics=['accuracy', dice_katsayisi]
    )
    return model