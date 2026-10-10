import mongoose from 'mongoose';
import { env } from './env';

export const connectDb = async () => {
  if (!env.mongoUri) {
    console.error('[DATABASE ERROR] MONGO_URI is missing. Please set MONGO_URI in your environment settings (Render / .env).');
    return;
  }
  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });
};
