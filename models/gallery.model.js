// ============================================================
// models/Gallery.model.js
// ============================================================
const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
  title:    { type: String, required: true },
  imageUrl: { type: String, required: true },
  category: { type: String, enum: ['food', 'coffee', 'interior', 'customers', 'events'], required: true },
  caption:  { type: String },
  isActive: { type: Boolean, default: true },
  sortOrder:{ type: Number, default: 0 },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Gallery', GallerySchema);