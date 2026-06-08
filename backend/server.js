const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const { checkRateAlerts } = require('./controllers/ratesController');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rates', require('./routes/ratesRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));
app.use('/api/favorites', require('./routes/favoritesRoutes'));
app.use('/api/watchlist', require('./routes/watchlistRoutes'));
app.use('/api/alerts', require('./routes/alertsRoutes'));

// Serve static assets in frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Clean URL routing for frontend pages
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/register.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/profile.html'));
});

// Default fallback to index.html for root or any other page
app.get('*', (req, res, next) => {
  // If it's an API request, let it fall through to errorHandler or return 404
  if (req.originalUrl.startsWith('/api')) {
    res.status(404);
    return next(new Error('API Route not found'));
  }
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Trigger initial rate fetch and alert check 5 seconds after startup
  setTimeout(async () => {
    try {
      console.log('Running startup currency rate alerts check...');
      const response = await axios.get('https://open.er-api.com/v6/latest/USD');
      if (response.data && response.data.result === 'success') {
        await checkRateAlerts(response.data.rates);
        console.log('Startup alerts check completed.');
      }
    } catch (err) {
      console.error('Startup alert check failed:', err.message);
    }
  }, 5000);
});

// Background rate alert check every 10 minutes
setInterval(async () => {
  try {
    console.log('Running scheduled background rate alerts check...');
    const response = await axios.get('https://open.er-api.com/v6/latest/USD');
    if (response.data && response.data.result === 'success') {
      await checkRateAlerts(response.data.rates);
    }
  } catch (err) {
    console.error('Scheduled background alert check failed:', err.message);
  }
}, 600000); // 10 minutes
