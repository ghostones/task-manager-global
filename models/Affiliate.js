const mongoose = require('mongoose');

const affiliateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productName: { type: String, required: true, index: true },
  productUrl: { type: String, default: '' },
  affiliateUrl: { type: String, default: '' },
  platform: { 
    type: String, 
    enum: ['amazon', 'flipkart', 'myntra', 'other'], 
    default: 'other' 
  },
  price: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  category: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  clicks: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  commission: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'out_of_stock'], 
    default: 'active' 
  },
  createdAt: { type: Date, default: Date.now }
});

// Enable fast multi-field search/indexing if this is a high-read collection
affiliateSchema.index({ productName: 'text', category: 'text', platform: 1 });

module.exports = mongoose.model('Affiliate', affiliateSchema);
