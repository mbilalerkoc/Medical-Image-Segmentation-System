const express = require('express');
const router = express.Router();

const { addPatient, getPatients } = require('../controllers/patientController');
const { protect, authorize } = require('../middlewares/auth');

router.post('/add', protect, authorize('doktor', 'superadmin'), addPatient);
router.get('/', protect, authorize('doktor', 'superadmin'), getPatients);

module.exports = router;