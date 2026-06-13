// ============================================================
// models/User.model.js
// ============================================================
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String, required: [true, 'Name is required'],
    trim: true, maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String, required: [true, 'Email is required'],
    unique: true, lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  },
  phone: {
    type: String,
    match: [/^[6-9]\d{9}$/, 'Invalid Indian phone number']
  },
  password: {
    type: String, required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String, enum: ['user', 'admin', 'staff'],
    default: 'user'
  },
  loyaltyPoints: { type: Number, default: 0 },
  loyaltyTier:   { type: String, enum: ['espresso', 'latte_gold', 'black_reserve'], default: 'espresso' },
  totalSpent:    { type: Number, default: 0 },
  totalOrders:   { type: Number, default: 0 },
  birthday:      { type: Date },
  isActive:      { type: Boolean, default: true },
  resetPasswordToken:   String,
  resetPasswordExpire:  Date,
  emailVerified:        { type: Boolean, default: false },
  emailVerifyToken:     String,
}, { timestamps: true });

// ── Hash password before save ──
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Update loyalty tier based on points ──
UserSchema.pre('save', function (next) {
  if (this.loyaltyPoints >= 1500)     this.loyaltyTier = 'black_reserve';
  else if (this.loyaltyPoints >= 500) this.loyaltyTier = 'latte_gold';
  else                                this.loyaltyTier = 'espresso';
  next();
});

// ── Sign JWT ──
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// ── Match password ──
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);