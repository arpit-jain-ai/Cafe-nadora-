// ============================================================
// models/Menu.model.js
// ============================================================
const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema({
  name:        { type: String, required: [true, 'Item name required'], trim: true },
  description: { type: String, required: [true, 'Description required'], maxlength: 300 },
  category: {
    type: String,
    enum: ['coffee', 'italian', 'pizza', 'burger', 'chinese', 'dessert', 'beverages', 'bakery'],
    required: true
  },
  price:       { type: Number, required: true, min: [0, 'Price cannot be negative'] },
  originalPrice: { type: Number },
  image:       { type: String, default: '' },
  emoji:       { type: String, default: '🍽️' },
  calories:    { type: Number },
  ingredients: [{ type: String }],
  allergens:   [{ type: String }],
  isVeg:       { type: Boolean, default: true },
  isVegan:     { type: Boolean, default: false },
  isGlutenFree:{ type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  isFeatured:  { type: Boolean, default: false },
  badge:       { type: String, enum: ['Bestseller', 'New', 'Popular', 'Must Try', 'Signature', 'Spicy', 'Classic', ''], default: '' },
  preparationTime: { type: Number, default: 15 }, // minutes
  rating:      { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0 },
  orderCount:  { type: Number, default: 0 },
  sortOrder:   { type: Number, default: 0 },
}, { timestamps: true });

MenuSchema.index({ category: 1, isAvailable: 1 });
MenuSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Menu', MenuSchema);