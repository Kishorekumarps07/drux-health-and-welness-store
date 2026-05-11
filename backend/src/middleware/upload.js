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
      resource_type: 'auto', // Support images, videos, and raw files
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'avif', 'gif', 'mp4', 'mov', 'webm'],
    },
  });
};

// Common uploaders
const productUpload = multer({ storage: createStorage('products') });
const cmsUpload = multer({ storage: createStorage('cms') });
const avatarUpload = multer({ storage: createStorage('avatars') });
const vendorUpload = multer({ storage: createStorage('vendors') });
const manualUpload = multer({ storage: createStorage('manual') });

module.exports = {
  productUpload,
  cmsUpload,
  avatarUpload,
  vendorUpload,
  manualUpload,
};
