const express = require('express');
const router = express.Router();
const GemsLog = require('../models/GemsLog');
const User = require('../models/User');
// const auth = require('../middleware/auth'); // Add this back and uncomment router.use(auth) for real use

/**
 * @swagger
 * tags:
 *   name: Gems
 *   description: Add or log user reward gems (gamification)
 */

/**
 * @swagger
 * /api/gems/reward:
 *   post:
 *     summary: Reward (add) gems to a user and log the action
 *     tags: [Gems]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, action, amount]
 *             properties:
 *               userId: { type: string }
 *               action: { type: string }
 *               amount: { type: number }
 *     responses:
 *       200:
 *         description: Gems added and logged
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 gems: { type: number }
 *                 message: { type: string }
 *       400:
 *         description: User or request invalid
 */
router.post('/reward', async (req, res) => {
  const { userId, action, amount } = req.body;
  if (!userId || !action || typeof amount !== 'number') {
    return res.status(400).json({ message: 'Missing userId, action, or amount (number)' });
  }
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: 'User not found' });
    user.gems = (user.gems || 0) + amount;
    await user.save();
    const log = new GemsLog({ userId, action, amount });
    await log.save();
    res.json({ gems: user.gems, message: 'Gems added!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
