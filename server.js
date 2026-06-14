// ============================================================
// Singhai Cafe — server.js (Entry Point)
// Developed by: Arpit Jain
// ============================================================

const express    = require('express');
const mongoose   = require('mongoose');
const dotenv     = require('dotenv');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const compression= require('compression');
const cookieParser=require('cookie-parser');
const path       = require('path');
const rateLimit  = require('express-rate-limit');

// Load env vars
dotenv.config();

// Import routes
const authRoutes        = require('./routes/auth.routes');
const menuRoutes        = require('./routes/menu.routes');
const reservationRoutes = require('./routes/reservation.routes');
const orderRoutes       = require('./routes/order.routes');
const reviewRoutes      = require('./routes/review.routes');
const eventRoutes       = require('./routes/event.routes');
const contactRoutes     = require('./routes/contact.routes');
const loyaltyRoutes     = require('./routes/loyalty.routes');
const adminRoutes       = require('./routes/admin.routes');
const galleryRoutes     = require('./routes/gallery.routes');

// Import middleware
const errorHandler = require('./middleware/error.middleware');
const { connectDB } = require('./config/db.config');

// Connect to Database
connectDB();

const app = express();

// ── Security Middleware ──────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// ── Rate Limiting ────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Stricter limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts, please try again after 15 minutes.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ── Body Parsers ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── CORS ─────────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// ── Compression & Logging ────────────────────────────────────
app.use(compression());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Static Files ─────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'Frontend')));

// ── API Routes ───────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/menu',         menuRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/orders',       orderRoutes);
app.use('/api/reviews',      reviewRoutes);
app.use('/api/events',       eventRoutes);
app.use('/api/contact',      contactRoutes);
app.use('/api/loyalty',      loyaltyRoutes);
app.use('/api/admin',        adminRoutes);
app.use('/api/gallery',      galleryRoutes);

// ── Health Check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Singhai Cafe API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// ── Root ─────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Frontend/index.html'));
});

// ── 404 Handler ──────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ─────────────────────────────────────
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n☕  Singhai Cafe API running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`🔗  http://localhost:${PORT}`);
  console.log(`👨‍💻  Developed by Arpit Jain\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  process.exit(1);
});

module.exports = app;