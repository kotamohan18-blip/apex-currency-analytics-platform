const ConversionHistory = require('../models/ConversionHistory');

// @desc    Get user conversion history
// @route   GET /api/history
// @access  Private
const getConversionHistory = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = { user: req.user._id };

    if (search) {
      const searchUpper = search.toUpperCase();
      query.$or = [
        { fromCurrency: { $regex: searchUpper, $options: 'i' } },
        { toCurrency: { $regex: searchUpper, $options: 'i' } }
      ];
    }

    const history = await ConversionHistory.find(query)
      .sort({ createdAt: -1 })
      .limit(100); // limit to last 100 entries

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create conversion history entry
// @route   POST /api/history
// @access  Private
const createConversionHistory = async (req, res) => {
  try {
    const { amount, fromCurrency, toCurrency, result } = req.body;

    if (!amount || !fromCurrency || !toCurrency || result === undefined) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const entry = await ConversionHistory.create({
      user: req.user._id,
      amount: Number(amount),
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase(),
      result: Number(result),
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete conversion history entry
// @route   DELETE /api/history/:id
// @access  Private
const deleteConversionHistoryEntry = async (req, res) => {
  try {
    const entry = await ConversionHistory.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'History record not found' });
    }

    // Check ownership
    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await entry.deleteOne();
    res.json({ message: 'History record removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear all conversion history for a user
// @route   DELETE /api/history/clear
// @access  Private
const clearAllConversionHistory = async (req, res) => {
  try {
    await ConversionHistory.deleteMany({ user: req.user._id });
    res.json({ message: 'All conversion history cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getConversionHistory,
  createConversionHistory,
  deleteConversionHistoryEntry,
  clearAllConversionHistory,
};
