const express = require('express');
const router = express.Router();
const {
  getConversionHistory,
  createConversionHistory,
  deleteConversionHistoryEntry,
  clearAllConversionHistory,
} = require('../controllers/conversionHistoryController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All routes in this file are protected

router.route('/')
  .get(getConversionHistory)
  .post(createConversionHistory);

router.delete('/clear', clearAllConversionHistory);
router.delete('/:id', deleteConversionHistoryEntry);

module.exports = router;
