// routes/analyze.js

const express = require("express");

const router = express.Router();

const upload = require("../middlewares/upload");

const {
  predictAndSave,
  getAnalysisById,
} = require("../controllers/analyzeController");

const {
  protect,
  authorize,
} = require("../middlewares/authMiddleware");

const reportController = require("../controllers/reportController");


// ======================================================
// ANALİZ BAŞLAT
// POST /api/analyze/predict/:model_adi
// ======================================================

router.post(
  "/predict/:model_adi",
  protect,
  authorize("doktor", "superadmin"),
  upload.single("file"),
  predictAndSave
);


// ======================================================
// ANALİZ DETAYINI GETİR
// GET /api/analyze/analyses/:id
// ======================================================

router.get(
  "/analyses/:id",
  protect,
  authorize("doktor", "superadmin"),
  getAnalysisById
);


// ======================================================
// RAPOR OLUŞTUR
// POST /api/analyze/reports/create
// ======================================================

router.post(
  "/reports/create",
  protect,
  reportController.createReport
);


module.exports = router;