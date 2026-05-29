'use strict';

const crypto = require('crypto');
const razorpay = require('../../lib/razorpay');
const { razorpay: razorpayConfig } = require('../../config/env');
const prisma = require('../../lib/prisma');
const AppError = require('../../lib/AppError');
const cartService = require('../cart/cart.service');
const ordersService = require('../orders/orders.service');
const logger = require('../../config/logger');

class PaymentsService {
  /**
   * 1. Create a Razorpay Order (Intent) based on server-calculated cart totals.
   */
  async createPaymentIntent(userId, { couponCode } = {}) {
    const totals = await cartService.calculateTotals(userId);
    if (totals.total <= 0) throw new AppError('Cannot create payment for an empty cart.', 400);

    let discount = 0;
    if (couponCode) {
      try {
        const couponsService = require('../coupons/coupons.service');
        const coupon = await couponsService.validateCoupon(couponCode);
        let applicableSubtotal = totals.subtotal;
        if (coupon.productId) {
          applicableSubtotal = totals.items
            .filter(i => i.productId === coupon.productId)
            .reduce((acc, i) => acc + parseFloat(i.price) * i.quantity, 0);
        } else if (coupon.vendorId) {
          applicableSubtotal = totals.items
            .filter(i => i.vendorId === coupon.vendorId)
            .reduce((acc, i) => acc + parseFloat(i.price) * i.quantity, 0);
        }
        discount = Math.round((applicableSubtotal * coupon.discountPercent) / 100);
      } catch (err) {
        throw new AppError('Invalid or expired coupon code.', 400);
      }
    }

    const finalTotal = Math.max(0, totals.subtotal - discount + totals.shippingCharge);

    const options = {
      amount: Math.round(finalTotal * 100), // paise
      currency: 'INR',
      receipt: `receipt_user_${userId.substring(0, 8)}_${Date.now()}`,
    };

    try {
      const razorpayOrder = await razorpay.orders.create(options);
      
      // Create initial payment record (Intent)
      await prisma.payment.create({
        data: {
          userId,
          razorpayOrderId: razorpayOrder.id,
          amount: finalTotal,
          status: 'CREATED',
        },
      });

      logger.info(`[PaymentsService] Intent created: ${razorpayOrder.id} for user ${userId}`);
      return razorpayOrder;
    } catch (error) {
      logger.error('[PaymentsService] Razorpay Intent Creation failed:', error);
      throw new AppError('Failed to initialize payment gateway.', 500);
    }
  }

