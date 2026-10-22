const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload");

const {
  predictAndSave,
  getAnalysisById,
} = require("../controllers/analyzeController");

const { protect, authorize } = require("../middlewares/authMiddleware");

const reportController = require("../controllers/reportController");

router.post(
  "/predict/:model_adi",
  protect,
  authorize("doktor", "superadmin"),
  upload.single("file"),
  predictAndSave,
);

router.get(
  "/analyses/:id",
  protect,
  authorize("doktor", "superadmin"),
  getAnalysisById,
);

router.post(
  "/reports/create",
  protect,
  authorize("doktor", "superadmin"),
  reportController.createReport,
);

module.exports = router;
