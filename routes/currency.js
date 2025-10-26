const express = require('express');
const router = express.Router();
const { getExchangeRates, convertCurrency } = require('../utils/currency');

/**
 * @swagger
 * tags:
 *   name: Currency
 *   description: Currency rates and conversion utilities
 */

/**
 * @swagger
 * /api/currency/rates:
 *   get:
 *     summary: Get current exchange rates (base USD by default)
 *     tags: [Currency]
 *     parameters:
 *       - name: base
 *         in: query
 *         required: false
 *         schema: { type: string }
 *         description: The base currency (e.g., USD, EUR)
 *     responses:
 *       200:
 *         description: Current currency rates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 base: { type: string }
 *                 date: { type: string }
 *                 rates:
 *                   type: object
 *                   additionalProperties: { type: number }
 */
router.get('/rates', async (req, res) => {
  try {
    const baseCurrency = req.query.base || 'USD';
    const rates = await getExchangeRates(baseCurrency);
    if (rates.success) {
      res.json(rates);
    } else {
      res.status(500).json({ message: rates.error });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/currency/convert:
 *   get:
 *     summary: Convert an amount from one currency to another
 *     tags: [Currency]
 *     parameters:
 *       - name: amount
 *         in: query
 *         schema: { type: number }
 *         required: true
 *       - name: from
 *         in: query
 *         schema: { type: string }
 *         required: true
 *         description: Source currency code (e.g., USD)
 *       - name: to
 *         in: query
 *         schema: { type: string }
 *         required: true
 *         description: Target currency code (e.g., INR)
 *     responses:
 *       200:
 *         description: Converted value with details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 from: { type: string }
 *                 to: { type: string }
 *                 amount: { type: number }
 *                 converted: { type: number }
 */
router.get('/convert', async (req, res) => {
  try {
    const { amount, from, to } = req.query;
    if (!amount || !from || !to) {
      return res.status(400).json({
        message: 'Please provide amount, from, and to currencies'
      });
    }
    const result = await convertCurrency(
      parseFloat(amount),
      from.toUpperCase(),
      to.toUpperCase()
    );
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ message: result.error });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/currency/supported:
 *   get:
 *     summary: Get a list of supported currency codes
 *     tags: [Currency]
 *     responses:
 *       200:
 *         description: Supported currencies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total: { type: number }
 *                 currencies:
 *                   type: array
 *                   items: { type: string }
 */
router.get('/supported', async (req, res) => {
  try {
    const rates = await getExchangeRates('USD');
    if (rates.success) {
      const currencies = Object.keys(rates.rates);
      res.json({
        total: currencies.length,
        currencies
      });
    } else {
      res.status(500).json({ message: rates.error });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