  /**
   * 2. Verify signature and perform atomic Order Creation.
   */
  async verifyAndFinalizeOrder(userId, { razorpayOrderId, razorpayPaymentId, razorpaySignature, addressId, notes, couponCode }) {
    // 1. Signature Check
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', razorpayConfig.keySecret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      await prisma.payment.updateMany({
        where: { razorpayOrderId },
        data: { status: 'FAILED' }
      });
      throw new AppError('Payment verification failed. Invalid signature.', 400);
    }

    // 2. Mark as Verified in DB first
    await prisma.payment.updateMany({
      where: { razorpayOrderId },
      data: { 
        status: 'VERIFIED',
        razorpayPaymentId,
        razorpaySignature
      }
    });

    try {
      // 3. ATOMIC TRANSACTION: Create Order from Cart
      const finalOrder = await prisma.$transaction(async (tx) => {
        // Idempotency: Check if this payment already has an order
        const existingOrder = await tx.order.findFirst({
          where: { payment: { razorpayPaymentId } }
        });
        if (existingOrder) return existingOrder;

        // Get fresh cart totals
        const totals = await cartService.calculateTotals(userId);
        if (totals.items.length === 0) throw new AppError('Cart is empty during finalization.', 400);

        let discount = 0;
        let coupon = null;
        if (couponCode) {
          try {
            const couponsService = require('../coupons/coupons.service');
            coupon = await couponsService.validateCoupon(couponCode);
            let applicableSubtotal = totals.subtotal;
            if (coupon.productId) {
              applicableSubtotal = totals.items
                .filter(i => i.productId === coupon.productId)
                .reduce((acc, i) => acc + parseFloat(i.price) * i.quantity, 0);
            } else if (coupon.vendorId) {
              applicableSubtotal = totals.items
                .filter(i => i.vendorId === coupon.vendorId)
                .reduce((acc, i) => acc + parseFloat(i.price) * i.quantity, 0);
            }
            discount = Math.round((applicableSubtotal * coupon.discountPercent) / 100);
          } catch (err) {
            throw new AppError('Invalid or expired coupon code.', 400);
          }
        }

        const finalTotal = Math.max(0, totals.subtotal - discount + totals.shippingCharge);

        // Reconciliation: Amount must match what was intended
        const paymentRecord = await tx.payment.findUnique({ where: { razorpayOrderId } });
        if (Math.abs(parseFloat(paymentRecord.amount) - finalTotal) > 0.01) {
          throw new AppError('Transaction amount mismatch. Please contact support.', 400);
        }

        // Add discount details into totals passed to createOrderFromVerifiedCart
        const orderTotals = {
          ...totals,
          discount,
          total: finalTotal
        };

        // Create the platform order
        const order = await ordersService.createOrderFromVerifiedCart(userId, tx, {
          addressId,
          totals: orderTotals,
          notes
        });

        // Link payment to order
        await tx.payment.update({
          where: { id: paymentRecord.id },
          data: { 
            orderId: order.id,
            status: 'ORDER_CREATED' 
          }
        });

        // Increment coupon usage count if one was applied
        if (coupon) {
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { usageCount: { increment: 1 } }
          });
        }

        // Clear cart
        await tx.cartItem.deleteMany({ where: { cartId: totals.id } });

        return order;
      }, {
        timeout: 10000 // 10s for transaction safety
      });

      logger.info(`[PaymentsService] Order finalized: ${finalOrder.id} for payment ${razorpayPaymentId}`);
      return finalOrder;

    } catch (error) {
      logger.error('[PaymentsService] Order Creation failed after payment verification:', error);
      
      // Mark as ORDER_FAILED for manual recovery
      await prisma.payment.updateMany({
        where: { razorpayOrderId },
        data: { status: 'ORDER_FAILED' }
      });

      throw error instanceof AppError ? error : new AppError('Payment received but order creation failed. Our team is investigating.', 500);
    }
  }

  /**
   * 3. Handle Razorpay Webhooks idempotently.
   */
  async processWebhook(event, eventId, payload) {
    logger.info(`[PaymentsService] Processing webhook event: ${event} (ID: ${eventId})`);

    // 1. Idempotency Check
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId }
    });

    if (existingEvent) {
      logger.info(`[PaymentsService] Webhook event ${eventId} already processed. Skipping.`);
      return; // Already processed
    }

    // 2. Register EVENT to lock duplications
    // We do this immediately to prevent race conditions if same webhook fires rapidly
    try {
      await prisma.webhookEvent.create({
        data: {
          eventId,
          event,
          status: 'PROCESSING'
        }
      });
    } catch (e) {
      if (e.code === 'P2002') {
         logger.info(`[PaymentsService] Webhook event ${eventId} hit unique constraint. Skipping.`);
         return;
      }
      throw e;
    }

    try {
      // 3. Process the Event
      const paymentEntity = payload.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;

      if (event === 'payment.captured' && orderId) {
        logger.info(`[PaymentsService] Webhook captured payment: ${paymentId} for Intent: ${orderId}`);
        
        // Find if payment intent exists
        const paymentRecord = await prisma.payment.findUnique({ where: { razorpayOrderId: orderId } });
        
        if (paymentRecord && paymentRecord.status === 'CREATED') {
          // Client closed window or didn't verify yet -> mark as VERIFIED here
          await prisma.payment.update({
             where: { id: paymentRecord.id },
             data: { status: 'VERIFIED', razorpayPaymentId: paymentId }
          });
          logger.info(`[PaymentsService] Webhook safely marked payment ${paymentId} as VERIFIED. Order creation left to background sync or manual intervention.`);
          // Note: In a full system, you would enqueue a worker to synthesize the order if the client failed.
          // Since we lack the User's cart context in the webhook (unless we store it with intent), we just mark it paid.
        } else if (paymentRecord && ['VERIFIED', 'ORDER_CREATED'].includes(paymentRecord.status)) {
           logger.info(`[PaymentsService] Webhook matched already finalized payment. No action needed.`);
        }
      }

      if (event === 'payment.failed' && orderId) {
        logger.warn(`[PaymentsService] Webhook logged failed payment for Intent: ${orderId}`);
        await prisma.payment.updateMany({
           where: { razorpayOrderId: orderId },
           data: { status: 'FAILED', razorpayPaymentId: paymentId }
        });
      }

      // 4. Mark EVENT as SUCCESS
      await prisma.webhookEvent.update({
        where: { eventId },
        data: { status: 'PROCESSED', paymentId, orderId }
      });

    } catch (error) {
       logger.error(`[PaymentsService] Webhook processing failed for ${eventId}`, error);
       await prisma.webhookEvent.update({
         where: { eventId },
         data: { status: 'FAILED' }
       });
       throw error;
    }
  }
}

module.exports = new PaymentsService();
