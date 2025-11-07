const express = require('express');
const { connectToDatabase } = require('./config/database');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Async function to initialize database and start server
async function startServer() {
  try {
    await connectToDatabase(); // wait for DB connection
    console.log('Database connected successfully');

    // Swagger Documentation
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Routes
    app.use('/contacts', require('./routes/contacts'));

    // Basic route
    app.get('/', (req, res) => {
      res.json({ 
        message: 'Contacts API - Hello World!',
        endpoints: {
          getAllContacts: 'GET /contacts',
          getContact: 'GET /contacts/:id',
          createContact: 'POST /contacts',
          updateContact: 'PUT /contacts/:id',
          deleteContact: 'DELETE /contacts/:id',
          documentation: 'GET /api-docs'
        }
      });
    });

    // Start server after DB is ready
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`API Documentation available at http://localhost:${port}/api-docs`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

// Start everything
startServer();