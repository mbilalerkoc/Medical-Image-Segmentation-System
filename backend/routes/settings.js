const express = require("express");

const router = express.Router();

const {
  updateProfile,
  changePassword,
} = require("../controllers/settingsController");

const {
  uploadProfilePhoto,
  deleteProfilePhoto,
} = require("../controllers/profilePhotoController");

const { protect, authorize } = require("../middlewares/authMiddleware");

const profileUpload = require("../middlewares/profileUpload");

router.put(
  "/profile",
  protect,
  authorize("doktor", "hasta", "superadmin"),
  updateProfile,
);

router.put(
  "/profile/photo",
  protect,
  authorize("doktor", "hasta", "superadmin"),
  profileUpload.single("profil_resmi"),
  uploadProfilePhoto,
);

router.delete(
  "/profile/photo",
  protect,
  authorize("doktor", "hasta", "superadmin"),
  deleteProfilePhoto,
);

router.put(
  "/password",
  protect,
  authorize("doktor", "hasta", "superadmin"),
  changePassword,
);

module.exports = router;
