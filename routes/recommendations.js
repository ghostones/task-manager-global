const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Recommendations
 *   description: AI-powered outfit and style suggestions
 */

/**
 * @swagger
 * /api/recommendations/generate:
 *   get:
 *     summary: Get an AI-recommended outfit based on filters
 *     tags: [Recommendations]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - name: season
 *         in: query
 *         schema: { type: string }
 *         required: false
 *         description: Filter by season (e.g. "summer", "winter")
 *       - name: formality
 *         in: query
 *         schema: { type: string }
 *         required: false
 *         description: Filter by formality (e.g. "casual", "formal")
 *     responses:
 *       200:
 *         description: Returns an outfit suggestion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 outfit:
 *                   type: object
 *                 meta:
 *                   type: object
 */
router.get('/generate', auth, async (req, res) => {
  // Replace with your AI/outfit-gen logic as needed.
  const { season, formality } = req.query;
  // Example: You likely want to use user wardrobe items, etc.
  const mockOutfit = {
    top: { name: "Blue Linen Shirt", color: "blue", type: "shirt" },
    bottom: { name: "Beige Chinos", color: "beige", type: "pants" },
    shoes: { name: "White Sneakers", type: "shoes" }
  };
  const meta = { generated: new Date(), usedFilters: { season, formality } };
  res.json({ outfit: mockOutfit, meta });
});

/**
 * @swagger
 * /api/recommendations/suggestions:
 *   get:
 *     summary: Get multiple random outfit suggestions
 *     tags: [Recommendations]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: List of suggested outfits
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   outfit: { type: object }
 *                   meta: { type: object }
 */
router.get('/suggestions', auth, async (req, res) => {
  // Example: return 3 mock suggestions, replace with real batch logic as needed.
  const suggestions = [];
  for (let i = 0; i < 3; i++) {
    suggestions.push({
      outfit: {
        top: { name: `Shirt Option #${i + 1}`, color: "color" + i, type: "shirt" },
        bottom: { name: `Pants Option #${i + 1}`, color: "color" + i, type: "pants" },
        shoes: { name: "Sneakers Variant", type: "shoes" }
      },
      meta: { generated: new Date(), index: i }
    });
  }
  res.json(suggestions);
});

module.exports = router;
