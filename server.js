require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Route imports
const authRoutes = require('./routes/auth');
const wardrobeRoutes = require('./routes/wardrobe');
const searchRoutes = require('./routes/search');
const recommendationRoutes = require('./routes/recommendations');
const paymentRoutes = require('./routes/payments');
const currencyRoutes = require('./routes/currency');
const affiliateRoutes = require('./routes/affiliates');

const app = express();
const PORT = process.env.PORT || 5001;

const allowedOrigins = [
  'https://yourfrontend.com', // UPDATE to your deployed frontend domain when ready
  'http://localhost:3000'
];

app.use(cors({
  origin: function(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('CORS not allowed'), false);
  },
  credentials: true,
}));

app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Rate limiting
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }));

// Swagger config
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: { title: 'OutfitBloom API', version: '1.0.0', description: 'Fashion intelligence platform backend' },
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./routes/*.js'],
};
const swaggerSpecs = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Main API routes
app.use('/api/auth', authRoutes);
app.use('/api/wardrobe', wardrobeRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api/affiliates', affiliateRoutes);

// Health + metadata endpoint (place before error handlers)
app.get(['/', '/healthz'], (req, res) => {
  res.json({
    status: 'success',
    message: `OutfitBloom API running on port ${PORT}`,
    docs: `/docs`,
    backend: true,
    time: new Date()
  });
});

// Centralized error/404 handlers
app.use((err, req, res, next) => {
  console.error('Error:', err.message, err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});
app.use((req, res) => res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` }));

// Database and server startup
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 API running at http://localhost:${PORT}`);
      console.log(`📖 Swagger Docs: http://localhost:${PORT}/docs`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// Signals for graceful shutdowns & stability
process.on('SIGINT', async () => { await mongoose.connection.close(); process.exit(0); });
process.on('SIGTERM', async () => { await mongoose.connection.close(); process.exit(0); });
process.on('uncaughtException', err => { console.error('❌ UNCAUGHT EXCEPTION!', err); process.exit(1); });
process.on('unhandledRejection', err => { console.error('❌ UNHANDLED REJECTION!', err); process.exit(1); });
