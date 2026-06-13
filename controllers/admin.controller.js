// ============================================================
// controllers/admin.controller.js — Dashboard & Analytics
// ============================================================
const User        = require('../models/User.model');
const Order       = require('../models/Order.model');
const Reservation = require('../models/Reservation.model');
const Review      = require('../models/Review.model');
const Menu        = require('../models/Menu.model');
const Contact     = require('../models/Contact.model');
const EventBooking= require('../models/Event.model');

// @desc   Full dashboard stats
// @route  GET /api/admin/dashboard
// @access Private/Admin
exports.getDashboard = async (req, res, next) => {
  try {
    const today  = new Date(); today.setHours(0,0,0,0);
    const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalUsers, newUsersToday,
      todayOrders, monthOrders,
      todayRevenue, monthRevenue,
      todayReservations, pendingReservations,
      pendingReviews, totalMenuItems,
      newContacts, pendingEvents
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', createdAt: { $gte: today } }),
      Order.countDocuments({ createdAt: { $gte: today, $lte: todayEnd } }),
      Order.countDocuments({ createdAt: { $gte: thisMonthStart } }),
      Order.aggregate([{ $match: { createdAt: { $gte: today }, paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: thisMonthStart }, paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Reservation.countDocuments({ date: { $gte: today, $lte: todayEnd } }),
      Reservation.countDocuments({ status: 'pending' }),
      Review.countDocuments({ isApproved: false }),
      Menu.countDocuments({ isAvailable: true }),
      Contact.countDocuments({ status: 'new' }),
      EventBooking.countDocuments({ status: 'pending' })
    ]);

    // Top selling items this month
    const topItems = await Order.aggregate([
      { $match: { createdAt: { $gte: thisMonthStart } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.name', totalQty: { $sum: '$items.quantity' }, totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { totalQty: -1 } },
      { $limit: 5 }
    ]);

    // Revenue last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
      const dEnd = new Date(d); dEnd.setHours(23,59,59,999);
      const rev = await Order.aggregate([
        { $match: { createdAt: { $gte: d, $lte: dEnd }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);
      last7Days.push({
        date:    d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
        revenue: rev[0]?.total || 0
      });
    }

    res.status(200).json({
      success: true,
      data: {
        users:        { total: totalUsers, newToday: newUsersToday },
        orders:       { today: todayOrders, thisMonth: monthOrders },
        revenue:      { today: todayRevenue[0]?.total || 0, thisMonth: monthRevenue[0]?.total || 0 },
        reservations: { today: todayReservations, pending: pendingReservations },
        reviews:      { pendingApproval: pendingReviews },
        menu:         { activeItems: totalMenuItems },
        contacts:     { unread: newContacts },
        events:       { pending: pendingEvents },
        topItems,
        revenueChart: last7Days
      }
    });
  } catch (error) { next(error); }
};

// @desc   Get all users
// @route  GET /api/admin/users
// @access Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { role: 'user' };
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip((page-1)*limit).limit(Number(limit)),
      User.countDocuments(query)
    ]);
    res.status(200).json({ success: true, count: users.length, total, data: users });
  } catch (error) { next(error); }
};

// @desc   Toggle user active status
// @route  PATCH /api/admin/users/:id/toggle
// @access Private/Admin
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.status(200).json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, data: user });
  } catch (error) { next(error); }
};

// @desc   Create admin user (first-time setup)
// @route  POST /api/admin/setup
// @access Public (one-time)
exports.setupAdmin = async (req, res, next) => {
  try {
    const existing = await User.findOne({ role: 'admin' });
    if (existing) return res.status(400).json({ success: false, message: 'Admin already exists' });

    const admin = await User.create({
      name:     'Cafe Nadora Admin',
      email:    process.env.ADMIN_EMAIL    || 'admin@cafenadora.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@2025',
      role:     'admin',
      phone:    '9001007094'
    });

    const token = admin.getSignedJwtToken();
    res.status(201).json({ success: true, message: 'Admin account created!', token });
  } catch (error) { next(error); }
};
