const express = require('express');
const router = express.Router();


router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Contacts API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});



module.exports = router;