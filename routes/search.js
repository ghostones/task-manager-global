const express = require('express');
const auth = require('../middleware/auth');
const WardrobeItem = require('../models/WardrobeItem');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Advanced search and analytics for wardrobe items
 */

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search wardrobe items with filters
 *     tags: [Search]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - name: color
 *         in: query
 *         schema: { type: string }
 *         required: false
 *         description: Filter by color
 *       - name: season
 *         in: query
 *         schema: { type: string }
 *         required: false
 *         description: Filter by season
 *       - name: garmentType
 *         in: query
 *         schema: { type: string }
 *         required: false
 *         description: Filter by garment type
 *       - name: formality
 *         in: query
 *         schema: { type: string }
 *         required: false
 *         description: Filter by formality level
 *     responses:
 *       200:
 *         description: Filtered wardrobe items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/WardrobeItem'
 *                 count: { type: number }
 */
router.get('/', auth, async (req, res) => {
  try {
    const { color, season, garmentType, formality } = req.query;
    const filter = { userId: req.user.userId };
    
    // Add filters if provided
    if (color) filter.color = new RegExp(color, 'i');
    if (season) filter.season = new RegExp(season, 'i');
    if (garmentType) filter.garmentType = new RegExp(garmentType, 'i');
    if (formality) filter.formality = new RegExp(formality, 'i');
    
    const items = await WardrobeItem.find(filter).lean();
    
    res.json({
      items,
      count: items.length,
      filters: { color, season, garmentType, formality }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/search/analytics:
 *   get:
 *     summary: Get wardrobe analytics and statistics
 *     tags: [Search]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: Wardrobe statistics and analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItems: { type: number }
 *                 byColor:
 *                   type: object
 *                   additionalProperties: { type: number }
 *                 bySeason:
 *                   type: object
 *                   additionalProperties: { type: number }
 *                 byGarmentType:
 *                   type: object
 *                   additionalProperties: { type: number }
 *                 byFormality:
 *                   type: object
 *                   additionalProperties: { type: number }
 */
router.get('/analytics', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get all items for this user
    const items = await WardrobeItem.find({ userId }).lean();
    
    // Calculate analytics
    const analytics = {
      totalItems: items.length,
      byColor: {},
      bySeason: {},
      byGarmentType: {},
      byFormality: {}
    };
    
    items.forEach(item => {
      // Count by color
      if (item.color) {
        analytics.byColor[item.color] = (analytics.byColor[item.color] || 0) + 1;
      }
      
      // Count by season
      if (item.season) {
        analytics.bySeason[item.season] = (analytics.bySeason[item.season] || 0) + 1;
      }
      
      // Count by garment type
      if (item.garmentType) {
        analytics.byGarmentType[item.garmentType] = (analytics.byGarmentType[item.garmentType] || 0) + 1;
      }
      
      // Count by formality
      if (item.formality) {
        analytics.byFormality[item.formality] = (analytics.byFormality[item.formality] || 0) + 1;
      }
    });
    
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
