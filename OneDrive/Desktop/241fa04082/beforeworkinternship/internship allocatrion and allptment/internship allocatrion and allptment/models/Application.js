const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  internship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  resume: {
    type: String
  },
  coverLetter: {
    type: String
  }
});

applicationSchema.index({ user: 1, internship: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
