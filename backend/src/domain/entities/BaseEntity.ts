export abstract class BaseEntity<T> {
  public readonly id: T;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(id: T) {
    this.id = id;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public equals(entity: BaseEntity<T>): boolean {
    return this.id === entity.id;
  }
}