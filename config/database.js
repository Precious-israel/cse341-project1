const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGODB_URI);

let contactsCollection;

async function connectToDatabase() {
  try {
    await client.connect();

    // Correct database and collection names
    const db = client.db('Project1');          // MongoDB database name
    contactsCollection = db.collection('contactsdb'); // MongoDB collection name

    console.log('✅ Connected to MongoDB (Project1.contactsdb)');
    return contactsCollection;
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

function getContactsCollection() {
  return contactsCollection;
}

module.exports = { connectToDatabase, getContactsCollection };
