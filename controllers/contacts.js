const { application, json } = require('express');
const mongodb = require('../config/database');
const ObjectId = require('mongodb').ObjectId;


const getAllContacts = async (req, res) => {
  //#swagger.tags=['contacts']
  const result = await mongodb.getDatabase().db().collection('contactsdb').find();
  result.toArray().then((contacts) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(contacts);
  });  
};


const getContactById = async (req, res) => {
  //#swagger.tags=['contacts']
  const contactId = new ObjectId(req.params.id);
  const result = await mongodb.getDatabase().db().collection('contacts').find({ _id:contactId });
  result.toArray().then((contacts) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(contacts[0]);
     });  
};


const createContact = async (req, res) => {
  //#swagger.tags=['contacts']
  const contactId = new ObjectId(req.params.id);
  const contact = {
    firstName: req.body.firstNamec,
    lastName: req.body.lastName,
    email: req.body.mail,
    favoriteColor: req.body.favoriteColor,
    birthday: req.body.birthday
  };
  const response = await mongodb.getDatabase().db().collection('contactsdb').insertOne({ _id: contactId }, contact);
  if (response.acknowledged) {
    res.status(204).send();
  } else {
    res.status(500).json(response.error || 'Some error occurred while updating the user.');
  }
  
};


const updateContact = async (req, res) => {
  //#swagger.tags=['contacts']
  const contactId = new ObjectId(req.params.id);
  const contact = {
    firstName: req.body.firstNamec,
    lastName: req.body.lastName,
    email: req.body.mail,
    favoriteColor: req.body.favoriteColor,
    birthday: req.body.birthday
  };
  const response = await mongodb.getDatabase().db().collection('contactsdb').replaceOne({ _id: contactId }, contact);
  if (response.modifiedCount > 0) {
    res.status(204).send();
  } else {
    res.status(500).json(response.error || 'Some error occurred while updating the user.');
  }
};


const deleteContact = async (req, res) => {
  //#swagger.tags=['contacts']
 const contactId = new ObjectId(req.params.id);
  const response = await mongodb.getDatabase().db().collection('contactsdb').remove({ _id: contactId }, contact);
  if (response.modifiedCount > 0) {
    res.status(204).send();
  } else {
    res.status(500).json(response.error || 'Some error occurred while updating the user.');
  }
};

module.exports = {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact
};