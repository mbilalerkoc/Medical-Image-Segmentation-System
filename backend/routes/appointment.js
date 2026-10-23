const express = require("express");

const router = express.Router();

const {
  getAppointments,
  createAppointment,
  updateStatus,
  getAvailability,
  saveAvailability,
  getAvailableSlots,
} = require("../controllers/appointmentController");

const { protect, authorize } = require("../middlewares/authMiddleware");

router.use(protect, authorize("doktor", "superadmin"));

router.get("/availability", getAvailability);

router.get("/availability/slots", getAvailableSlots);

router.put("/availability", saveAvailability);

router.get("/", getAppointments);

router.post("/", createAppointment);

router.patch("/:id/status", updateStatus);

module.exports = router;
