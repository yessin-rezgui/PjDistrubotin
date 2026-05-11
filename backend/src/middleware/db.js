const mongoose = require('mongoose');
const seedDatabase = require('../db/seed');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * MongoDB Connection
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/concert-ticketing';

    logger.info(`Connecting to MongoDB at: ${mongoUri}`);

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    logger.success('MongoDB connected successfully');

    try {
      const indexes = await User.collection.indexes();
      const legacyEmailIndex = indexes.find((index) => index.name === 'email_1');
      if (legacyEmailIndex) {
        await User.collection.dropIndex('email_1');
        logger.warn('Dropped legacy email index');
      }
    } catch (indexError) {
      logger.warn(`User index cleanup skipped: ${indexError.message}`);
    }

    await seedDatabase();
  } catch (error) {
    logger.error('MongoDB connection error', error);
    process.exit(1);
  }
};

module.exports = connectDB;
