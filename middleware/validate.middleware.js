// ============================================================
// middleware/validate.middleware.js — Input Validation
// ============================================================
const { body, validationResult } = require('express-validator');

// Validation result checker
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors:  errors.array()
    });
  }
  next();
};

// Register validation rules
exports.registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name too long'),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian phone number'),
];

// Login validation rules
exports.loginRules = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Reservation validation rules
exports.reservationRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit phone number required'),
  body('date').isISO8601().withMessage('Valid date required').custom(val => {
    if (new Date(val) < new Date()) throw new Error('Reservation date must be in the future');
    return true;
  }),
  body('time').notEmpty().withMessage('Time is required'),
  body('guests').isInt({ min: 1, max: 50 }).withMessage('Guests must be between 1 and 50'),
];

// Order validation rules
exports.orderRules = [
  body('customerName').trim().notEmpty().withMessage('Customer name is required'),
  body('customerPhone').matches(/^[6-9]\d{9}$/).withMessage('Valid phone number required'),
  body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
  body('items.*.menuItem').notEmpty().withMessage('Menu item ID required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

// Review validation rules
exports.reviewRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').trim().notEmpty().withMessage('Review text is required').isLength({ max: 1000 }),
];

// Contact validation rules
exports.contactRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 }),
];
