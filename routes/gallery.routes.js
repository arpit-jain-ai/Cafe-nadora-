const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/gallery.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload  = require('../middleware/upload.middleware');

router.get('/',       ctrl.getGallery);
router.post('/',      protect, authorize('admin'), upload.single('image'), ctrl.uploadImage);
router.delete('/:id', protect, authorize('admin'), ctrl.deleteImage);

module.exports = router;
