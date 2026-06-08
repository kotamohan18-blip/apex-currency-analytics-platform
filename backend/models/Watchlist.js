const mongoose = require('mongoose');

const watchlistSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    currencyCode: {
      type: String,
      required: [true, 'Please add a currency code'],
      trim: true,
      uppercase: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate watchlist items for a single user
watchlistSchema.index({ user: 1, currencyCode: 1 }, { unique: true });

module.exports = mongoose.model('Watchlist', watchlistSchema);
