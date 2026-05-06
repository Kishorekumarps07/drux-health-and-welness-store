'use strict';

const { Router } = require('express');
const { manualUpload } = require('../../middleware/upload');
const { protect } = require('../../middleware/auth');

const router = Router();

/**
 * @route   POST /api/v1/upload
 * @desc    Upload an image manually (Returns Cloudinary URL)
 * @access  Private (Admin/Vendor only recommended, but open for authenticated users for now)
 */
router.post('/', protect, manualUpload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'No file uploaded'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        url: req.file.path,
        originalName: req.file.originalname,
        format: req.file.format,
        size: req.file.size
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
