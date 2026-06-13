const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/loyalty.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/me',          protect, ctrl.getMyLoyalty);
router.get('/members',     protect, authorize('admin'), ctrl.getAllMembers);
router.post('/add-points', protect, authorize('admin'), ctrl.addPoints);
router.post('/redeem',     protect, ctrl.redeemPoints);

module.exports = router;
