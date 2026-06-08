const mongoose = require('mongoose');

const conversionHistorySchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    amount: {
      type: Number,
      required: [true, 'Please add an amount'],
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
    result: {
      type: Number,
      required: [true, 'Please add a conversion result'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ConversionHistory', conversionHistorySchema);
