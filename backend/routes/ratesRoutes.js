const express = require('express');
const router = express.Router();
const { getLatestRates } = require('../controllers/ratesController');
const { getRateHistory } = require('../controllers/historyController');

router.get('/latest', getLatestRates);
router.get('/history', getRateHistory);

module.exports = router;
