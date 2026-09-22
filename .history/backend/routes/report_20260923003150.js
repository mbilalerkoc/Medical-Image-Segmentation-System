const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');


const { protect } = require('../middleware/auth');

router.post('/create', protect, reportController.createReport); 


module.exports = router;