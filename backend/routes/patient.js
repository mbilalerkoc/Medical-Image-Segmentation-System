const express = require("express");

const router = express.Router();

const {
  addPatient,
  getPatients,
  getMyDashboard,
  getMyAnalyses,
  getPatientById,
} = require("../controllers/patientController");

const { protect, authorize } = require("../middlewares/authMiddleware");

router.post("/add", protect, authorize("doktor", "superadmin"), addPatient);

router.get("/", protect, authorize("doktor", "superadmin"), getPatients);

router.get("/me/dashboard", protect, authorize("hasta"), getMyDashboard);

router.get("/me/analyses", protect, authorize("hasta"), getMyAnalyses);

router.get("/:id", protect, authorize("doktor", "superadmin"), getPatientById);

module.exports = router;
