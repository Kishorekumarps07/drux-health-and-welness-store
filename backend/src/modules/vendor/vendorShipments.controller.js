'use strict';

const vendorShipmentsService = require('./vendorShipments.service');
const asyncHandler = require('../../lib/asyncHandler');

/**
 * @desc    Get paginated shipments belonging to the vendor
 * @route   GET /api/v1/vendor/shipments
 * @access  Private (Vendor)
 */
const listShipments = asyncHandler(async (req, res) => {
  const result = await vendorShipmentsService.getShipments(req.user.id, req.query);
  res.status(200).json({
    status: 'success',
    data: result
  });
});

/**
 * @desc    Get details of a single vendor shipment
 * @route   GET /api/v1/vendor/shipments/:id
 * @access  Private (Vendor)
 */
const getShipmentDetails = asyncHandler(async (req, res) => {
  const shipment = await vendorShipmentsService.getShipmentDetails(req.user.id, req.params.id);
  res.status(200).json({
    status: 'success',
    data: { shipment }
  });
});

/**
 * @desc    Book a shipment on Shiprocket
 * @route   POST /api/v1/vendor/shipments/:id/book
 * @access  Private (Vendor)
 */
const bookShipment = asyncHandler(async (req, res) => {
  const shipment = await vendorShipmentsService.bookShipment(req.user.id, req.params.id, req.body);
  res.status(200).json({
    status: 'success',
    message: 'Shipment successfully booked on Shiprocket.',
    data: { shipment }
  });
});

/**
 * @desc    Get shipping label URL (PDF)
 * @route   GET /api/v1/vendor/shipments/:id/label
 * @access  Private (Vendor)
 */
const getShipmentLabel = asyncHandler(async (req, res) => {
  const labelUrl = await vendorShipmentsService.getShipmentLabel(req.user.id, req.params.id);
  res.status(200).json({
    status: 'success',
    data: { labelUrl }
  });
});

/**
 * @desc    Track shipment events
 * @route   GET /api/v1/vendor/shipments/:id/track
 * @access  Private (Vendor)
 */
const trackShipment = asyncHandler(async (req, res) => {
  const trackingData = await vendorShipmentsService.trackShipment(req.user.id, req.params.id);
  res.status(200).json({
    status: 'success',
    data: { tracking: trackingData }
  });
});

/**
 * @desc    Handover shipment to courier
 * @route   POST /api/v1/vendor/shipments/:id/handover
 * @access  Private (Vendor)
 */
const handoverShipment = asyncHandler(async (req, res) => {
  const shipment = await vendorShipmentsService.handoverShipment(req.user.id, req.params.id);
  res.status(200).json({
    status: 'success',
    message: 'Shipment successfully handed over to courier.',
    data: { shipment }
  });
});

module.exports = {
  listShipments,
  getShipmentDetails,
  bookShipment,
  getShipmentLabel,
  trackShipment,
  handoverShipment
};

