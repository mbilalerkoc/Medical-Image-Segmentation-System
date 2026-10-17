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

const {
  protect,
  authorize,
} = require("../middlewares/authMiddleware");

const profileUpload = require("../middlewares/profileUpload");

/* PROFİL */
router.put(
  "/profile",
  protect,
  authorize("doktor", "superadmin"),
  updateProfile,
);

/* PROFİL FOTOĞRAFI */
router.put(
  "/profile/photo",
  protect,
  authorize("doktor", "superadmin"),
  profileUpload.single("profil_resmi"),
  uploadProfilePhoto,
);

/* PROFİL FOTOĞRAFI SİL */
router.delete(
  "/profile/photo",
  protect,
  authorize("doktor", "superadmin"),
  deleteProfilePhoto,
);

/* ŞİFRE */
router.put(
  "/password",
  protect,
  authorize("doktor", "superadmin"),
  changePassword,
);

module.exports = router;