const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = 'pakNewsDB';

let db;

const connectToDatabase = async () => {
  if (!db) {
    await client.connect();
    db = client.db(dbName);
  }
  return db;
};

module.exports = connectToDatabase;