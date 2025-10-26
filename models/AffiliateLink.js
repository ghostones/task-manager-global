const mongoose = require('mongoose');

const affiliateLinkSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  url: { type: String, required: true },
  img: { type: String, default: '' }, // Optional image thumbnail
  brand: { type: String, default: '', index: true },
  tag: { type: String, default: '', index: true },
  createdAt: { type: Date, default: Date.now }
}, {
  // Add automatic updated timestamp
  timestamps: true
});

// Enable fast search for brand + tag
affiliateLinkSchema.index({ title: 'text', brand: 'text', tag: 'text' });

module.exports = mongoose.model('AffiliateLink', affiliateLinkSchema);
