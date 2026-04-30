const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/internship_allocation', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 500, // Handle up to 500 connections simultaneously
      family: 4 // Use IPv4, skip trying IPv6
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
