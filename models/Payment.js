/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *         userId:
 *           type: string
 *           description: User this payment is associated with
 *         orderId:
 *           type: string
 *           description: Internal or frontend order ID
 *         razorpayOrderId:
 *           type: string
 *           description: Razorpay order ID
 *         razorpayPaymentId:
 *           type: string
 *           description: Razorpay payment ID
 *         razorpaySignature:
 *           type: string
 *           description: Razorpay payment verification signature
 *         amount:
 *           type: number
 *           description: Payment amount in major units (e.g., INR Rupees)
 *         currency:
 *           type: string
 *           default: INR
 *         status:
 *           type: string
 *           enum: [pending, success, failed, expired, refunded]
 *         meta:
 *           type: object
 *           description: Miscellaneous or gateway data
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  orderId:           { type: String, required: true, index: true },           // Client-side or backend order ref
  razorpayOrderId:   { type: String, index: true },                           // Razorpay's order id
  razorpayPaymentId: { type: String, index: true },                           // Razorpay payment id
  razorpaySignature: { type: String },
  amount:            { type: Number, required: true },
  currency:          { type: String, default: 'INR' },
  status:            { 
    type: String, 
    enum: ['pending', 'success', 'failed', 'expired', 'refunded'], 
    default: 'pending' 
  },
  meta:       { type: mongoose.Schema.Types.Mixed, default: {} }, // Use for any Razorpay/webhook/additional data
  createdAt:  { type: Date, default: Date.now }
}, {
  timestamps: true // Adds updatedAt for payment tracking
});

// Indexes for high-speed dashboard queries on user/payment order
paymentSchema.index({ userId: 1, orderId: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
