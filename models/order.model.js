// ============================================================
// models/Order.model.js
// ============================================================
const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  menuItem:  { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
  name:      { type: String, required: true },
  price:     { type: Number, required: true },
  quantity:  { type: Number, required: true, min: 1 },
  customization: { type: String },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderId:  { type: String, unique: true },
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName:  { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String },
  items:    { type: [OrderItemSchema], required: true },
  orderType: {
    type: String,
    enum: ['dine_in', 'takeaway', 'whatsapp'],
    default: 'dine_in'
  },
  tableNumber: { type: Number },
  subtotal:    { type: Number, required: true },
  tax:         { type: Number, default: 0 },
  discount:    { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'],
    default: 'placed'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'card', 'online'],
    default: 'cash'
  },
  specialInstructions: { type: String },
  estimatedTime: { type: Number, default: 20 }, // minutes
  loyaltyPointsEarned:  { type: Number, default: 0 },
  loyaltyPointsUsed:    { type: Number, default: 0 },
  notes: { type: String },
}, { timestamps: true });

// Auto-generate orderId
OrderSchema.pre('save', async function (next) {
  if (!this.orderId) {
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
    const count = await mongoose.model('Order').countDocuments() + 1;
    this.orderId = `ORD-${dateStr}-${String(count).padStart(4,'0')}`;
  }
  next();
});

// Calculate loyalty points (1 point per ₹10 spent)
OrderSchema.pre('save', function (next) {
  if (this.isNew) {
    this.loyaltyPointsEarned = Math.floor(this.totalAmount / 10);
  }
  next();
});

OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ customerPhone: 1 });

module.exports = mongoose.model('Order', OrderSchema);