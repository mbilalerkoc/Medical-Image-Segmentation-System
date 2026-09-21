const express = require('express');
const { addPatient, getPatients } = require('../controllers/patientController');
// Token doğrulama middleware'in varsa buraya eklemelisin, yoksa bu satırı kendi projene göre uyarla
// const { protect } = require('../middleware/auth'); 

const router = express.Router();

// protect middleware'i doktorun sisteme giriş yaptığını ve req.user.id'nin dolu olduğunu garanti eder
// Eğer middleware yazmadıysan geçici olarak "protect, " kısmını silip test edebilirsin.
router.post('/add', /* protect, */ addPatient);
router.get('/', /* protect, */ getPatients);

module.exports = router;