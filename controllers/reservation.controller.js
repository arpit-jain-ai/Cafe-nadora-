// ============================================================
// controllers/reservation.controller.js
// ============================================================
const Reservation = require('../models/Reservation.model');
const { sendEmail, emailTemplates } = require('../config/email.config');

// @desc   Create reservation
// @route  POST /api/reservations
// @access Public
exports.createReservation = async (req, res, next) => {
  try {
    const { name, phone, email, date, time, guests, occasion, specialRequest } = req.body;

    // Check for conflicts (same date/time with confirmed bookings)
    const conflictCount = await Reservation.countDocuments({
      date: new Date(date),
      time,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (conflictCount >= 5) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is fully booked. Please choose another time.'
      });
    }

    const reservation = await Reservation.create({
      name, phone, email, date, time,
      guests, occasion, specialRequest,
      user: req.user ? req.user.id : undefined
    });

    // Send confirmation email if email provided
    if (email) {
      try {
        await sendEmail({
          to: email,
          subject: `Reservation Confirmed — Café Nadora #${reservation.bookingId}`,
          html: emailTemplates.reservationConfirmed({
            name, date: new Date(date).toLocaleDateString('en-IN'),
            time, guests, occasion
          })
        });
      } catch (emailErr) {
        console.error('Email send failed:', emailErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: `Reservation confirmed! Booking ID: ${reservation.bookingId}`,
      data: reservation
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get all reservations (Admin)
// @route  GET /api/reservations
// @access Private/Admin
exports.getAllReservations = async (req, res, next) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (date)   query.date = { $gte: new Date(date), $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)) };

    const skip = (page - 1) * limit;
    const [reservations, total] = await Promise.all([
      Reservation.find(query).sort({ date: 1, time: 1 }).skip(skip).limit(Number(limit)),
      Reservation.countDocuments(query)
    ]);

    res.status(200).json({ success: true, count: reservations.length, total, data: reservations });
  } catch (error) {
    next(error);
  }
};

// @desc   Get single reservation
// @route  GET /api/reservations/:id
// @access Private
exports.getReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });
    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

// @desc   Update reservation status (Admin)
// @route  PATCH /api/reservations/:id/status
// @access Private/Admin
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, notes, tableNumber } = req.body;
    const update = { status, notes };
    if (status === 'confirmed') update.confirmedAt = new Date();
    if (status === 'cancelled') update.cancelledAt = new Date();
    if (tableNumber) update.tableNumber = tableNumber;

    const reservation = await Reservation.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });

    res.status(200).json({ success: true, message: `Reservation ${status}`, data: reservation });
  } catch (error) {
    next(error);
  }
};

// @desc   Cancel reservation
// @route  DELETE /api/reservations/:id
// @access Private
exports.cancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', cancelledAt: new Date(), cancelReason: req.body.reason },
      { new: true }
    );
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });
    res.status(200).json({ success: true, message: 'Reservation cancelled', data: reservation });
  } catch (error) {
    next(error);
  }
};

// @desc   Get today's reservations
// @route  GET /api/reservations/today
// @access Private/Admin
exports.getTodayReservations = async (req, res, next) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end   = new Date(); end.setHours(23, 59, 59, 999);
    const reservations = await Reservation.find({
      date: { $gte: start, $lte: end },
      status: { $in: ['pending', 'confirmed'] }
    }).sort({ time: 1 });
    res.status(200).json({ success: true, count: reservations.length, data: reservations });
  } catch (error) {
    next(error);
  }
};
