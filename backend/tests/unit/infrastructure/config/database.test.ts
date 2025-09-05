import { expect } from 'chai';
import { databaseConfig, DatabaseConfig } from '../../../../src/infrastructure/config/database';

describe('Database Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Store original environment variables
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  describe('DatabaseConfig interface', () => {
    it('should have all required properties', () => {
      expect(databaseConfig).to.have.property('host');
      expect(databaseConfig).to.have.property('port');
      expect(databaseConfig).to.have.property('database');
      expect(databaseConfig).to.have.property('username');
      expect(databaseConfig).to.have.property('password');
    });

    it('should have correct types for all properties', () => {
      expect(databaseConfig.host).to.be.a('string');
      expect(databaseConfig.port).to.be.a('number');
      expect(databaseConfig.database).to.be.a('string');
      expect(databaseConfig.username).to.be.a('string');
      expect(databaseConfig.password).to.be.a('string');
    });
  });

  describe('default values', () => {
    beforeEach(() => {
      // Clear all database-related environment variables
      delete process.env.DB_HOST;
      delete process.env.DB_PORT;
      delete process.env.DB_NAME;
      delete process.env.DB_USER;
      delete process.env.DB_PASSWORD;
      
      // Re-require the module to get fresh config
      delete require.cache[require.resolve('../../../../src/infrastructure/config/database')];
    });

    it('should use default host when DB_HOST is not set', () => {
      const { databaseConfig } = require('../../../../src/infrastructure/config/database');
      expect(databaseConfig.host).to.equal('localhost');
    });

    it('should use default port when DB_PORT is not set', () => {
      const { databaseConfig } = require('../../../../src/infrastructure/config/database');
      expect(databaseConfig.port).to.equal(5432);
    });

    it('should use default database name when DB_NAME is not set', () => {
      const { databaseConfig } = require('../../../../src/infrastructure/config/database');
      expect(databaseConfig.database).to.equal('atilio_db');
    });

    it('should use default username when DB_USER is not set', () => {
      const { databaseConfig } = require('../../../../src/infrastructure/config/database');
      expect(databaseConfig.username).to.equal('postgres');
    });

    it('should use default password when DB_PASSWORD is not set', () => {
      const { databaseConfig } = require('../../../../src/infrastructure/config/database');
      expect(databaseConfig.password).to.equal('postgres');
    });
  });

  describe('environment variable overrides', () => {
    beforeEach(() => {
      // Set custom environment variables
      process.env.DB_HOST = 'custom-host';
      process.env.DB_PORT = '3306';
      process.env.DB_NAME = 'custom_db';
      process.env.DB_USER = 'custom_user';
      process.env.DB_PASSWORD = 'custom_password';
      
      // Re-require the module to get fresh config
      delete require.cache[require.resolve('../../../../src/infrastructure/config/database')];
    });

    it('should use DB_HOST environment variable when set', () => {
      const { databaseConfig } = require('../../../../src/infrastructure/config/database');
      expect(databaseConfig.host).to.equal('custom-host');
    });

    it('should use DB_PORT environment variable when set', () => {
      const { databaseConfig } = require('../../../../src/infrastructure/config/database');
      expect(databaseConfig.port).to.equal(3306);
    });

    it('should use DB_NAME environment variable when set', () => {
      const { databaseConfig } = require('../../../../src/infrastructure/config/database');
      expect(databaseConfig.database).to.equal('custom_db');
    });

    it('should use DB_USER environment variable when set', () => {
      const { databaseConfig } = require('../../../../src/infrastructure/config/database');
      expect(databaseConfig.username).to.equal('custom_user');
    });

    it('should use DB_PASSWORD environment variable when set', () => {
      const { databaseConfig } = require('../../../../src/infrastructure/config/database');
      expect(databaseConfig.password).to.equal('custom_password');
    });
  });

  describe('port parsing', () => {
    beforeEach(() => {
      delete require.cache[require.resolve('../../../../src/infrastructure/config/database')];
    });

    it('should parse valid numeric port strings', () => {
      process.env.DB_PORT = '8080';
      const { databaseConfig } = require('../../../../src/infrastructure/config/database');
      expect(databaseConfig.port).to.equal(8080);
    });

    it('should handle invalid port strings by returning NaN', () => {
      process.env.DB_PORT = 'invalid-port';
      const { databaseConfig } = require('../../../../src/infrastructure/config/database');
      expect(databaseConfig.port).to.be.NaN;
    });

    it('should handle empty port string', () => {
      process.env.DB_PORT = '';
      const { databaseConfig } = require('../../../../src/infrastructure/config/database');
      expect(databaseConfig.port).to.equal(5432); // Should use default
    });
  });

  describe('configuration object structure', () => {
    it('should be a valid DatabaseConfig object', () => {
      const config: DatabaseConfig = databaseConfig;
      expect(config).to.be.an('object');
    });

    it('should not have extra properties', () => {
      const expectedKeys = ['host', 'port', 'database', 'username', 'password'];
      const actualKeys = Object.keys(databaseConfig);
      expect(actualKeys).to.have.members(expectedKeys);
    });
  });

  describe('production readiness', () => {
    it('should not expose sensitive defaults in production', () => {
      // In a real production environment, we would want to ensure
      // that sensitive values like passwords are not using defaults
      if (process.env.NODE_ENV === 'production') {
        expect(databaseConfig.password).to.not.equal('postgres');
        expect(databaseConfig.username).to.not.equal('postgres');
      }
    });

    it('should have valid port range', () => {
      if (!isNaN(databaseConfig.port)) {
        expect(databaseConfig.port).to.be.at.least(1);
        expect(databaseConfig.port).to.be.at.most(65535);
      }
    });

    it('should have non-empty required fields', () => {
      expect(databaseConfig.host).to.have.length.greaterThan(0);
      expect(databaseConfig.database).to.have.length.greaterThan(0);
      expect(databaseConfig.username).to.have.length.greaterThan(0);
    });
  });
});