const express = require('express');
const { connectToDatabase } = require('./config/database');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Initialize database connection
connectToDatabase();

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

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});