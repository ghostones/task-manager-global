// models/WardrobeItem.js
const mongoose = require('mongoose');
const wardrobeItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: String,
  garmentType: String,
  color: String,
  pattern: String,
  fabric: String,
  formality: String,
  season: String,
  status: { type: String, enum: ['active', 'unworn', 'revived'], default: 'active' },
  addedDate: { type: Date, default: Date.now }
});
module.exports = mongoose.model('WardrobeItem', wardrobeItemSchema);
