const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reservation.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth.middleware');

router.post('/', optionalAuth, ctrl.createReservation);
router.get('/', protect, authorize('admin', 'staff'), ctrl.getAllReservations);
router.get('/today', protect, authorize('admin', 'staff'), ctrl.getTodayReservations);
router.get('/:id', protect, ctrl.getReservation);
router.patch('/:id/status', protect, authorize('admin', 'staff'), ctrl.updateStatus);
router.delete('/:id', protect, ctrl.cancelReservation);

module.exports = router;
