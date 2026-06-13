// ============================================================
// models/Event.model.js
// ============================================================
const mongoose = require('mongoose');

const EventBookingSchema = new mongoose.Schema({
  bookingId:   { type: String, unique: true },
  eventType: {
    type: String,
    enum: ['birthday', 'anniversary', 'corporate', 'live_music', 'student', 'coffee_tasting', 'custom'],
    required: true
  },
  name:        { type: String, required: true },
  phone:       { type: String, required: true },
  email:       { type: String },
  date:        { type: Date, required: true },
  time:        { type: String, required: true },
  guests:      { type: Number, required: true, min: 1 },
  package:     { type: String },
  budget:      { type: Number },
  requirements:{ type: String, maxlength: 1000 },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  amount:      { type: Number },
  advancePaid: { type: Number, default: 0 },
  notes:       { type: String },
}, { timestamps: true });

EventBookingSchema.pre('save', async function (next) {
  if (!this.bookingId) {
    const count = await mongoose.model('EventBooking').countDocuments() + 1;
    this.bookingId = `EVT-${Date.now()}-${String(count).padStart(3,'0')}`;
  }
  next();
});

module.exports = mongoose.model('EventBooking', EventBookingSchema);