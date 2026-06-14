// ============================================================
// controllers/event.controller.js
// ============================================================
const EventBooking = require('../models/event.model');
const { sendEmail } = require('../config/email.config');

exports.createBooking = async (req, res, next) => {
  try {
    const booking = await EventBooking.create({
      ...req.body,
      user: req.user ? req.user.id : undefined
    });

    if (req.body.email) {
      try {
        await sendEmail({
          to: req.body.email,
          subject: `Event Booking Received — Café Singhai #${booking.bookingId}`,
          html: `<div style="background:#0E0E0E;color:#FFF8E7;padding:2rem;font-family:Arial">
            <h1 style="color:#D4AF37">☕ Café Singhai</h1>
            <h2>Event Booking Received!</h2>
            <p>Dear <strong>${req.body.name}</strong>, your ${req.body.eventType} booking <strong style="color:#D4AF37">#${booking.bookingId}</strong> has been received. We'll confirm within 24 hours.</p>
            <p style="color:#B8A890">📞 +91 90010 07094</p>
          </div>`
        });
      } catch (e) { console.error('Event email failed:', e.message); }
    }

    res.status(201).json({ success: true, message: `Event booking received! ID: ${booking.bookingId}`, data: booking });
  } catch (error) { next(error); }
};

exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, eventType } = req.query;
    const query = {};
    if (status)    query.status    = status;
    if (eventType) query.eventType = eventType;
    const bookings = await EventBooking.find(query).sort({ date: 1 });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) { next(error); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const booking = await EventBooking.findByIdAndUpdate(
      req.params.id, { status: req.body.status, notes: req.body.notes }, { new: true }
    );
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.status(200).json({ success: true, message: 'Booking updated', data: booking });
  } catch (error) { next(error); }
};
