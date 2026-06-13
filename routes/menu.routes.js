const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/menu.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload  = require('../middleware/upload.middleware');

router.get('/',                   ctrl.getAllMenuItems);
router.get('/featured',           ctrl.getFeaturedItems);
router.get('/category/:category', ctrl.getMenuByCategory);
router.get('/:id',                ctrl.getMenuItem);
router.post('/seed',              protect, authorize('admin'), ctrl.seedMenu);
router.post('/',                  protect, authorize('admin'), upload.single('image'), ctrl.createMenuItem);
router.put('/:id',                protect, authorize('admin'), upload.single('image'), ctrl.updateMenuItem);
router.delete('/:id',             protect, authorize('admin'), ctrl.deleteMenuItem);
router.patch('/:id/toggle',       protect, authorize('admin'), ctrl.toggleAvailability);

module.exports = router;
