const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const AffiliateProduct = require('../models/AffiliateProduct'); // Adjust path/model as per your setup

/**
 * @swagger
 * tags:
 *   name: Affiliates
 *   description: Affiliate product management and analytics
 */

/**
 * @swagger
 * /api/affiliates:
 *   get:
 *     summary: Get all affiliate products with filters
 *     tags: [Affiliates]
 *     responses:
 *       200:
 *         description: List of affiliate products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AffiliateProduct'
 */
router.get('/', async (req, res) => {
  const filters = {};
  if (req.query.productName) filters.productName = req.query.productName;
  // Add more filters as needed
  const products = await AffiliateProduct.find(filters).lean();
  res.json(products);
});

/**
 * @swagger
 * /api/affiliates:
 *   post:
 *     summary: Add an affiliate product
 *     tags: [Affiliates]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productName, affiliateUrl, price]
 *             properties:
 *               productName: { type: string }
 *               affiliateUrl: { type: string }
 *               price: { type: number }
 *     responses:
 *       201:
 *         description: Saved affiliate product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AffiliateProduct'
 */
router.post('/', auth, async (req, res) => {
  const { productName, affiliateUrl, price } = req.body;
  if (!productName || !affiliateUrl || typeof price !== 'number') {
    return res.status(400).json({ message: 'Missing productName, affiliateUrl or price' });
  }
  const product = new AffiliateProduct({ productName, affiliateUrl, price });
  await product.save();
  res.status(201).json(product);
});

module.exports = router;
