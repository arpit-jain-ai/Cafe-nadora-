// ============================================================
// controllers/gallery.controller.js
// ============================================================
const Gallery = require('../models/gallery.model');
const path    = require('path');
const fs      = require('fs');

exports.getGallery = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    const items = await Gallery.find(query).sort({ sortOrder: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) { next(error); }
};

exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload an image file' });
    const { title, category, caption } = req.body;
    const item = await Gallery.create({
      title, category, caption,
      imageUrl: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id
    });
    res.status(201).json({ success: true, message: 'Image uploaded', data: item });
  } catch (error) { next(error); }
};

exports.deleteImage = async (req, res, next) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Image not found' });

    // Delete file from disk
    const filePath = path.join(__dirname, '..', item.imageUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await Gallery.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Image deleted' });
  } catch (error) { next(error); }
};
