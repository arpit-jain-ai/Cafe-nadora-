// ============================================================
// controllers/order.controller.js
// ============================================================
const Order = require('../models/Order.model');
const Menu  = require('../models/Menu.model');
const User = require('../models/user.model');
const { sendEmail, emailTemplates } = require('../config/email.config');

// @desc   Place new order
// @route  POST /api/orders
// @access Public
exports.placeOrder = async (req, res, next) => {
  try {
    const { customerName, customerPhone, customerEmail, items, orderType, tableNumber, specialInstructions, paymentMethod, loyaltyPointsToUse = 0 } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must have at least one item' });
    }

    // Validate & calculate prices from DB
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const menuItem = await Menu.findById(item.menuItem);
      if (!menuItem) return res.status(400).json({ success: false, message: `Menu item not found: ${item.menuItem}` });
      if (!menuItem.isAvailable) return res.status(400).json({ success: false, message: `${menuItem.name} is currently unavailable` });

      const lineTotal = menuItem.price * item.quantity;
      subtotal += lineTotal;
      validatedItems.push({
        menuItem: menuItem._id,
        name:     menuItem.name,
        price:    menuItem.price,
        quantity: item.quantity,
        customization: item.customization || ''
      });

      // Update order count
      await Menu.findByIdAndUpdate(menuItem._id, { $inc: { orderCount: 1 } });
    }

    const tax      = Math.round(subtotal * 0.05); // 5% GST
    let discount   = 0;

    // Apply loyalty points
    let loyaltyUsed = 0;
    if (req.user && loyaltyPointsToUse > 0) {
      const user = await User.findById(req.user.id);
      const maxDiscount = Math.min(loyaltyPointsToUse, user.loyaltyPoints, subtotal * 0.2);
      loyaltyUsed = Math.floor(maxDiscount);
      discount    = loyaltyUsed; // 1 point = ₹1 discount
    }

    const totalAmount = subtotal + tax - discount;

    const order = await Order.create({
      customerName, customerPhone, customerEmail,
      items: validatedItems,
      orderType, tableNumber, specialInstructions,
      paymentMethod,
      subtotal, tax, discount, totalAmount,
      loyaltyPointsUsed: loyaltyUsed,
      user: req.user ? req.user.id : undefined
    });

    // Update user loyalty points
    if (req.user) {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: {
          loyaltyPoints: order.loyaltyPointsEarned - loyaltyUsed,
          totalSpent:    totalAmount,
          totalOrders:   1
        }
      });
    }

    // Send confirmation email
    if (customerEmail) {
      try {
        await sendEmail({
          to: customerEmail,
          subject: `Order Received #${order.orderId} — Café Nadora`,
          html: emailTemplates.orderReceived({
            customerName, orderId: order.orderId,
            items: validatedItems, totalAmount
          })
        });
      } catch (err) { console.error('Order email failed:', err.message); }
    }

    res.status(201).json({
      success: true,
      message: `Order placed! ID: ${order.orderId}. Estimated time: ${order.estimatedTime} mins`,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get all orders (Admin)
// @route  GET /api/orders
// @access Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (date) {
      const d = new Date(date);
      query.createdAt = { $gte: d, $lt: new Date(d.setDate(d.getDate() + 1)) };
    }

    const [orders, total] = await Promise.all([
      Order.find(query).populate('user', 'name email').sort({ createdAt: -1 }).skip((page-1)*limit).limit(Number(limit)),
      Order.countDocuments(query)
    ]);

    res.status(200).json({ success: true, count: orders.length, total, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc   Get single order
// @route  GET /api/orders/:id
// @access Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc   Update order status (Admin/Staff)
// @route  PATCH /api/orders/:id/status
// @access Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id, { status, notes }, { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.status(200).json({ success: true, message: `Order ${status}`, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc   Get today's order summary
// @route  GET /api/orders/summary/today
// @access Private/Admin
exports.getTodaySummary = async (req, res, next) => {
  try {
    const start = new Date(); start.setHours(0,0,0,0);
    const end   = new Date(); end.setHours(23,59,59,999);

    const orders = await Order.find({ createdAt: { $gte: start, $lte: end } });
    const summary = {
      totalOrders:   orders.length,
      totalRevenue:  orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.totalAmount, 0),
      pendingOrders: orders.filter(o => ['placed','confirmed','preparing'].includes(o.status)).length,
      completedOrders: orders.filter(o => o.status === 'completed').length,
    };

    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};

// @desc   Get my orders
// @route  GET /api/orders/my
// @access Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(20);
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};
