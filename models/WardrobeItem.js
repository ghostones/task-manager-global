/**
 * @swagger
 * components:
 *   schemas:
 *     WardrobeItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         garmentType:
 *           type: string
 *         color:
 *           type: string
 *         pattern:
 *           type: string
 *         fabric:
 *           type: string
 *         formality:
 *           type: string
 *         season:
 *           type: string
 *         imageUrl:
 *           type: string
 *         status:
 *           type: string
 *           default: active
 *         addedDate:
 *           type: string
 *           format: date-time
 *         userId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const mongoose = require('mongoose');

const wardrobeItemSchema = new mongoose.Schema({
  garmentType: String,
  color: String,
  pattern: String,
  fabric: String,
  formality: String,
  season: String,
  imageUrl: String,
  status: { type: String, default: 'active' },
  addedDate: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

wardrobeItemSchema.index({ userId: 1, addedDate: -1 }); // For fast queries

module.exports = mongoose.model('WardrobeItem', wardrobeItemSchema);
