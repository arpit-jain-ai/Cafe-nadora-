// ============================================================
// models/Review.model.js
// ============================================================
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name:        { type: String, required: true },
  email:       { type: String },
  rating:      { type: Number, required: true, min: 1, max: 5 },
  title:       { type: String, maxlength: 100 },
  review:      { type: String, required: [true, 'Review text required'], maxlength: 1000 },
  menuItem:    { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
  images:      [{ type: String }],
  isApproved:  { type: Boolean, default: false },
  isVerified:  { type: Boolean, default: false }, // verified purchase
  source:      { type: String, enum: ['website', 'google', 'instagram'], default: 'website' },
  helpfulCount:{ type: Number, default: 0 },
  response: {
    text: String,
    respondedAt: Date,
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }
}, { timestamps: true });

ReviewSchema.index({ isApproved: 1, rating: -1 });

module.exports = mongoose.model('Review', ReviewSchema);