require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./config/db'); 

// SADECE ANALYSIS MODELİNİ İÇERİ AKTARIYORUZ
const Analysis = require('./models/Analysis');

const analyzeRoutes = require('./routes/analyze');
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patient');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/reports', require('./routes/report'));

// BÜTÜN VERİTABANINI DEĞİL, SADECE ANALYSIS TABLOSUNU GÜNCELLİYORUZ
Analysis.sync({ alter: true })
    .then(() => {
        console.log("✅ Sadece Analizler tablosu güncellendi ve kısıtlama düzeltildi.");
        
        app.listen(PORT, () => {
            console.log(`🚀 PathоVision Backend ${PORT} portunda çalışıyor.`);
            console.log(`🔗 Python AI Servisi: ${process.env.PYTHON_API_URL}`);
        });
    })
    .catch(err => {
        console.error("❌ Veritabanı güncellenirken hata oluştu:", err);
    });