const mongoose = require('mongoose');

const affiliateProductSchema = new mongoose.Schema({
  productName:      { type: String, required: true, index: true },
  affiliateUrl:     { type: String, required: true },
  productUrl:       { type: String, default: '' }, // direct destination (optional/future-proof)
  imageUrl:         { type: String, default: '' },
  price:            { type: Number, required: true },
  currency:         { type: String, default: 'INR' },
  category:         { type: String, default: '', index: true },
  description:      { type: String, default: '' }, // for SEO/UX/search
  platform:         { type: String, enum: ['amazon','flipkart','myntra','other'], default: 'other', index: true },
  clicks:           { type: Number, default: 0 },
  conversions:      { type: Number, default: 0 },
  commission:       { type: Number, default: 0 }, // for payout/calc
  userId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status:           { type: String, enum: ['active','inactive','out_of_stock','archived'], default: 'active' },
  createdAt:        { type: Date, default: Date.now }
}, {
  timestamps: true // adds updatedAt as well as createdAt for free
});

affiliateProductSchema.index({
  productName: 'text',
  description: 'text',
  category: 'text',
  platform: 1
});

module.exports = mongoose.model('AffiliateProduct', affiliateProductSchema);
