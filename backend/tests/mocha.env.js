// Configure ts-node for test environment
require('ts-node').register({
  project: 'tsconfig.test.json',
  transpileOnly: true,
  compilerOptions: {
    module: 'CommonJS',
    target: 'ES2020',
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    moduleResolution: 'node'
  }
});

// Load environment variables
require('dotenv').config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';