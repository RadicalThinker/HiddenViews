import mongoose from 'mongoose';
import { logger } from './logger';

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  // Check if we have a connection to the database or if it's currently connecting
  if (connection.isConnected) {
    logger.debug('Using existing database connection');
    return;
  }

  try {
    // Attempt to connect to the database
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    const db = await mongoose.connect(process.env.MONGODB_URI, {});

    connection.isConnected = db.connections[0].readyState;

    logger.info('Database connected successfully');
  } catch (error) {
    // Throw instead of process.exit(1) so build-time page-data collection
    // (which has no DB) doesn't crash the whole build worker — the route
    // simply fails to prerun, which is fine for dynamic API routes.
    logger.critical('Database connection failed', error);
    throw error;
  }
}

export default dbConnect;
