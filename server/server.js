// ─────────────────────────────────────────────────────────────────
// BuildTok API Server — Express.js + MongoDB
// ─────────────────────────────────────────────────────────────────
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// ── Routes ─────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const commentRoutes = require('./routes/commentRoutes');
const messageRoutes = require('./routes/messageRoutes');
const supportRoutes = require('./routes/supportRoutes');

// Load Cloudinary to output configuration diagnostics on startup
require('./config/cloudinary');

// ── Connect to MongoDB ─────────────────────────────────────────
connectDB();

const app = express();

// ── CORS ───────────────────────────────────────────────────────
// Parse comma-separated CLIENT_URL env var so a single env var can list multiple origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://build-tok.vercel.app',
  ...((process.env.CLIENT_URL || '')
    .split(',')
    .map(u => u.trim())
    .filter(Boolean)),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile apps, same-origin)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin '${origin}' not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Pre-flight response for all routes
app.options('*', cors());

// ── Body parsers ────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Health check ────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'BuildTok API is running 🚀',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── API v1 routes ───────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/support',  supportRoutes);

// ── Root info ───────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    name: 'BuildTok API',
    version: '1.0.0',
    endpoints: {
      health:   'GET  /health',
      auth:     'POST /api/auth/register | /api/auth/login | GET /api/auth/me',
      users:    'GET  /api/users/search | /api/users/:id | PUT /api/users/profile | /api/users/follow/:id',
      projects: 'GET  /api/projects/feed | POST /api/projects | GET|PUT|DELETE /api/projects/:id',
      comments: 'POST /api/comments/:projectId | GET /api/comments/:projectId | DELETE /api/comments/:commentId',
    },
  });
});

// ── 404 + Error handler (must be LAST) ──────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start server ─────────────────────────────────────────────────
const { initSocket } = require('./socket/socketServer');
const PORT = process.env.PORT || 5175;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 BuildTok API running on port ${PORT}`);
  console.log(`   Mode:        ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health:      http://localhost:${PORT}/health`);
  console.log(`   Docs:        http://localhost:${PORT}/\n`);
});
initSocket(server);

// ── Graceful shutdown ─────────────────────────────────────────────
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
  // Force close after 10s
  setTimeout(() => process.exit(1), 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

// Catch unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
