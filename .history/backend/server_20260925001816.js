// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const analyzeRoutes = require('./routes/analyze');
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patient');
const dashboardRoutes = require("./routes/dashboard");
const settingsRoutes = require("./routes/settings");

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
app.use("/api/dashboard", dashboardRoutes);

// Sunucuyu Başlat
app.listen(PORT, () => {
    console.log(`🚀 PathоVision Backend ${PORT} portunda çalışıyor.`);
    console.log(`🔗 Python AI Servisi: ${process.env.PYTHON_API_URL}`);
});