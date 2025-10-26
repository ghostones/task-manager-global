const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Razorpay payment management
 */

/**
 * @swagger
 * /api/payments/create-order:
 *   post:
 *     summary: Create a new Razorpay order
 *     tags: [Payments]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount: { type: number }
 *               currency: { type: string, default: INR }
 *               receipt: { type: string }
 *     responses:
 *       200:
 *         description: Razorpay order created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 order:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     amount: { type: number }
 *                     currency: { type: string }
 *                 keyId: { type: string }
 */
router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }
    const options = {
      amount: amount * 100, // paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1
    };
    const order = await razorpay.orders.create(options);
    const payment = new Payment({
      userId: req.user.userId,
      orderId: order.id,
      razorpayOrderId: order.id,
      amount,
      currency,
      status: 'pending'
    });
    await payment.save();
    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency
      },
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error('Payment order creation error:', err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/payments/verify:
 *   post:
 *     summary: Verify Razorpay payment signature
 *     tags: [Payments]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [razorpay_order_id, razorpay_payment_id, razorpay_signature]
 *             properties:
 *               razorpay_order_id: { type: string }
 *               razorpay_payment_id: { type: string }
 *               razorpay_signature: { type: string }
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 payment: { type: object }
 *       400:
 *         description: Invalid signature or payment not found
 */
router.post('/verify', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');
    if (razorpay_signature === expectedSign) {
      const payment = await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id, userId: req.user.userId },
        {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          status: 'success'
        },
        { new: true }
      );
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }
      res.json({
        success: true,
        message: 'Payment verified successfully',
        payment
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/payments/history:
 *   get:
 *     summary: Get user's payment history
 *     tags: [Payments]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: User payment history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 payments:
 *                   type: array
 *                   items: { type: object }
 */
router.get('/history', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
