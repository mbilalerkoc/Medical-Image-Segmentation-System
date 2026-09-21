const express = require('express');
const { login, setPassword, createDoctor } = require('../controllers/authController');

const router = express.Router();

// Sisteme Giriş
router.post('/login', login);

// Hasta Şifre Belirleme
router.post('/set-password', setPassword);

// Postman ile kullanılacak admin/doktor kayıt rotası
router.post('/create-doctor', createDoctor); 

module.exports = router;