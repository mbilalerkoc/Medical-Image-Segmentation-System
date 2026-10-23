const express = require("express");

const router = express.Router();

const {
  getAppointments,
  getMyAppointments,
  createAppointment,
  updateStatus,
  getAvailability,
  saveAvailability,
  getAvailableSlots,
} = require("../controllers/appointmentController");

const { protect, authorize } = require("../middlewares/authMiddleware");

router.use(protect);

router.get("/me", authorize("hasta"), getMyAppointments);

router.get("/availability", authorize("doktor", "superadmin"), getAvailability);

router.get(
  "/availability/slots",
  authorize("doktor", "superadmin"),
  getAvailableSlots,
);

router.put(
  "/availability",
  authorize("doktor", "superadmin"),
  saveAvailability,
);

router.get("/", authorize("doktor", "superadmin"), getAppointments);

router.post("/", authorize("doktor", "superadmin"), createAppointment);

router.patch("/:id/status", authorize("doktor", "superadmin"), updateStatus);

module.exports = router;
