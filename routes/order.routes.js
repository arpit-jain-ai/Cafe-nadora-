const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/order.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth.middleware');

router.post('/',              optionalAuth, ctrl.placeOrder);
router.get('/',               protect, authorize('admin','staff'), ctrl.getAllOrders);
router.get('/summary/today',  protect, authorize('admin','staff'), ctrl.getTodaySummary);
router.get('/my',             protect, ctrl.getMyOrders);
router.get('/:id',            protect, ctrl.getOrder);
router.patch('/:id/status',   protect, authorize('admin','staff'), ctrl.updateOrderStatus);

module.exports = router;
