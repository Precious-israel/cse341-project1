const express = require('express');
const router = express.Router();
const { getContactsCollection } = require('../config/database');
const { ObjectId } = require('mongodb').ObjectId;

// GET all contacts
router.get('/', async (req, res) => {
  try {
    const contactsCollection = getContactsCollection();
    const contacts = await contactsCollection.find({}).toArray();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single contact by ID
router.get('/:id', async (req, res) => {
  try {
    const contactsCollection = getContactsCollection();
    
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid contact ID' });
    }
    
    const contact = await contactsCollection.findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;