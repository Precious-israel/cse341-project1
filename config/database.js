const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGODB_URI);

let contactsCollection;

async function connectToDatabase() {
  try {
    await client.connect();
    const db = client.db('contactsDB');
    contactsCollection = db.collection('contacts');
    console.log('Connected to MongoDB');
    return contactsCollection;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

function getContactsCollection() {
  return contactsCollection;
}

module.exports = { connectToDatabase, getContactsCollection };