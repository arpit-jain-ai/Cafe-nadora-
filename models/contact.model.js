// ============================================================
// models/Contact.model.js
// ============================================================
const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  phone:   { type: String },
  email:   { type: String },
  subject: { type: String, required: true },
  message: { type: String, required: true, maxlength: 2000 },
  status:  { type: String, enum: ['new', 'read', 'replied', 'closed'], default: 'new' },
  reply:   { type: String },
  repliedAt: { type: Date },
  source:  { type: String, enum: ['website', 'whatsapp', 'email'], default: 'website' },
}, { timestamps: true });

module.exports = mongoose.model('Contact', ContactSchema);