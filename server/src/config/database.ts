import mongoose from 'mongoose';
import { config } from '../config';

let isInitialConnection = true;

export const connectDatabase = async (): Promise<void> => {
  try {
    // Set up event listeners BEFORE connecting
    setupConnectionEventListeners();
    
    const conn = await mongoose.connect(config.mongodb.uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Mark initial connection as complete
    isInitialConnection = false;
    
    // Setup indexes after connection
    await setupIndexes();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const setupIndexes = async (): Promise<void> => {
  try {
    // Indexes will be created by the models
    console.log('📊 Database indexes initialized');
  } catch (error) {
    console.error('Error setting up indexes:', error);
  }
};

const setupConnectionEventListeners = (): void => {
  // Only set up listeners once
  if (mongoose.connection.listenerCount('disconnected') > 0) {
    return;
  }

  mongoose.connection.on('connected', () => {
    if (!isInitialConnection) {
      console.log('🔄 MongoDB reconnected');
    }
  });

  mongoose.connection.on('disconnected', () => {
    // Only log disconnection if it's not during initial connection
    if (!isInitialConnection) {
      console.log('⚠️  MongoDB disconnected');
    }
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err);
  });

  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnection successful');
  });
};
