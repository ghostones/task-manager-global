const axios = require('axios');

/**
 * @function getExchangeRates
 * @description Get exchange rates for base currency (default: USD) using ExchangeRate-API.
 * @param {string} [baseCurrency='USD'] - The base currency code.
 * @returns {Promise<{success: boolean, base?: string, rates?: Object, lastUpdated?: string, error?: string}>} Exchange rates response.
 */
async function getExchangeRates(baseCurrency = 'USD') {
  try {
    const apiKey = process.env.EXCHANGE_API_KEY;
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${baseCurrency}`;
    const response = await axios.get(url);

    if (response.data.result === 'success') {
      return {
        success: true,
        base: baseCurrency,
        rates: response.data.conversion_rates,
        lastUpdated: response.data.time_last_update_utc
      };
    } else {
      throw new Error('Failed to fetch exchange rates');
    }
  } catch (err) {
    console.error('Exchange rate fetch error:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * @function convertCurrency
 * @description Convert an amount from one currency to another.
 * @param {number} amount - The original amount.
 * @param {string} fromCurrency - The source currency code.
 * @param {string} toCurrency - The target currency code.
 * @returns {Promise<{success: boolean, originalAmount?: number, convertedAmount?: number, fromCurrency?: string, toCurrency?: string, rate?: number, timestamp?: string, error?: string}>}
 */
async function convertCurrency(amount, fromCurrency, toCurrency) {
  try {
    const rates = await getExchangeRates(fromCurrency);

    if (!rates.success) {
      throw new Error('Could not fetch exchange rates');
    }

    const rate = rates.rates[toCurrency];
    if (!rate) {
      throw new Error(`Conversion rate for ${toCurrency} not found`);
    }

    const convertedAmount = (amount * rate).toFixed(2);

    return {
      success: true,
      originalAmount: amount,
      convertedAmount: parseFloat(convertedAmount),
      fromCurrency,
      toCurrency,
      rate,
      timestamp: rates.lastUpdated
    };
  } catch (err) {
    console.error('Currency conversion error:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { getExchangeRates, convertCurrency };
