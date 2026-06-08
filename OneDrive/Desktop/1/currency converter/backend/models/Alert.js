const mongoose = require('mongoose');

const alertSchema = mongoose.Schema(
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
    condition: {
      type: String,
      enum: ['GREATER_THAN', 'LESS_THAN'],
      required: [true, 'Please specify a condition (GREATER_THAN or LESS_THAN)'],
    },
    value: {
      type: Number,
      required: [true, 'Please add a trigger value'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isTriggered: {
      type: Boolean,
      default: false,
    },
    triggeredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Alert', alertSchema);
