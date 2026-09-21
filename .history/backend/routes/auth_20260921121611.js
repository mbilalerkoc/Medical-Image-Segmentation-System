const express = require('express');
const { createDoctor } = require('../controllers/userController');
const { login, setPassword } = require('../controllers/authController');

const router = express.Router();

// Ortak giriş (superadmin, doktor, hasta)
router.post('/login', login);

// Hasta şifre belirleme (mail linkinden gelir)
router.post('/set-password', setPassword);

// Superadmin için doktor oluşturma (superadmin yetkisi gerektirir)
/
router.post('/create-doctor', createDoctor);


module.exports = router;