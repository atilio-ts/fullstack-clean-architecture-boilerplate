import { Response } from 'express';
import sinon from 'sinon';

/**
 * Creates a mock Express Response object for testing controllers
 */
export function createMockResponse(): {
  res: Partial<Response>;
  statusStub: sinon.SinonStub;
  jsonStub: sinon.SinonStub;
  sendStatusStub: sinon.SinonStub;
  typeStub: sinon.SinonStub;
} {
  const jsonStub = sinon.stub();
  const sendStatusStub = sinon.stub();
  const statusStub = sinon.stub();
  const typeStub = sinon.stub();

  statusStub.returns({ json: jsonStub });

  const res: Partial<Response> = {
    status: statusStub,
    json: jsonStub,
    sendStatus: sendStatusStub,
    type: typeStub
  };

  return {
    res,
    statusStub,
    jsonStub,
    sendStatusStub,
    typeStub
  };
}

/**
 * Creates a mock Express Request object for testing
 */
export function createMockRequest(overrides: any = {}): any {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    ...overrides
  };
}

/**
 * Assertions for HTTP response testing
 */
export class HttpAssertions {
  static expectStatusCode(statusStub: sinon.SinonStub, expectedStatus: number) {
    if (!statusStub.calledWith(expectedStatus)) {
      throw new Error(`Expected status ${expectedStatus}, but got ${statusStub.firstCall?.args[0] || 'no call'}`);
    }
  }

  static expectJsonResponse(jsonStub: sinon.SinonStub, expectedData: any) {
    if (!jsonStub.calledWith(expectedData)) {
      const actualData = jsonStub.firstCall?.args[0];
      throw new Error(`Expected JSON response ${JSON.stringify(expectedData)}, but got ${JSON.stringify(actualData)}`);
    }
  }

  static expectSendStatus(sendStatusStub: sinon.SinonStub, expectedStatus: number) {
    if (!sendStatusStub.calledWith(expectedStatus)) {
      throw new Error(`Expected sendStatus ${expectedStatus}, but got ${sendStatusStub.firstCall?.args[0] || 'no call'}`);
    }
  }
}

/**
 * Time-related test utilities
 */
export class TimeTestUtils {
  static createFixedTimeTest(fixedDate: Date, testFn: () => void | Promise<void>) {
    return async () => {
      const clock = sinon.useFakeTimers(fixedDate.getTime());
      try {
        await testFn();
      } finally {
        clock.restore();
      }
    };
  }

  static expectTimestampFormat(timestamp: string) {
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    if (!isoRegex.test(timestamp)) {
      throw new Error(`Expected ISO timestamp format, got: ${timestamp}`);
    }
  }
}

/**
 * Environment variable test utilities
 */
export class EnvTestUtils {
  private originalEnv: NodeJS.ProcessEnv = {};

  saveEnv() {
    this.originalEnv = { ...process.env };
  }

  restoreEnv() {
    process.env = this.originalEnv;
  }

  setEnv(vars: Record<string, string | undefined>) {
    Object.entries(vars).forEach(([key, value]) => {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    });
  }

  clearRequireCache(modulePath: string) {
    delete require.cache[require.resolve(modulePath)];
  }
}

/**
 * Process stub utilities for testing system information
 */
export class ProcessTestUtils {
  static createMemoryUsageStub(options: {
    heapUsed?: number;
    heapTotal?: number;
    external?: number;
    rss?: number;
    arrayBuffers?: number;
  } = {}) {
    const defaults = {
      rss: 50 * 1024 * 1024,
      heapTotal: 30 * 1024 * 1024,
      heapUsed: 20 * 1024 * 1024,
      external: 5 * 1024 * 1024,
      arrayBuffers: 1 * 1024 * 1024
    };

    return sinon.stub(process, 'memoryUsage').returns({
      ...defaults,
      ...options
    });
  }

  static createUptimeStub(uptime: number = 123.45) {
    return sinon.stub(process, 'uptime').returns(uptime);
  }

  static restoreProcessStubs(...stubs: sinon.SinonStub[]) {
    stubs.forEach(stub => stub.restore());
  }
}

/**
 * Entity test utilities for domain layer testing
 */
export class EntityTestUtils {
  static expectImmutableProperty(obj: any, property: string) {
    try {
      obj[property] = 'modified';
      throw new Error(`Property ${property} should be readonly but was modified`);
    } catch (error: any) {
      if (error.message.includes('should be readonly')) {
        throw error;
      }
      // Expected error for readonly property
    }
  }

  static expectEntityEquality(entity1: any, entity2: any, shouldBeEqual: boolean) {
    const result = entity1.equals(entity2);
    if (result !== shouldBeEqual) {
      throw new Error(`Expected entities to ${shouldBeEqual ? 'be equal' : 'not be equal'}, but got ${result}`);
    }
  }
}

/**
 * Database test utilities
 */
export class DatabaseTestUtils {
  static expectValidDatabaseConfig(config: any) {
    const requiredProps = ['host', 'port', 'database', 'username', 'password'];
    const missingProps = requiredProps.filter(prop => !(prop in config));
    
    if (missingProps.length > 0) {
      throw new Error(`Database config missing properties: ${missingProps.join(', ')}`);
    }

    if (typeof config.host !== 'string') {
      throw new Error('Database host must be a string');
    }
    
    if (typeof config.port !== 'number' || isNaN(config.port)) {
      throw new Error('Database port must be a valid number');
    }
    
    if (config.port < 1 || config.port > 65535) {
      throw new Error('Database port must be between 1 and 65535');
    }
  }
}