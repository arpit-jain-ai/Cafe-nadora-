const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/review.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth.middleware');

router.post('/',              optionalAuth, ctrl.createReview);
router.get('/',               ctrl.getApprovedReviews);
router.get('/stats',          ctrl.getStats);
router.get('/all',            protect, authorize('admin'), ctrl.getAllReviews);
router.patch('/:id/approve',  protect, authorize('admin'), ctrl.approveReview);
router.delete('/:id',         protect, authorize('admin'), ctrl.rejectReview);

module.exports = router;
