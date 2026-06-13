const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/contact.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/',            ctrl.submitContact);
router.get('/',             protect, authorize('admin'), ctrl.getAllContacts);
router.patch('/:id/status', protect, authorize('admin'), ctrl.updateStatus);

module.exports = router;
