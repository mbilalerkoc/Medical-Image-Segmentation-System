require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const analyzeRoutes = require('./routes/analyze');

const app = express();
const PORT = process.env.PORT || 5000;

const authRoutes = require('./routes/auth');

connectDB();

// Middleware'ler
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotalar
app.use('/api/analyze', analyzeRoutes);

// Sunucuyu Başlat
app.listen(PORT, () => {
    console.log(`🚀 Node.js Karar Destek Sistemi Backend'i ${PORT} portunda çalışıyor.`);
    console.log(`🔗 Python AI Servisi Hedefi: ${process.env.PYTHON_API_URL}`);
});