import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  const isProd = process.env.NODE_ENV === 'production';

  if (!uri) {
    if (isProd) {
      console.error('FATAL: MONGODB_URI is required in production environment.');
      process.exit(1);
    }

    console.log('No MONGODB_URI provided in development. Initializing in-memory MongoDB server...');
    try {
      mongod = await MongoMemoryServer.create({
        instance: {},
        binary: {
          downloadDir: process.env.TEMP || undefined
        },
        spawn: {
          timeout: 120000
        }
      });
      const inMemoryUri = mongod.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`[Database] Connected to in-memory MongoDB instance: ${inMemoryUri}`);
      return;
    } catch (err) {
      console.error('Failed to start in-memory MongoDB instance:', err.message);
      throw err;
    }
  }

  try {
    await mongoose.connect(uri);
    console.log('[Database] Connected to external MongoDB cluster.');
  } catch (err) {
    console.error(`[Database] Connection error: ${err.message}`);
    throw err;
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
}
