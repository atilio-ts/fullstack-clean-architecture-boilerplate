import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Configure environment for tests
process.env.NODE_ENV = 'test';