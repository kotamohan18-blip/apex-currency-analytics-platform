const axios = require('axios');
const DailyRate = require('../models/DailyRate');
const Alert = require('../models/Alert');

let cachedRatesData = null;
let cacheTime = null;

// Helper to check and trigger active rate alerts
const checkRateAlerts = async (rates) => {
  try {
    const activeAlerts = await Alert.find({ isActive: true });
    
    if (activeAlerts.length === 0) return;

    for (const alert of activeAlerts) {
      const { fromCurrency, toCurrency, condition, value } = alert;
      
      const rateFrom = rates[fromCurrency];
      const rateTo = rates[toCurrency];

      if (!rateFrom || !rateTo) continue;

      // Calculate relative rate: fromCurrency to toCurrency
      // e.g. USD to INR is rates['INR'] / rates['USD']
      const currentRate = rateTo / rateFrom;
      let shouldTrigger = false;

      if (condition === 'GREATER_THAN' && currentRate > value) {
        shouldTrigger = true;
      } else if (condition === 'LESS_THAN' && currentRate < value) {
        shouldTrigger = true;
      }

      if (shouldTrigger) {
        alert.isActive = false;
        alert.isTriggered = true;
        alert.triggeredAt = new Date();
        await alert.save();
        console.log(`Alert Triggered: ${fromCurrency}/${toCurrency} is ${currentRate.toFixed(4)} (${condition} ${value})`);
      }
    }
  } catch (err) {
    console.error('Error checking rate alerts:', err.message);
  }
};

// @desc    Get latest exchange rates and update caches
// @route   GET /api/rates/latest
// @access  Public
const getLatestRates = async (req, res) => {
  try {
    const now = Date.now();
    // Cache for 1 hour (3600000 ms)
    if (cachedRatesData && cacheTime && now - cacheTime < 3600000) {
      return res.json({
        source: 'cache',
        ...cachedRatesData,
      });
    }

    console.log('Fetching fresh rates from open.er-api.com...');
    const response = await axios.get('https://open.er-api.com/v6/latest/USD');
    
    if (response.data && response.data.result === 'success') {
      const { rates, time_last_update_utc } = response.data;
      
      cachedRatesData = {
        base: 'USD',
        rates,
        lastUpdated: time_last_update_utc,
      };
      cacheTime = now;

      // Save to database daily cache in background
      const todayStr = new Date().toISOString().split('T')[0];
      try {
        await DailyRate.findOneAndUpdate(
          { date: todayStr },
          { date: todayStr, rates },
          { upsert: true, new: true }
        );
      } catch (dbErr) {
        console.error('Error saving daily rates cache:', dbErr.message);
      }

      // Check user rate alerts in background
      checkRateAlerts(rates);

      return res.json({
        source: 'api',
        ...cachedRatesData,
      });
    } else {
      // Fallback to cache if API fails
      if (cachedRatesData) {
        return res.json({
          source: 'fallback-cache',
          ...cachedRatesData,
        });
      }
      return res.status(502).json({ message: 'Error retrieving rates from source API' });
    }
  } catch (error) {
    console.error('Fetch Rates Error:', error.message);
    if (cachedRatesData) {
      return res.json({
        source: 'fallback-cache',
        ...cachedRatesData,
      });
    }
    res.status(500).json({ message: 'Internal server error while fetching rates' });
  }
};

module.exports = {
  getLatestRates,
  checkRateAlerts,
};
