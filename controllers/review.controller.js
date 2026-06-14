// ============================================================
// controllers/review.controller.js
// ============================================================
const Review = require('../models/Review.model');
const Menu   = require('../models/menu.model');

exports.createReview = async (req, res, next) => {
  try {
    const { name, email, rating, title, review, menuItem } = req.body;
    const newReview = await Review.create({
      name, email, rating, title, review, menuItem,
      user: req.user ? req.user.id : undefined
    });

    // Update menu item rating if provided
    if (menuItem) {
      const item = await Menu.findById(menuItem);
      if (item) {
        const newCount  = item.ratingCount + 1;
        const newRating = ((item.rating * item.ratingCount) + rating) / newCount;
        await Menu.findByIdAndUpdate(menuItem, { rating: Math.round(newRating * 10) / 10, ratingCount: newCount });
      }
    }

    res.status(201).json({ success: true, message: 'Review submitted! It will appear after approval.', data: newReview });
  } catch (error) { next(error); }
};

exports.getApprovedReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const [reviews, total] = await Promise.all([
      Review.find({ isApproved: true }).sort(sort).skip((page-1)*limit).limit(Number(limit)),
      Review.countDocuments({ isApproved: true })
    ]);
    const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;
    res.status(200).json({ success: true, count: reviews.length, total, avgRating, data: reviews });
  } catch (error) { next(error); }
};

exports.getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).populate('user', 'name');
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) { next(error); }
};

exports.approveReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.status(200).json({ success: true, message: 'Review approved', data: review });
  } catch (error) { next(error); }
};

exports.rejectReview = async (req, res, next) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Review removed' });
  } catch (error) { next(error); }
};

exports.getStats = async (req, res, next) => {
  try {
    const all = await Review.find({ isApproved: true });
    const dist = [5,4,3,2,1].map(s => ({ stars: s, count: all.filter(r => r.rating === s).length }));
    const avg  = all.length ? (all.reduce((s,r) => s+r.rating, 0)/all.length).toFixed(1) : 0;
    res.status(200).json({ success: true, data: { average: avg, total: all.length, distribution: dist } });
  } catch (error) { next(error); }
};
