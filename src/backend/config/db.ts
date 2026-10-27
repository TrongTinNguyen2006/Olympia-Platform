import mongoose from 'mongoose';

// Disable buffering globally so that queries fail fast if the connection is down
mongoose.set('bufferCommands', false);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/olympia';

export async function connectDB(): Promise<typeof mongoose | null> {
  if (!process.env.MONGO_URI) {
    console.warn('⚠️ MONGO_URI is not set in environment. Database connection skipped, falling back to local simulation.');
    return null;
  }

  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${(error as Error).message}`);
    console.warn('⚠️ Database connection failed, falling back to local simulation.');
    return null;
  }
}
