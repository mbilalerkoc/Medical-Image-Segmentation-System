// models/Analysis.js
const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
    doktorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Hangi doktor analiz etti
        required: true
    },
    hastaTc: {
        type: String,
        required: true
    },
    hastaAdSoyad: {
        type: String,
        required: true
    },
    modelAdi: {
        type: String, // Örn: bobrek_unet_plus
        required: true
    },
    metrikler: {
        toplam_piksel: Number,
        patoloji_piksel: Number,
        saglikli_piksel: Number,
        patoloji_yuzdesi: Number,
        max_olasilik: Number,
        ort_olasilik: Number
    },
    maske_base64: {
        type: String, // Yapay zekadan dönen PNG formatındaki maske
        required: true
    }
}, { timestamps: true }); // Oluşturulma tarihini (createdAt) otomatik tutar

module.exports = mongoose.model('Analysis', analysisSchema);