// routes/analyze.js
const express = require('express');
const router = express.Router();

// Middleware ve Controller'ları dahil ediyoruz
const upload = require('../middlewares/upload');
const { predictAndSave } = require('../controllers/analyzeController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// @route   POST /api/analyze/predict/:model_adi
// @desc    Görsel yükle, yapay zeka analizini başlat ve PostgreSQL'e kaydet
// Not: Şimdilik test edebilmek için hem 'doktor' hem 'superadmin' yetkisi veriyoruz.
router.post(
    '/predict/:model_adi', 
    protect, 
    authorize('doktor', 'superadmin'), 
    upload.single('file'), // Form-data içinde dosyanın key'i 'file' olmalı
    predictAndSave
);

module.exports = router;