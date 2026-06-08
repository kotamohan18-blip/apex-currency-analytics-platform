const Favorite = require('../models/Favorite');

// @desc    Get user's favorite currency pairs
// @route   GET /api/favorites
// @access  Private
const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a favorite currency pair
// @route   POST /api/favorites
// @access  Private
const addFavorite = async (req, res) => {
  try {
    const { fromCurrency, toCurrency } = req.body;

    if (!fromCurrency || !toCurrency) {
      return res.status(400).json({ message: 'Please provide fromCurrency and toCurrency' });
    }

    const fromUpper = fromCurrency.toUpperCase();
    const toUpper = toCurrency.toUpperCase();

    // Check if already exists
    const exists = await Favorite.findOne({
      user: req.user._id,
      fromCurrency: fromUpper,
      toCurrency: toUpper,
    });

    if (exists) {
      return res.status(400).json({ message: 'This currency pair is already in your favorites' });
    }

    const favorite = await Favorite.create({
      user: req.user._id,
      fromCurrency: fromUpper,
      toCurrency: toUpper,
    });

    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove a favorite currency pair
// @route   DELETE /api/favorites/:id
// @access  Private
const removeFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findById(req.params.id);

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite pair not found' });
    }

    // Check ownership
    if (favorite.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await favorite.deleteOne();
    res.json({ message: 'Favorite pair removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
};
