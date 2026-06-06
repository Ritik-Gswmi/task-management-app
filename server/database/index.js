import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task-management-app';

export async function connectDatabase() {
  return mongoose.connect(MONGO_URI, {
    dbName: process.env.MONGO_DB_NAME || undefined,
  });
}
