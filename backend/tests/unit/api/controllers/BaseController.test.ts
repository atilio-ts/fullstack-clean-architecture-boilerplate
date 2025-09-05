import { expect } from 'chai';
import { Request, Response } from 'express';
import sinon from 'sinon';
import { BaseController } from '../../../../src/api/controllers/BaseController';

// Concrete implementation for testing
class TestController extends BaseController {
  public testOk(res: Response, dto?: any) {
    return this.ok(res, dto);
  }

  public testCreated(res: Response) {
    return this.created(res);
  }

  public testClientError(res: Response, message?: string) {
    return this.clientError(res, message);
  }

  public testUnauthorized(res: Response, message?: string) {
    return this.unauthorized(res, message);
  }

  public testForbidden(res: Response, message?: string) {
    return this.forbidden(res, message);
  }

  public testNotFound(res: Response, message?: string) {
    return this.notFound(res, message);
  }

  public testFail(res: Response, error: Error | string) {
    return this.fail(res, error);
  }
}

describe('BaseController', () => {
  let controller: TestController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusStub: sinon.SinonStub;
  let jsonStub: sinon.SinonStub;
  let sendStatusStub: sinon.SinonStub;
  let typeStub: sinon.SinonStub;

  beforeEach(() => {
    controller = new TestController();
    
    jsonStub = sinon.stub();
    sendStatusStub = sinon.stub();
    statusStub = sinon.stub();
    typeStub = sinon.stub();

    statusStub.returns({ json: jsonStub });
    
    res = {
      status: statusStub,
      json: jsonStub,
      sendStatus: sendStatusStub,
      type: typeStub
    };

    req = {};
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('ok method', () => {
    it('should return 200 with JSON data when dto is provided', () => {
      const testData = { message: 'success' };
      
      controller.testOk(res as Response, testData);

      expect(typeStub.calledWith('application/json')).to.be.true;
      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledWith(testData)).to.be.true;
    });

    it('should return 200 without data when dto is not provided', () => {
      controller.testOk(res as Response);

      expect(sendStatusStub.calledWith(200)).to.be.true;
      expect(typeStub.called).to.be.false;
      expect(jsonStub.called).to.be.false;
    });
  });

  describe('created method', () => {
    it('should return 201 status', () => {
      controller.testCreated(res as Response);

      expect(sendStatusStub.calledWith(201)).to.be.true;
    });
  });

  describe('clientError method', () => {
    it('should return 400 with custom message', () => {
      const customMessage = 'Custom bad request message';
      
      controller.testClientError(res as Response, customMessage);

      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.calledWith({ message: customMessage })).to.be.true;
    });

    it('should return 400 with default message when no message provided', () => {
      controller.testClientError(res as Response);

      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Bad request' })).to.be.true;
    });
  });

  describe('unauthorized method', () => {
    it('should return 401 with custom message', () => {
      const customMessage = 'Custom unauthorized message';
      
      controller.testUnauthorized(res as Response, customMessage);

      expect(statusStub.calledWith(401)).to.be.true;
      expect(jsonStub.calledWith({ message: customMessage })).to.be.true;
    });

    it('should return 401 with default message when no message provided', () => {
      controller.testUnauthorized(res as Response);

      expect(statusStub.calledWith(401)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Unauthorized' })).to.be.true;
    });
  });

  describe('forbidden method', () => {
    it('should return 403 with custom message', () => {
      const customMessage = 'Custom forbidden message';
      
      controller.testForbidden(res as Response, customMessage);

      expect(statusStub.calledWith(403)).to.be.true;
      expect(jsonStub.calledWith({ message: customMessage })).to.be.true;
    });

    it('should return 403 with default message when no message provided', () => {
      controller.testForbidden(res as Response);

      expect(statusStub.calledWith(403)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Forbidden' })).to.be.true;
    });
  });

  describe('notFound method', () => {
    it('should return 404 with custom message', () => {
      const customMessage = 'Custom not found message';
      
      controller.testNotFound(res as Response, customMessage);

      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWith({ message: customMessage })).to.be.true;
    });

    it('should return 404 with default message when no message provided', () => {
      controller.testNotFound(res as Response);

      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Not found' })).to.be.true;
    });
  });

  describe('fail method', () => {
    let consoleStub: sinon.SinonStub;

    beforeEach(() => {
      consoleStub = sinon.stub(console, 'log');
    });

    afterEach(() => {
      consoleStub.restore();
    });

    it('should return 500 and log error when Error object is provided', () => {
      const error = new Error('Test error');
      
      controller.testFail(res as Response, error);

      expect(consoleStub.calledWith(error)).to.be.true;
      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Internal server error' })).to.be.true;
    });

    it('should return 500 and log error when string is provided', () => {
      const errorMessage = 'Test error string';
      
      controller.testFail(res as Response, errorMessage);

      expect(consoleStub.calledWith(errorMessage)).to.be.true;
      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Internal server error' })).to.be.true;
    });
  });
});