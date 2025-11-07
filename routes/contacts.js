const express = require('express');
const router = express.Router();
const { getContactsCollection } = require('../config/database');
const mongodb = require('mongodb');

// GET all contacts

router.get('/', async (req, res) => {
  try {
    const contactsCollection = getContactsCollection();
    if (!contactsCollection) {
      return res.status(500).json({ error: 'Database not connected yet' });
    }

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
    if (!contactsCollection) {
      return res.status(500).json({ error: 'Database not connected yet' });
    }

    const ObjectId = mongodb.ObjectId;

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid contact ID' });
    }

    const contact = await contactsCollection.findOne({ _id: new ObjectId(req.params.id) });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new contact
/**
 * @swagger
 * /contacts:
 *   post:
 *     summary: Create a new contact
 *     description: Add a new contact to the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactInput'
 *     responses:
 *       201:
 *         description: Contact created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The auto-generated ID of the contact
 *                 message:
 *                   type: string
 *                   description: Success message
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/', async (req, res) => {
  try {
    const contactsCollection = getContactsCollection();
    if (!contactsCollection) {
      return res.status(500).json({ error: 'Database not connected yet' });
    }

    const { firstName, lastName, email, favoriteColor, birthday } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !favoriteColor || !birthday) {
      return res.status(400).json({ 
        error: 'All fields are required: firstName, lastName, email, favoriteColor, birthday' 
      });
    }

    const newContact = {
      firstName,
      lastName,
      email,
      favoriteColor,
      birthday: new Date(birthday),
      createdAt: new Date()
    };

    const result = await contactsCollection.insertOne(newContact);
    
    res.status(201).json({
      _id: result.insertedId,
      message: 'Contact created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update contact

router.put('/:id', async (req, res) => {
  try {
    const contactsCollection = getContactsCollection();
    if (!contactsCollection) {
      return res.status(500).json({ error: 'Database not connected yet' });
    }

    const ObjectId = mongodb.ObjectId;

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid contact ID' });
    }

    const { firstName, lastName, email, favoriteColor, birthday } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !favoriteColor || !birthday) {
      return res.status(400).json({ 
        error: 'All fields are required: firstName, lastName, email, favoriteColor, birthday' 
      });
    }

    const updateData = {
      firstName,
      lastName,
      email,
      favoriteColor,
      birthday: new Date(birthday),
      updatedAt: new Date()
    };

    const result = await contactsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.status(200).json({ message: 'Contact updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE contact

router.delete('/:id', async (req, res) => {
  try {
    const contactsCollection = getContactsCollection();
    if (!contactsCollection) {
      return res.status(500).json({ error: 'Database not connected yet' });
    }

    const ObjectId = mongodb.ObjectId;

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid contact ID' });
    }

    const result = await contactsCollection.deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;