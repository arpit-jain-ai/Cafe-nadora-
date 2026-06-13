const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/event.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth.middleware');

router.post('/',            optionalAuth, ctrl.createBooking);
router.get('/',             protect, authorize('admin','staff'), ctrl.getAllBookings);
router.patch('/:id/status', protect, authorize('admin','staff'), ctrl.updateStatus);

module.exports = router;
