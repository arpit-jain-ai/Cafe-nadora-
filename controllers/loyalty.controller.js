// ============================================================
// controllers/loyalty.controller.js
// ============================================================
const User = require('../models/user.model');
const Order = require('../models/Order.model');

exports.getMyLoyalty = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('name email loyaltyPoints loyaltyTier totalSpent totalOrders');
    const nextTier = user.loyaltyTier === 'espresso' ? { name: 'Latte Gold', pointsNeeded: 500 - user.loyaltyPoints }
                   : user.loyaltyTier === 'latte_gold' ? { name: 'Black Reserve', pointsNeeded: 1500 - user.loyaltyPoints }
                   : { name: 'Top Tier!', pointsNeeded: 0 };

    res.status(200).json({
      success: true,
      data: { ...user.toObject(), nextTier }
    });
  } catch (error) { next(error); }
};

exports.getAllMembers = async (req, res, next) => {
  try {
    const members = await User.find({ role: 'user' })
      .select('name email phone loyaltyPoints loyaltyTier totalSpent totalOrders createdAt')
      .sort({ loyaltyPoints: -1 });
    res.status(200).json({ success: true, count: members.length, data: members });
  } catch (error) { next(error); }
};

exports.addPoints = async (req, res, next) => {
  try {
    const { userId, points, reason } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { loyaltyPoints: points } },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, message: `${points} points added to ${user.name}`, data: user });
  } catch (error) { next(error); }
};

exports.redeemPoints = async (req, res, next) => {
  try {
    const { points } = req.body;
    const user = await User.findById(req.user.id);
    if (user.loyaltyPoints < points) {
      return res.status(400).json({ success: false, message: 'Insufficient loyalty points' });
    }
    await User.findByIdAndUpdate(req.user.id, { $inc: { loyaltyPoints: -points } });
    res.status(200).json({ success: true, message: `${points} points redeemed (₹${points} discount applied)`, discountAmount: points });
  } catch (error) { next(error); }
};
