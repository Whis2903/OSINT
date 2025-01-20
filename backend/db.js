const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_DB_URI;
const client = new MongoClient(uri);
const dbName = process.env.DB_NAME;

let db;

const connectToDatabase = async () => {
  if (!db) {
    try {
      await client.connect();
      db = client.db(dbName);
      console.log('Connected to database successfully');
    } catch (error) {
      console.error('Failed to connect to the database:', error);
      throw error;  // Re-throw the error after logging it
    }
  }
  return db;
};

process.on('SIGINT', async () => {
  try {
    await client.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing the database connection:', error);
  } finally {
    process.exit(0);
  }
});

module.exports = connectToDatabase;