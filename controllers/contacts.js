const { getContactsCollection } = require('../config/database');
const mongodb = require('mongodb');

/**
 * @swagger
 * /contacts:
 *   get:
 *     tags: [Contacts]
 *     summary: Get all contacts
 *     description: Retrieve a list of all contacts from the database
 *     responses:
 *       200:
 *         description: Successful operation
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Contact'
 *       500:
 *         description: Internal server error
 *         schema:
 *           $ref: '#/definitions/Error'
 */
const getAllContacts = async (req, res) => {
  try {
    const contactsCollection = getContactsCollection();
    if (!contactsCollection) {
      return res.status(500).json({ error: 'Database not connected yet' });
    }

    const contacts = await contactsCollection.find({}).toArray();
    
    console.log(`📋 Retrieved ${contacts.length} contacts`);
    res.json(contacts);
  } catch (error) {
    console.error('❌ Error getting contacts:', error);
    res.status(500).json({ error: 'Failed to retrieve contacts', details: error.message });
  }
};


/**
 * @swagger
 * /contacts/{id}:
 *   get:
 *     tags: [Contacts]
 *     summary: Get contact by ID
 *     description: Retrieve a single contact by its ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: MongoDB ObjectId of the contact
 *         type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *         schema:
 *           $ref: '#/definitions/Contact'
 *       400:
 *         description: Invalid ID format
 *         schema:
 *           $ref: '#/definitions/Error'
 *       404:
 *         description: Contact not found
 *         schema:
 *           $ref: '#/definitions/Error'
 *       500:
 *         description: Internal server error
 *         schema:
 *           $ref: '#/definitions/Error'
 */
