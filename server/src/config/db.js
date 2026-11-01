import mongoose from 'mongoose';
import { ENV } from './env.js';

let isConnected = false;

export async function connectDB(uri = ENV.MONGO_URI) {
  if (isConnected) {
    return;
  }

  try {
    const conn = await mongoose.connect(uri);
    isConnected = true;
    if (ENV.NODE_ENV !== 'test') {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (ENV.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
}

export async function disconnectDB() {
  if (!isConnected) {
    return;
  }
  await mongoose.disconnect();
  isConnected = false;
}
