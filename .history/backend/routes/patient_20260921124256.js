const express = require('express');
co
const { addPatient, getPatients } = require('../controllers/patientController');

// Kendi yazdığın middleware'i doğru yoldan içe aktarıyoruz
const { protect, authorize } = require('../middleware/auth'); // Yolun middleware dosyana gittiğinden emin ol

const router = express.Router();

// protect: Giriş yapmış mı?
// authorize: Rolü doktor veya superadmin mi?
router.post('/add', protect, authorize('doktor', 'superadmin'), addPatient);
router.get('/', protect, authorize('doktor', 'superadmin'), getPatients);

module.exports = router;