const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/setup',              ctrl.setupAdmin);
router.get('/dashboard',           protect, authorize('admin'), ctrl.getDashboard);
router.get('/users',               protect, authorize('admin'), ctrl.getAllUsers);
router.patch('/users/:id/toggle',  protect, authorize('admin'), ctrl.toggleUserStatus);

module.exports = router;
