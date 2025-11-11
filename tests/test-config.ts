import * as dotenv from 'dotenv';
dotenv.config({ quiet: true });

export const TEST_CONFIG = {
  BASE_URL: process.env.BASE_URL || '',
  LOGIN_URL: process.env.LOGIN_URL || '',
  HOME_URL: process.env.HOME_URL || '',
  USERNAME: process.env.TEST_USERNAME || '',
  PASSWORD: process.env.TEST_PASSWORD || '',
  TIMEOUT: {
    SHORT: 5000,
    MEDIUM: 10000,
    LONG: 15000,
    VERY_LONG: 20000,
    TEST: 120000,
  },
};

// Validate required environment variables
const requiredEnvVars = ['TEST_USERNAME', 'TEST_PASSWORD'] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
