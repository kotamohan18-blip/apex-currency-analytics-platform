const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cluster = require('cluster');
const os = require('os');
require('dotenv').config();

const connectDB = require('./database');

// Routes
const authRoutes = require('./routes/auth');
const internshipRoutes = require('./routes/internships');
const applicationRoutes = require('./routes/applications');
const adminRoutes = require('./routes/admin');
const profileRoutes = require('./routes/profile');
const aiRoutes = require('./routes/ai');

const PORT = process.env.PORT || 3000;

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  console.log(`🚀 Master ${process.pid} is running`);
  console.log(`🚀 Forking ${numCPUs} workers to handle 1000+ concurrent users...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`❌ Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  const app = express();
  
  app.set('trust proxy', 1); // Trust first proxy (ngrok, etc.) for rate limiting
  
  // Connect DB
  connectDB();

  // Middleware - Performance & Stability
  app.use(compression()); // Compress responses for better performance
  
  // Rate limiting to handle spikes gracefully
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // limit each IP to 500 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' }
  });
  app.use('/api/', limiter);

  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Static files
  app.use(express.static('public'));
  app.use('/uploads', express.static('uploads'));

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/internships', internshipRoutes);
  app.use('/api/applications', applicationRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/ai', aiRoutes);

  // HTML routes
  app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
  app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
  app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'public', 'signup.html')));
  app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
  app.get('/profile', (req, res) => res.sendFile(path.join(__dirname, 'public', 'profile.html')));
  app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
  app.get('/internships', (req, res) => res.sendFile(path.join(__dirname, 'public', 'internships.html')));
  app.get('/applications', (req, res) => res.sendFile(path.join(__dirname, 'public', 'applications.html')));
  app.get('/allocation', (req, res) => res.sendFile(path.join(__dirname, 'public', 'allocation.html')));
  app.get('/professional', (req, res) => res.sendFile(path.join(__dirname, 'public', 'professional.html')));

  // Error handler
  app.use((err, req, res, next) => {
    console.error("🔥 ERROR:", err);
    res.status(500).json({ success: false });
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`🚀 Worker ${process.pid} started on http://localhost:${PORT}`);
  });

  process.on('uncaughtException', err => console.error('❌ Uncaught Exception:', err));
  process.on('unhandledRejection', err => console.error('❌ Unhandled Rejection:', err));
}