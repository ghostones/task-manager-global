const mongoose = require('mongoose');

const gemsLogSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  action:    { type: String, required: true, index: true }, // e.g. "login", "purchase", "invite"
  amount:    { type: Number, required: true },
  meta:      { type: mongoose.Schema.Types.Mixed, default: {} }, // Optional details (object: sessionId, etc.)
  date:      { type: Date, default: Date.now }
}, {
  timestamps: true // adds createdAt and updatedAt automatically
});

// Index for fast analytics/filtering by action and user/year/month if needed
gemsLogSchema.index({ userId: 1, action: 1, date: -1 });

module.exports = mongoose.model('GemsLog', gemsLogSchema);
