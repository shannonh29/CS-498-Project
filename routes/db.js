const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri || !dbName) {
  throw new Error('uri or database name is missing from .env');
}
const client = new MongoClient(uri);
let db;
async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db(dbName);
    console.log('Connected to MongoDB Atlas');
  }
  return db;
}

module.exports = connectDB;