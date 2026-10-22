const express = require("express");
const router = express.Router();

const reportController = require("../controllers/reportController");
const { protect, authorize } = require("../middlewares/authMiddleware");

router.get("/me", protect, authorize("hasta"), reportController.getMyReports);
router.get(
  "/me/:id",
  protect,
  authorize("hasta"),
  reportController.getMyReportById,
);

module.exports = router;
