const { redisClient } = require('../config/redis');
const logger = require('../config/logger');

const SHIPROCKET_API_BASE = 'https://apiv2.shiprocket.in/v1/external';

class ShiprocketClient {
  constructor() {
    this.email = process.env.SHIPROCKET_EMAIL;
    this.password = process.env.SHIPROCKET_PASSWORD;
  }

  /**
   * Get authenticated JWT token, utilizing Redis caching (expires in 9 days)
   */
  async getAuthToken() {
    if (!this.email || !this.password) {
      throw new Error('Shiprocket credentials are not configured in environment variables.');
    }

    const cacheKey = 'drx:shiprocket:token';

    // 1. Try to get from Redis cache
    try {
      if (redisClient && redisClient.isOpen) {
        const cachedToken = await redisClient.get(cacheKey);
        if (cachedToken) {
          return cachedToken;
        }
      }
    } catch (err) {
      logger.error('Failed to read Shiprocket token from Redis:', err);
    }

    // 2. Fetch fresh token from Shiprocket
    logger.info('Fetching fresh Shiprocket API authentication token...');
    try {
      const response = await fetch(`${SHIPROCKET_API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: this.email,
          password: this.password,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.token) {
        throw new Error(data.message || 'Authentication failed');
      }

      // 3. Cache token in Redis for 9 days (token is valid for 10 days)
      try {
        if (redisClient && redisClient.isOpen) {
          await redisClient.setEx(cacheKey, 9 * 24 * 60 * 60, data.token);
        }
      } catch (err) {
        logger.error('Failed to cache Shiprocket token in Redis:', err);
      }

      return data.token;
    } catch (err) {
      logger.error('Shiprocket Authentication Error:', err);
      throw err;
    }
  }

  /**
   * Helper to make authorized Shiprocket requests with automatic retry on 401 (token expired)
   */
  async request(endpoint, options = {}) {
    let token = await this.getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {}),
    };

    let response = await fetch(`${SHIPROCKET_API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    // If unauthorized, token might have been invalidated early. Clear cache and retry once.
    if (response.status === 401) {
      logger.warn('Shiprocket API returned 401. Clearing cached token and retrying...');
      if (redisClient && redisClient.isOpen) {
        await redisClient.del('drx:shiprocket:token');
      }
      token = await this.getAuthToken();
      headers['Authorization'] = `Bearer ${token}`;
      response = await fetch(`${SHIPROCKET_API_BASE}${endpoint}`, {
        ...options,
        headers,
      });
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Shiprocket request failed with status ${response.status}`);
    }

    return data;
  }

  /**
   * Check serviceability for a delivery pincode
   */
  async checkServiceability(pickupPincode, deliveryPincode, weight, cod = false) {
    const codParam = cod ? 1 : 0;
    const url = `/courier/serviceability?pickup_postcode=${pickupPincode}&delivery_postcode=${deliveryPincode}&weight=${weight}&cod=${codParam}`;
    return this.request(url, { method: 'GET' });
  }

  /**
   * Create a shipment / order in Shiprocket
   */
  async createOrder(orderData) {
    return this.request('/orders/create/adhoc', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  /**
   * Assign AWB (Air Waybill) to a shipment (books courier)
   */
  async assignAwb(shipmentId, courierId = null) {
    const body = { shipment_id: Number(shipmentId) };
    if (courierId) {
      body.courier_id = Number(courierId);
    }
    return this.request('/courier/assign/awb', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * Generate shipping label
   */
  async generateLabel(shipmentId) {
    const res = await this.request('/courier/generate/label', {
      method: 'POST',
      body: JSON.stringify({ shipment_id: [Number(shipmentId)] }),
    });
    return res.label_url || (res.label && res.label.label_url);
  }

  /**
   * Track shipment by AWB
   */
  async trackShipment(awbCode) {
    return this.request(`/courier/track/awb/${awbCode}`, {
      method: 'GET',
    });
  }

  /**
   * Add a new pickup location to Shiprocket
   */
  async addPickupLocation(pickupData) {
    return this.request('/settings/company/addpickup', {
      method: 'POST',
      body: JSON.stringify(pickupData),
    });
  }

  /**
   * Cancel an order in Shiprocket
   */
  async cancelOrder(shiprocketOrderId) {
    return this.request('/orders/cancel', {
      method: 'POST',
      body: JSON.stringify({ ids: [Number(shiprocketOrderId)] }),
    });
  }
}

module.exports = new ShiprocketClient();
