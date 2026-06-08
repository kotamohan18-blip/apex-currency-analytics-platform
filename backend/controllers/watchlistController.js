const Watchlist = require('../models/Watchlist');

// @desc    Get user's currency watchlist
// @route   GET /api/watchlist
// @access  Private
const getWatchlist = async (req, res) => {
  try {
    const watchlist = await Watchlist.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a currency to watchlist
// @route   POST /api/watchlist
// @access  Private
const addToWatchlist = async (req, res) => {
  try {
    const { currencyCode } = req.body;

    if (!currencyCode) {
      return res.status(400).json({ message: 'Please provide a currency code' });
    }

    const codeUpper = currencyCode.toUpperCase();

    // Check if already in watchlist
    const exists = await Watchlist.findOne({
      user: req.user._id,
      currencyCode: codeUpper,
    });

    if (exists) {
      return res.status(400).json({ message: 'This currency is already in your watchlist' });
    }

    const item = await Watchlist.create({
      user: req.user._id,
      currencyCode: codeUpper,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove a currency from watchlist
// @route   DELETE /api/watchlist/:id
// @access  Private
const removeFromWatchlist = async (req, res) => {
  try {
    const item = await Watchlist.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Watchlist item not found' });
    }

    // Check ownership
    if (item.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await item.deleteOne();
    res.json({ message: 'Currency removed from watchlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
};
