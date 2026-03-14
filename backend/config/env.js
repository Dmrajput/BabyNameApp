const dotenv = require("dotenv");

dotenv.config({ override: true });

function getMongoUri() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI (or MONGO_URI) is not configured.");
  }

  return mongoUri;
}

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

const config = {
  port: Number(process.env.PORT) || 5000,
  mongodbUri: getMongoUri(),
  jwtSecret: getRequiredEnv("JWT_SECRET"),
};

module.exports = config;
