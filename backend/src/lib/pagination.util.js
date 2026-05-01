'use strict';

/**
 * Standardizes Prisma pagination and metadata calculation.
 * @param {Object} query - The Express request query object.
 * @param {number} defaultLimit - Default items per page.
 * @returns {Object} { skip, take, metadata }
 */
const getPagination = (query, defaultLimit = 10) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || defaultLimit));
  const skip = (page - 1) * limit;

  return {
    skip,
    take: limit,
    page,
    limit,
  };
};

/**
 * Calculates pagination metadata for the API response.
 * @param {number} totalItems - Total count of records.
 * @param {number} page - Current page number.
 * @param {number} limit - Items per page.
 * @returns {Object} Metadata object.
 */
const getPagingData = (totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);

  return {
    total: totalItems,
    pages: totalPages,
    currentPage: page,
    limit,
  };
};

module.exports = {
  getPagination,
  getPagingData,
};
