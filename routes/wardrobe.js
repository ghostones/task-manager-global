const express = require('express');
const auth = require('../middleware/auth');
const WardrobeItem = require('../models/WardrobeItem');
const { validateWardrobeItem } = require('../middleware/validate');
const upload = require('../middleware/upload');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Wardrobe
 *   description: Wardrobe item management
 */

/**
 * @swagger
 * /api/wardrobe/mine:
 *   get:
 *     summary: Get all items in the authenticated user's wardrobe
 *     tags: [Wardrobe]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: List of wardrobe items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WardrobeItem'
 */
router.get('/mine', auth, async (req, res) => {
  const items = await WardrobeItem.find({ userId: req.user.userId }).lean();
  res.json(items);
});

/**
 * @swagger
 * /api/wardrobe:
 *   post:
 *     summary: Add a new wardrobe item (JSON only)
 *     tags: [Wardrobe]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WardrobeItem'
 *     responses:
 *       201:
 *         description: Item added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WardrobeItem'
 */
router.post('/', auth, validateWardrobeItem, async (req, res) => {
  const item = new WardrobeItem({ ...req.body, userId: req.user.userId });
  await item.save();
  res.status(201).json(item);
});

/**
 * @swagger
 * /api/wardrobe/upload:
 *   post:
 *     summary: Add a new wardrobe item with image upload
 *     tags: [Wardrobe]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               garmentType: { type: string }
 *               color: { type: string }
 *               formality: { type: string }
 *               image: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Item added with image
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 item: { $ref: '#/components/schemas/WardrobeItem' }
 */
router.post('/upload', auth, upload.single('image'), validateWardrobeItem, async (req, res) => {
  const item = new WardrobeItem({
    ...req.body,
    userId: req.user.userId,
    imageUrl: req.file?.path || req.file?.url // Cloudinary (url), Multer disk (path)
  });
  await item.save();
  res.status(201).json({ message: 'Upload success', item });
});

module.exports = router;
