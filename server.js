const express = require('express');
const { connectToDatabase } = require('./config/database');
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

    // Routes
    app.use('/contacts', require('./routes/contacts'));

    // Basic route
    app.get('/', (req, res) => {
      res.json({ 
        message: 'Contacts API - Hello World!',
        endpoints: {
          getAllContacts: 'GET /contacts',
          getContact: 'GET /contacts/:id'
        }
      });
    });

    // Start server after DB is ready
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

// Start everything
startServer();
