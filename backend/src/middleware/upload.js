'use strict';

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

/**
 * Factory function to create Cloudinary storage for different folders
 * @param {string} folder - The folder name in Cloudinary (e.g., 'products', 'cms', 'avatars')
 */
const createStorage = (folder) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `druxx/${folder}`,
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
    },
  });
};

// Common uploaders
const productUpload = multer({ storage: createStorage('products') });
const cmsUpload = multer({ storage: createStorage('cms') });
const avatarUpload = multer({ storage: createStorage('avatars') });
const manualUpload = multer({ storage: createStorage('manual') });

module.exports = {
  productUpload,
  cmsUpload,
  avatarUpload,
  manualUpload,
};
