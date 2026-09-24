const express = require("express");

const router = express.Router();

const {
  updateProfile,
  changePassword,
} = require("../controllers/settingsController");

const {
  protect,
  authorize,
} = require("../middlewares/authMiddleware");

// =====================================================
// PROFİL GÜNCELLE
// PUT /api/settings/profile
// =====================================================

router.put(
  "/profile",
  protect,
  authorize("doktor", "superadmin"),
  updateProfile
);

// =====================================================
// ŞİFRE DEĞİŞTİR
// PUT /api/settings/password
// =====================================================

router.put(
  "/password",
  protect,
  authorize("doktor", "superadmin"),
  changePassword
);

module.exports = router;