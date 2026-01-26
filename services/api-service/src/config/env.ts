import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/tripmind?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_change_in_production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',

  // OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || '',

  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID || '',
  FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET || '',
  FACEBOOK_CALLBACK_URL: process.env.FACEBOOK_CALLBACK_URL || '',

  // Frontend URL
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

  // External APIs
  FLIGHT_API_KEY: process.env.FLIGHT_API_KEY || '',
  WEATHER_API_KEY: process.env.WEATHER_API_KEY || '',
  BOOKING_API_KEY: process.env.BOOKING_API_KEY || '',
  AI_SERVICE_API_KEY: process.env.AI_SERVICE_API_KEY || '',
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:8001',
};

export default env;
