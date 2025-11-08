const express = require('express');
const { connectToDatabase } = require('./config/database');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Load Swagger documentation with error handling
let swaggerDocument = null;
try {
  if (fs.existsSync(path.join(__dirname, 'swagger.json'))) {
    swaggerDocument = require('./swagger.json');
    console.log('✅ Swagger documentation loaded successfully');
  } else {
    console.log('⚠️  swagger.json not found. Run "npm run swagger" to generate it.');
  }
} catch (error) {
  console.log('❌ Error loading swagger.json:', error.message);
}

// Async function to initialize database and start server
async function startServer() {
  try {
    console.log('🔄 Connecting to database...');
    await connectToDatabase();
    console.log('✅ Database connected successfully');

    // Update Swagger host for production if document exists
    if (swaggerDocument && process.env.NODE_ENV === 'production' && process.env.RENDER_URL) {
      const renderUrl = new URL(process.env.RENDER_URL);
      swaggerDocument.host = renderUrl.host;
      swaggerDocument.schemes = ['https'];
      console.log(`🌐 Production Swagger host set to: ${swaggerDocument.host}`);
    }

    // Swagger Documentation Route
    if (swaggerDocument) {
      app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: "Contacts API Documentation"
      }));
      console.log('📖 Swagger UI available at /api-docs');
    } else {
      // Fallback route if swagger.json doesn't exist
      app.use('/api-docs', swaggerUi.serve, swaggerUi.setup({}));
      app.get('/api-docs', (req, res) => {
        res.status(503).json({
          error: 'Swagger documentation not available',
          message: 'Run "npm run swagger" to generate API documentation',
          instructions: 'Run "npm run swagger" in the terminal to generate the documentation'
        });
      });
    }

    // API Routes - IMPORTANT: Load these after Swagger setup
    app.use('/contacts', require('./routes/contacts'));
    app.use('/', require('./routes/swagger'));

    // Root route
    app.get('/', (req, res) => {
      res.json({
        message: '🏠 Contacts API - Welcome!',
        description: 'A comprehensive REST API for managing contacts',
        version: '1.0.0',
        endpoints: {
          contacts: {
            getAll: 'GET /contacts',
            getOne: 'GET /contacts/:id',
            create: 'POST /contacts',
            update: 'PUT /contacts/:id',
            delete: 'DELETE /contacts/:id'
          },
          documentation: 'GET /api-docs',
          health: 'GET /health'
        },
        note: 'Visit /api-docs for complete interactive API documentation',
        timestamp: new Date().toISOString()
      });
    });

    // 404 handler - must be after all routes
    app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Route not found',
        message: `The route ${req.originalUrl} does not exist`,
        availableRoutes: {
          root: 'GET /',
          contacts: {
            getAll: 'GET /contacts',
            getOne: 'GET /contacts/:id',
            create: 'POST /contacts',
            update: 'PUT /contacts/:id',
            delete: 'DELETE /contacts/:id'
          },
          documentation: 'GET /api-docs',
          health: 'GET /health'
        },
        timestamp: new Date().toISOString()
      });
    });

    // Global error handler
    app.use((error, req, res, next) => {
      console.error('🚨 Global error handler:', error);
      
      // MongoDB duplicate key error
      if (error.code === 11000) {
        return res.status(409).json({
          error: 'Duplicate entry',
          message: 'A contact with this email already exists',
          details: error.keyValue
        });
      }
      
      // MongoDB validation error
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          error: 'Validation failed',
          message: Object.values(error.errors).map(e => e.message).join(', ')
        });
      }
      
      // Default error
      res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : error.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
      });
    });

    // Start server
    app.listen(port, () => {
      console.log('\n' + '='.repeat(50));
      console.log('🚀 Server started successfully!');
      console.log('='.repeat(50));
      console.log(`📍 Local: http://localhost:${port}`);
      console.log(`📖 API Docs: http://localhost:${port}/api-docs`);
      console.log(`❤️  Health: http://localhost:${port}/health`);
      console.log(`📞 Contacts: http://localhost:${port}/contacts`);
      
      if (process.env.RENDER_URL) {
        console.log('\n🌐 Production URLs:');
        console.log(`   App: ${process.env.RENDER_URL}`);
        console.log(`   Docs: ${process.env.RENDER_URL}/api-docs`);
      }
      
      console.log('\n🛠️  Environment:', process.env.NODE_ENV || 'development');
      console.log('⏰ Started at:', new Date().toISOString());
      console.log('='.repeat(50) + '\n');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    
    // Provide specific error messages
    if (error.name === 'MongoServerSelectionError') {
      console.log('\n🔧 MongoDB Connection Troubleshooting:');
      console.log('   1. Check your internet connection');
      console.log('   2. Verify MongoDB Atlas cluster is running');
      console.log('   3. Check if your IP is whitelisted in MongoDB Atlas');
      console.log('   4. Try using a VPN if on restricted network');
    }
    
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔻 Received SIGINT. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔻 Received SIGTERM. Shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();