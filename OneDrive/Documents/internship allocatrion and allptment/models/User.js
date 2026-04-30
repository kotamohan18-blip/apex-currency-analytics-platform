const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  department: {
    type: String,
    trim: true
  },
  registryId: {
    type: String,
    trim: true
  },
  institution: {
    type: String,
    trim: true
  },
  resume: {
    type: String
  },
  skills: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  resetPasswordOTP: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
