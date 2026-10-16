const express = require("express");

const router = express.Router();

const {
  getAppointments,
  createAppointment,
  updateStatus,
  getAvailability,
  saveAvailability,
} = require("../controllers/appointmentController");

const {
  protect,
  authorize,
} = require("../middlewares/authMiddleware");

router.use(
  protect,
  authorize("doktor", "superadmin")
);

// GET /api/appointments/availability
router.get(
  "/availability",
  getAvailability
);

// PUT /api/appointments/availability
router.put(
  "/availability",
  saveAvailability
);

// GET /api/appointments
//
// Filtre örnekleri:
// ?filter=today
// ?filter=upcoming
// ?filter=past
// ?filter=cancelled
// ?filter=all

router.get(
  "/",
  getAppointments
);

// POST /api/appointments
router.post(
  "/",
  createAppointment
);

// PATCH /api/appointments/15/status

router.patch(
  "/:id/status",
  updateStatus
);

module.exports = router;