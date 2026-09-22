const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// POST isteğini doğrudan karşılıyoruz
router.post('/create', reportController.createReport);

module.exports = router;