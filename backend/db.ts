import mongoose from "mongoose";
import dotenv from "dotenv";
import { MongoMemoryServer } from "mongodb-memory-server";

dotenv.config({ path: ".env", debug: false });

let memoryServer: MongoMemoryServer | null = null;

function getMongoUri() {
  return (
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.DATABASE_URL ||
    process.env.MONGO_URL ||
    ""
  ).trim();
}

const defaultOptions = {
  maxPoolSize: 100,
  minPoolSize: 10,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 30000, // Increased timeout for Render cold starts
  socketTimeoutMS: 45000,
  bufferCommands: false,
};

async function getFallbackUri() {
  memoryServer = memoryServer || await MongoMemoryServer.create();
  console.warn("⚠️  MongoDB URI is missing or unavailable; using an ephemeral in-memory database.");
  return memoryServer.getUri("fashionweb");
}

export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const mongoUri = getMongoUri();
  const uriToUse = mongoUri || await getFallbackUri();

  try {
    return await mongoose.connect(uriToUse, defaultOptions);
  } catch (error) {
    if (mongoUri) {
      console.warn("⚠️  Failed to connect to configured MongoDB URI. Falling back to in-memory database.");
      const fallbackUri = await getFallbackUri();
      return mongoose.connect(fallbackUri, defaultOptions);
    }

    throw error;
  }
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

export function getDatabaseUri() {
  return getMongoUri();
}
