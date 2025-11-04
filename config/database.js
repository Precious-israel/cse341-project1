const { MongoClient } = require('mongodb');
require('dotenv').config();

// Create a new MongoClient instance using your connection string
const client = new MongoClient(process.env.MONGODB_URI);

let contactsCollection;

async function connectToDatabase() {
  try {
    // Connect to MongoDB
    await client.connect();

    // ✅ Use the correct database and collection names
    const db = client.db('project1');       // Your MongoDB database name
    contactsCollection = db.collection('contactsdb'); // Your MongoDB collection name

    console.log('✅ Connected to MongoDB (project1.contactsdb)');
    return contactsCollection;
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

// Getter for accessing the collection in route files
function getContactsCollection() {
  return contactsCollection;
}

module.exports = { connectToDatabase, getContactsCollection };
