// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    adSoyad: {
        type: String,
        required: [true, 'Lütfen ad ve soyad girin.']
    },
    email: {
        type: String,
        required: [true, 'Lütfen bir e-posta adresi girin.'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Lütfen geçerli bir e-posta adresi girin.'
        ]
    },
    sifre: {
        type: String,
        required: [true, 'Lütfen bir şifre belirleyin.'],
        minlength: 6,
        select: false // API yanıtlarında şifrenin yanlışlıkla dönmesini engeller
    },
    unvan: {
        type: String,
        enum: ['Radyolog', 'Cerrah', 'Asistan', 'Sistem Yöneticisi'],
        default: 'Radyolog'
    }
}, { timestamps: true });

// Kayıt olmadan hemen önce şifreyi otomatik Hash'le (Mongoose Middleware)
userSchema.pre('save', async function (next) {
    if (!this.isModified('sifre')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.sifre = await bcrypt.hash(this.sifre, salt);
});

// Giriş yaparken girilen şifre ile veritabanındaki hash'i karşılaştırma fonksiyonu
userSchema.methods.sifreEslesiyorMu = async function (girilenSifre) {
    return await bcrypt.compare(girilenSifre, this.sifre);
};

module.exports = mongoose.model('User', userSchema);