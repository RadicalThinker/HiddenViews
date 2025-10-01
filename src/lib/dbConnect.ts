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
    const db = await mongoose.connect(process.env.MONGODB_URI || '', {});

    connection.isConnected = db.connections[0].readyState;

    logger.info('Database connected successfully');
  } catch (error) {
    logger.critical('Database connection failed', error);

    // Graceful exit in case of a connection error
    process.exit(1);
  }
}

export default dbConnect;
