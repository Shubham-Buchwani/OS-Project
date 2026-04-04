import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from './index.js';
import { logger } from '../utils/logger.js';

let mongoServer;

const MONGOOSE_OPTIONS = {
  serverSelectionTimeoutMS: 2000, // Short timeout for auto-fallback
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 2,
};

export async function connectDatabase() {
  try {
    mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
    mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
    mongoose.connection.on('error', (err) => logger.error({ err }, 'MongoDB error'));

    try {
      logger.info('Attempting to connect to external MongoDB...');
      await mongoose.connect(config.MONGODB_URI, MONGOOSE_OPTIONS);
    } catch (e) {
      logger.warn('External MongoDB connection failed. Falling back to In-Memory MongoDB...');
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await mongoose.connect(uri, MONGOOSE_OPTIONS);
    }
  } catch (err) {
    logger.error({ err }, 'Failed to connect to MongoDB');
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
  logger.info('MongoDB disconnected gracefully');
}
