import mongoose from "mongoose";

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

function getMongoConfig() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "home_service_platform";

  if (!uri) {
    throw new Error("Missing MONGODB_URI in environment");
  }

  return { uri, dbName };
}

export default async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const { uri, dbName } = getMongoConfig();
    cached.promise = mongoose.connect(uri, {
      dbName,
      maxPoolSize: 10,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
