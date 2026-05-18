import tensorflow as tf
from tensorflow.keras import layers, models, Input

IMG_SIZE = 256
LEARNING_RATE = 1e-4

# ── 1. METRİKLER (Hocanın İstediği Oynamalar Burada) ──────────────

def dice_katsayisi(y_gercek, y_tahmin):
    y_gercek_duz = tf.reshape(y_gercek, [-1])
    y_tahmin_duz = tf.reshape(y_tahmin, [-1])
    kesisim = tf.reduce_sum(y_gercek_duz * y_tahmin_duz)
    return (2. * kesisim + 1e-5) / (tf.reduce_sum(y_gercek_duz) + tf.reduce_sum(y_tahmin_duz) + 1e-5)

def dice_loss(y_gercek, y_tahmin):
    return 1.0 - dice_katsayisi(y_gercek, y_tahmin)

def agirlikli_birlesik_loss(y_gercek, y_tahmin):
    """
    HOCANIN İSTEDİĞİ YER: Metrik ağırlıklarıyla oynadığımız kısım.
    BCE'ye %30, Dice Loss'a %70 ağırlık vererek modeli tümöre zorluyoruz.
    """
    bce = tf.keras.losses.binary_crossentropy(y_gercek, y_tahmin)
    bce_agirligi = 0.3
    dice_agirligi = 0.7
    
    return (bce_agirligi * bce) + (dice_agirligi * dice_loss(y_gercek, y_tahmin))


# ── 2. YARDIMCI FONKSİYON ─────────────────────────────────────────

def conv_block(x, filters):
    x = layers.Conv2D(filters, (3, 3), padding="same", activation="relu")(x)
    x = layers.BatchNormalization()(x) # U-Net++ için ekstra stabilite
    x = layers.Conv2D(filters, (3, 3), padding="same", activation="relu")(x)
    x = layers.BatchNormalization()(x)
    return x


# ── 3. U-NET++ MİMARİSİ (Nested U-Net) ────────────────────────────

def unet_plus_plus_modeli_kur(giris_boyutu=(IMG_SIZE, IMG_SIZE, 3)):
    girdiler = Input(giris_boyutu)

    # Donanımı çok yormamak için filtre sayılarını optimize ettik
    nb_filter = [32, 64, 128, 256, 512]

    # --- Aşağı İniş (Encoder) ---
    c0_0 = conv_block(girdiler, nb_filter[0])
    p0 = layers.MaxPooling2D((2, 2))(c0_0)

    c1_0 = conv_block(p0, nb_filter[1])
    p1 = layers.MaxPooling2D((2, 2))(c1_0)

    c2_0 = conv_block(p1, nb_filter[2])
    p2 = layers.MaxPooling2D((2, 2))(c2_0)

    c3_0 = conv_block(p2, nb_filter[3])
    p3 = layers.MaxPooling2D((2, 2))(c3_0)

    c4_0 = conv_block(p3, nb_filter[4]) # Bottleneck (En dip nokta)

    # --- U-Net++ Yoğun Atlama Bağlantıları (Dense Skip Connections) ---
    # L1 (Derinlik 1)
    u0_1 = layers.UpSampling2D((2, 2))(c1_0)
    c0_1 = conv_block(layers.concatenate([c0_0, u0_1]), nb_filter[0])

    u1_1 = layers.UpSampling2D((2, 2))(c2_0)
    c1_1 = conv_block(layers.concatenate([c1_0, u1_1]), nb_filter[1])

    u2_1 = layers.UpSampling2D((2, 2))(c3_0)
    c2_1 = conv_block(layers.concatenate([c2_0, u2_1]), nb_filter[2])

    u3_1 = layers.UpSampling2D((2, 2))(c4_0)
    c3_1 = conv_block(layers.concatenate([c3_0, u3_1]), nb_filter[3])

    # L2 (Derinlik 2)
    u0_2 = layers.UpSampling2D((2, 2))(c1_1)
    c0_2 = conv_block(layers.concatenate([c0_0, c0_1, u0_2]), nb_filter[0])

    u1_2 = layers.UpSampling2D((2, 2))(c2_1)
    c1_2 = conv_block(layers.concatenate([c1_0, c1_1, u1_2]), nb_filter[1])

    u2_2 = layers.UpSampling2D((2, 2))(c3_1)
    c2_2 = conv_block(layers.concatenate([c2_0, c2_1, u2_2]), nb_filter[2])

    # L3 (Derinlik 3)
    u0_3 = layers.UpSampling2D((2, 2))(c1_2)
    c0_3 = conv_block(layers.concatenate([c0_0, c0_1, c0_2, u0_3]), nb_filter[0])

    u1_3 = layers.UpSampling2D((2, 2))(c2_2)
    c1_3 = conv_block(layers.concatenate([c1_0, c1_1, c1_2, u1_3]), nb_filter[1])

    # L4 (Derinlik 4 - Final Çıkışı)
    u0_4 = layers.UpSampling2D((2, 2))(c1_3)
    c0_4 = conv_block(layers.concatenate([c0_0, c0_1, c0_2, c0_3, u0_4]), nb_filter[0])

    # Çıkış Katmanı
    cikti = layers.Conv2D(1, (1, 1), activation='sigmoid')(c0_4)

    model = models.Model(inputs=girdiler, outputs=cikti)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=LEARNING_RATE),
        loss=agirlikli_birlesik_loss, # YENİ OYNANMIŞ LOSS FONKSİYONUMUZ
        metrics=['accuracy', dice_katsayisi]
    )
    
    return model