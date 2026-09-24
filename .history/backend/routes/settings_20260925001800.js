const express = require("express");

const router = express.Router();

const {
  updateProfile,
} = require("../controllers/settingsController");

const {
  protect,
  authorize,
} = require("../middlewares/authMiddleware");

router.put(
  "/profile",
  protect,
  authorize("doktor", "superadmin"),
  updateProfile
);

module.exports = router;