const getContactById = async (req, res) => {
  try {
    const contactsCollection = getContactsCollection();
    if (!contactsCollection) {
      return res.status(500).json({ error: 'Database not connected yet' });
    }

    const ObjectId = mongodb.ObjectId;

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid contact ID format' });
    }

    const contact = await contactsCollection.findOne({ 
      _id: new ObjectId(req.params.id) 
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    console.log(`👤 Retrieved contact: ${contact.firstName} ${contact.lastName}`);
    res.json(contact);
  } catch (error) {
    console.error('❌ Error getting contact:', error);
    res.status(500).json({ error: 'Failed to retrieve contact', details: error.message });
  }
};

/**
 * @swagger
 * /contacts:
 *   post:
 *     tags: [Contacts]
 *     summary: Create a new contact
 *     description: Create a new contact with the provided information
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/ContactInput'
 *     responses:
 *       201:
 *         description: Contact created successfully
 *         schema:
 *           $ref: '#/definitions/Success'
 *       400:
 *         description: Invalid input data
 *         schema:
 *           $ref: '#/definitions/Error'
 *       500:
 *         description: Internal server error
 *         schema:
 *           $ref: '#/definitions/Error'
 */
const createContact = async (req, res) => {
  try {
    const contactsCollection = getContactsCollection();
    if (!contactsCollection) {
      return res.status(500).json({ error: 'Database not connected yet' });
    }

    const { firstName, lastName, email, favoriteColor, birthday } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !favoriteColor || !birthday) {
      return res.status(400).json({ 
        error: 'All fields are required',
        details: 'firstName, lastName, email, favoriteColor, birthday'
      });
    }

    // Validate field lengths
    if (firstName.length < 2 || firstName.length > 50) {
      return res.status(400).json({ error: 'First name must be between 2-50 characters' });
    }
    if (lastName.length < 2 || lastName.length > 50) {
      return res.status(400).json({ error: 'Last name must be between 2-50 characters' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate date
    const birthDate = new Date(birthday);
    if (isNaN(birthDate.getTime())) {
      return res.status(400).json({ error: 'Invalid birthday date format. Use YYYY-MM-DD' });
    }

    const newContact = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      favoriteColor: favoriteColor.trim(),
      birthday: birthDate,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await contactsCollection.insertOne(newContact);
    
    console.log(`✅ Created new contact: ${newContact.firstName} ${newContact.lastName}`);
    
    res.status(201).json({
      _id: result.insertedId,
      message: 'Contact created successfully',
      contact: { ...newContact, _id: result.insertedId }
    });
  } catch (error) {
    console.error('❌ Error creating contact:', error);
    res.status(500).json({ error: 'Failed to create contact', details: error.message });
  }
};

/**
 * @swagger
 * /contacts/{id}:
 *   put:
 *     tags: [Contacts]
 *     summary: Update a contact
 *     description: Update an existing contact by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: MongoDB ObjectId of the contact
 *         type: string
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/ContactInput'
 *     responses:
 *       200:
 *         description: Contact updated successfully
 *         schema:
 *           $ref: '#/definitions/Success'
 *       400:
 *         description: Invalid input data or ID format
 *         schema:
 *           $ref: '#/definitions/Error'
 *       404:
 *         description: Contact not found
 *         schema:
 *           $ref: '#/definitions/Error'
 *       500:
 *         description: Internal server error
 *         schema:
 *           $ref: '#/definitions/Error'
 */
const updateContact = async (req, res) => {
  try {
    const contactsCollection = getContactsCollection();
    if (!contactsCollection) {
      return res.status(500).json({ error: 'Database not connected yet' });
    }

    const ObjectId = mongodb.ObjectId;

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid contact ID format' });
    }

    const { firstName, lastName, email, favoriteColor, birthday } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !favoriteColor || !birthday) {
      return res.status(400).json({ 
        error: 'All fields are required',
        details: 'firstName, lastName, email, favoriteColor, birthday'
      });
    }

    // Validate field lengths
    if (firstName.length < 2 || firstName.length > 50) {
      return res.status(400).json({ error: 'First name must be between 2-50 characters' });
    }
    if (lastName.length < 2 || lastName.length > 50) {
      return res.status(400).json({ error: 'Last name must be between 2-50 characters' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate date
    const birthDate = new Date(birthday);
    if (isNaN(birthDate.getTime())) {
      return res.status(400).json({ error: 'Invalid birthday date format. Use YYYY-MM-DD' });
    }

    const updateData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      favoriteColor: favoriteColor.trim(),
      birthday: birthDate,
      updatedAt: new Date()
    };

    const result = await contactsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    console.log(`✏️ Updated contact: ${updateData.firstName} ${updateData.lastName}`);
    
    res.status(200).json({ 
      message: 'Contact updated successfully',
      updatedFields: updateData
    });
  } catch (error) {
    console.error('❌ Error updating contact:', error);
    res.status(500).json({ error: 'Failed to update contact', details: error.message });
  }
};



/**
 * @swagger
 * /contacts/{id}:
 *   delete:
 *     tags: [Contacts]
 *     summary: Delete a contact
 *     description: Delete a contact by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: MongoDB ObjectId of the contact
 *         type: string
 *     responses:
 *       200:
 *         description: Contact deleted successfully
 *         schema:
 *           $ref: '#/definitions/Success'
 *       400:
 *         description: Invalid ID format
 *         schema:
 *           $ref: '#/definitions/Error'
 *       404:
 *         description: Contact not found
 *         schema:
 *           $ref: '#/definitions/Error'
 *       500:
 *         description: Internal server error
 *         schema:
 *           $ref: '#/definitions/Error'
 */
const deleteContact = async (req, res) => {
  try {
    const contactsCollection = getContactsCollection();
    if (!contactsCollection) {
      return res.status(500).json({ error: 'Database not connected yet' });
    }

    const ObjectId = mongodb.ObjectId;

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid contact ID format' });
    }

    // First get the contact to log who we're deleting
    const contact = await contactsCollection.findOne({ 
      _id: new ObjectId(req.params.id) 
    });

    const result = await contactsCollection.deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const contactName = contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown';
    console.log(`🗑️ Deleted contact: ${contactName}`);
    
    res.status(200).json({ 
      message: 'Contact deleted successfully',
      deletedContact: contactName
    });
  } catch (error) {
    console.error('❌ Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact', details: error.message });
  }
};

module.exports = {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact
};