import dotenv from 'dotenv';

dotenv.config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5000),
  mongoUri: required('MONGO_URI', 'mongodb://127.0.0.1:27017/hotel_booking'),
  jwtSecret: required('JWT_SECRET', 'change_this_secret'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 10),
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
};

export const isProd = env.nodeEnv === 'production';
export const isTest = env.nodeEnv === 'test';
