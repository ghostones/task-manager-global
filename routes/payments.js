const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Razorpay = require('razorpay');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const geoip = require('geoip-lite');
const axios = require('axios');
const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

router.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const geo = geoip.lookup(ip);
  req.country = geo ? geo.country : 'US';
  next();
});

router.post('/create-order', auth, async (req, res) => {
  const { amount = 3.99 } = req.body;
  const country = req.country;
  try {
    let order;
    if (country === 'IN') {
      const inrAmount = Math.round(amount * 83 * 100);
      const gstAmount = inrAmount * 1.18;
      order = await rzp.orders.create({
        amount: gstAmount,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: { userId: req.user.id, country }
      });
      order.gateway = 'razorpay';
      order.currency = 'INR';
      order.displayAmount = '₹295 (incl. 18% GST)';
    } else {
      const exchangeRes = await axios.get(`https://api.exchangerate-api.com/v4/latest/USD?access_key=${process.env.EXCHANGE_API_KEY}`);
      const localCurrency = country === 'GB' ? 'gbp' : country === 'FR' ? 'eur' : 'usd';
      const localAmount = amount * (exchangeRes.data.rates[localCurrency.toUpperCase()] || 1);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: localCurrency,
            product_data: { name: 'Task Manager Pro Premium' },
            unit_amount: Math.round(localAmount * 100)
          },
          quantity: 1
        }],
        mode: 'subscription',
        success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/cancel`,
        metadata: { userId: req.user.id, country }
      });
      order = { id: session.id, url: session.url };
      order.gateway = 'stripe';
      order.currency = localCurrency.toUpperCase();
      order.displayAmount = `$${amount}`;
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/verify', auth, async (req, res) => {
  const { razorpay_payment_id, stripe_session_id, country } = req.body;
  try {
    const user = await User.findById(req.user.id);
    user.isPremium = true;
    user.taskCount = 0;
    await user.save();
    res.json({ message: 'Premium activated worldwide!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;