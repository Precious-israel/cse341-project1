const express = require('express');
const router = express.Router();
const {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact
} = require('../controllers/contacts');

/**
 * @route GET /contacts
 * @description Get all contacts
 * @access Public
 */
router.get('/', getAllContacts);

/**
 * @route GET /contacts/:id
 * @description Get a single contact by ID
 * @access Public
 */
router.get('/:id', getContactById);

/**
 * @route POST /contacts
 * @description Create a new contact
 * @access Public
 */
router.post('/', createContact);

/**
 * @route PUT /contacts/:id
 * @description Update a contact by ID
 * @access Public
 */
router.put('/:id', updateContact);

/**
 * @route DELETE /contacts/:id
 * @description Delete a contact by ID
 * @access Public
 */
router.delete('/:id', deleteContact);

module.exports = router;