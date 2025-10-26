/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         dueDate:
 *           type: string
 *           format: date-time
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *           default: medium
 *         completed:
 *           type: boolean
 *           default: false
 *         userId:
 *           type: string
 *         language:
 *           type: string
 *           default: en
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  dueDate:     { type: Date, required: true },
  priority:    { type: String, enum: ['low','medium','high'], default: 'medium' },
  completed:   { type: Boolean, default: false },
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  language:    { type: String, default: 'en' }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
