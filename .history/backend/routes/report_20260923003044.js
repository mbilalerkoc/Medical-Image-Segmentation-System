const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Token doğrulaması kullanıyorsan auth middleware'ini buraya dahil edebilirsin
// const { protect } = require('../middleware/auth');

// POST isteğini karşılıyoruz
router.post('/create', reportController.createReport);

module.exports = router;