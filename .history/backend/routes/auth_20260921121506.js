const express = require('express');
const { login, setPassword } = require('../controllers/authController');

const router = express.Router();

// Ortak giriş (superadmin, doktor, hasta)
router.post('/login', login);

// Hasta şifre belirleme (mail linkinden gelir)
router.post('/set-password', setPassword);

router.post('/create-doctor', createDoctor);


module.exports = router;