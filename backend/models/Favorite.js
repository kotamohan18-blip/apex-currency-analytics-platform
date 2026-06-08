const mongoose = require('mongoose');

const favoriteSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    fromCurrency: {
      type: String,
      required: [true, 'Please add a from currency code'],
      trim: true,
      uppercase: true,
    },
    toCurrency: {
      type: String,
      required: [true, 'Please add a to currency code'],
      trim: true,
      uppercase: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate favorite pairs for a single user
favoriteSchema.index({ user: 1, fromCurrency: 1, toCurrency: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
