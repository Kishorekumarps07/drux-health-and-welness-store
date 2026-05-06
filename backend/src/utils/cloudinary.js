'use strict';

const cloudinary = require('../config/cloudinary');
const logger = require('../config/logger');

/**
 * Extract Cloudinary public ID from a URL
 * @param {string} url - The Cloudinary image URL
 * @returns {string|null} - The public ID or null
 */
const extractPublicId = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  
  try {
    // Pattern: /upload/(?:v\d+/)?(folder/subfolder/public_id).extension
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.\w+$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    logger.error('Error extracting public ID from URL:', error);
    return null;
  }
};

/**
 * Delete an image from Cloudinary
 * @param {string} url - The URL of the image to delete
 */
const deleteImageByUrl = async (url) => {
  const publicId = extractPublicId(url);
  if (!publicId) return;

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info(`Cloudinary deletion result for ${publicId}:`, result);
    return result;
  } catch (error) {
    logger.error(`Failed to delete image from Cloudinary: ${publicId}`, error);
  }
};

module.exports = {
  extractPublicId,
  deleteImageByUrl
};
