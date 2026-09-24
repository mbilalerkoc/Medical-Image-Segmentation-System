// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
// DİKKAT: sequelize importunu ekledik
const { connectDB, sequelize } = require('./config/db'); 
const analyzeRoutes = require('./routes/analyze');
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patient');

const app = express();
const PORT = process.env.PORT || 5000;

// Veritabanına bağlan
connectDB();

// Middleware'ler
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik dosyalar
app.use('/uploads', express.static('uploads'));

// Rotalar
app.use('/api/auth', authRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/reports', require('./routes/report'));

// DİKKAT: Senkronizasyon kodunu buraya ekledik
sequelize.sync({ alter: true })
    .then(() => {
        console.log("✅ Veritabanı başarıyla güncellendi ve kısıtlamalar düzeltildi.");
        // Sunucuyu Başlat
        app.listen(PORT, () => {
            console.log(`🚀 PathоVision Backend ${PORT} portunda çalışıyor.`);
            console.log(`🔗 Python AI Servisi: ${process.env.PYTHON_API_URL}`);
        });
    })
    .catch(err => {
        console.error("❌ Veritabanı güncellenirken hata oluştu:", err);
    });