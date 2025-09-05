import { expect } from 'chai';
import sinon from 'sinon';
import { BaseEntity } from '../../../../src/domain/entities/BaseEntity';

// Concrete implementation for testing
class TestEntity extends BaseEntity<string> {
  public readonly name: string;

  constructor(id: string, name: string) {
    super(id);
    this.name = name;
  }
}

class NumberEntity extends BaseEntity<number> {
  constructor(id: number) {
    super(id);
  }
}

describe('BaseEntity', () => {
  let clock: sinon.SinonFakeTimers;
  const fixedDate = new Date('2023-01-01T10:00:00.000Z');

  beforeEach(() => {
    clock = sinon.useFakeTimers(fixedDate.getTime());
  });

  afterEach(() => {
    clock.restore();
  });

  describe('constructor', () => {
    it('should create entity with provided id', () => {
      const id = 'test-id-123';
      const entity = new TestEntity(id, 'Test Entity');

      expect(entity.id).to.equal(id);
    });

    it('should set createdAt to current date', () => {
      const entity = new TestEntity('id', 'Test');

      expect(entity.createdAt).to.be.instanceOf(Date);
      expect(entity.createdAt.toISOString()).to.equal(fixedDate.toISOString());
    });

    it('should set updatedAt to current date', () => {
      const entity = new TestEntity('id', 'Test');

      expect(entity.updatedAt).to.be.instanceOf(Date);
      expect(entity.updatedAt.toISOString()).to.equal(fixedDate.toISOString());
    });

    it('should work with different id types', () => {
      const stringEntity = new TestEntity('string-id', 'String Entity');
      const numberEntity = new NumberEntity(42);

      expect(stringEntity.id).to.be.a('string');
      expect(numberEntity.id).to.be.a('number');
      expect(stringEntity.id).to.equal('string-id');
      expect(numberEntity.id).to.equal(42);
    });
  });

  describe('equals method', () => {
    it('should return true when entities have same id', () => {
      const entity1 = new TestEntity('same-id', 'Entity 1');
      const entity2 = new TestEntity('same-id', 'Entity 2');

      expect(entity1.equals(entity2)).to.be.true;
    });

    it('should return false when entities have different ids', () => {
      const entity1 = new TestEntity('id-1', 'Entity 1');
      const entity2 = new TestEntity('id-2', 'Entity 2');

      expect(entity1.equals(entity2)).to.be.false;
    });

    it('should work with number ids', () => {
      const entity1 = new NumberEntity(1);
      const entity2 = new NumberEntity(1);
      const entity3 = new NumberEntity(2);

      expect(entity1.equals(entity2)).to.be.true;
      expect(entity1.equals(entity3)).to.be.false;
    });

    it('should be symmetric', () => {
      const entity1 = new TestEntity('same-id', 'Entity 1');
      const entity2 = new TestEntity('same-id', 'Entity 2');

      expect(entity1.equals(entity2)).to.equal(entity2.equals(entity1));
    });

    it('should handle comparison with different entity types having same id type', () => {
      const testEntity = new TestEntity('1', 'Test');
      const numberEntity = new NumberEntity(1);

      // This should be false because they have different id types
      // even though the values might look similar
      expect(testEntity.equals(numberEntity as any)).to.be.false;
    });
  });

  describe('immutability', () => {
    it('should have readonly properties at compile time', () => {
      const entity = new TestEntity('id', 'Test');
      const originalId = entity.id;
      const originalCreatedAt = entity.createdAt;
      const originalUpdatedAt = entity.updatedAt;

      // TypeScript readonly properties are compile-time only
      // We can verify they exist and maintain their values
      expect(entity.id).to.equal(originalId);
      expect(entity.createdAt).to.equal(originalCreatedAt);
      expect(entity.updatedAt).to.equal(originalUpdatedAt);
      
      // Verify properties are defined as expected
      expect(entity.hasOwnProperty('id')).to.be.true;
      expect(entity.hasOwnProperty('createdAt')).to.be.true;
      expect(entity.hasOwnProperty('updatedAt')).to.be.true;
    });
  });

  describe('inheritance', () => {
    it('should allow subclasses to add their own properties', () => {
      const entity = new TestEntity('id', 'Test Name');

      expect(entity.name).to.equal('Test Name');
      expect(entity.id).to.equal('id');
      expect(entity.createdAt).to.be.instanceOf(Date);
      expect(entity.updatedAt).to.be.instanceOf(Date);
    });

    it('should maintain BaseEntity behavior in subclasses', () => {
      const entity1 = new TestEntity('same-id', 'Name 1');
      const entity2 = new TestEntity('same-id', 'Name 2');

      expect(entity1.equals(entity2)).to.be.true;
    });
  });
});