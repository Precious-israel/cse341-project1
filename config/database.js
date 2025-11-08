const { MongoClient } = require('mongodb');
require('dotenv').config();

const connectionString = process.env.MONGODB_URI;

if (!connectionString) {
  console.error('❌ MONGODB_URI environment variable is not defined');
  process.exit(1);
}

const client = new MongoClient(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // 30 seconds timeout
});

let db = null;
let contactsCollection = null;

async function connectToDatabase() {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    
    await client.connect();

    // Get the database from the connection string (Project1)
    db = client.db();
    contactsCollection = db.collection('contactsdb'); // Collection name

    // Test the connection
    await db.command({ ping: 1 });
    
    console.log('✅ Successfully connected to MongoDB Atlas');
    console.log(`📊 Database: ${db.databaseName}`);
    console.log(`📁 Collection: contactsdb`);
    
    return contactsCollection;
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    
    // Provide more specific error information
    if (error.name === 'MongoServerSelectionError') {
      console.log('🔍 Network/DNS issue detected. Possible solutions:');
      console.log('   • Check your internet connection');
      console.log('   • Try changing DNS servers to 8.8.8.8 (Google)');
      console.log('   • Use a VPN if on restricted network');
    }
    
    if (error.code === 'ENOTFOUND') {
      console.log('🔍 DNS resolution failed. The MongoDB cluster hostname cannot be found.');
    }
    
    process.exit(1);
  }
}

function getContactsCollection() {
  if (!contactsCollection) {
    throw new Error('Database not connected. Call connectToDatabase first.');
  }
  return contactsCollection;
}

// Close connection gracefully
process.on('SIGINT', async () => {
  console.log('🔄 Closing MongoDB connection...');
  await client.close();
  process.exit(0);
});

module.exports = { 
  connectToDatabase, 
  getContactsCollection 
};