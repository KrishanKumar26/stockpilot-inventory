const mongoose = require('mongoose');
require('dotenv').config();

const connectMongo = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/stockpilot_logs';
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`✅ MongoDB Connected to: ${mongoose.connection.name}`);
  } catch (err) {
    console.warn(`⚠️ MongoDB connection warning: ${err.message}. (Activity logging will fallback gracefully if needed)`);
  }
};

module.exports = { connectMongo };
