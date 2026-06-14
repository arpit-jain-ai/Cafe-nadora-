// ============================================================
// models/Reservation.model.js
// ============================================================
const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true },
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name:      { type: String, required: [true, 'Name is required'], trim: true },
  phone:     { type: String, required: [true, 'Phone is required'] },
  email:     { type: String },
  date:      { type: Date, required: [true, 'Date is required'] },
  time:      { type: String, required: [true, 'Time is required'] },
  guests:    { type: Number, required: true, min: 1, max: 50 },
  occasion: {
    type: String,
    enum: [
  "Birthday Celebration",
  "Anniversary",
  "Date Night",
  "Business Meeting",
  "Family Dinner",
  "Other"
] ,
    default: 'none'
  },
  specialRequest: { type: String, maxlength: 500 },
  tableNumber:    { type: Number },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'pending'
  },
  source:    { type: String, enum: ['website', 'whatsapp', 'phone', 'walkin'], default: 'website' },
  notes:     { type: String },
  confirmedAt: { type: Date },
  cancelledAt: { type: Date },
  cancelReason:{ type: String },
}, { timestamps: true });

// Auto-generate bookingId
ReservationSchema.pre('save', async function (next) {
  if (!this.bookingId) {
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
    const count = await mongoose.model('Reservation').countDocuments() + 1;
    this.bookingId = `NRV-${dateStr}-${String(count).padStart(4,'0')}`;
  }
  next();
});

ReservationSchema.index({ date: 1, status: 1 });
ReservationSchema.index({ phone: 1 });

module.exports = mongoose.model('Reservation', ReservationSchema);