const mongoose = require('mongoose');

const dailyRateSchema = mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true, // Format: YYYY-MM-DD
    },
    rates: {
      type: Map,
      of: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DailyRate', dailyRateSchema);
