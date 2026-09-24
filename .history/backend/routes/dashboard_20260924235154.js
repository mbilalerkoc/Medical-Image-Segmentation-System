const express = require("express");

const router = express.Router();

const {
  getDashboard,
} = require("../controllers/dashboardController");

const {
  protect,
  authorize,
} = require("../middlewares/authMiddleware");

router.get(
  "/",
  protect,
  authorize("doktor", "superadmin"),
  getDashboard
);

module.exports = router;