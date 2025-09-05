// Domain repositories define contracts for data access
// They should be technology-agnostic and focus on business concepts

export interface IDomainRepository<TEntity, TId> {
  findById(id: TId): Promise<TEntity | null>;
  findAll(): Promise<TEntity[]>;
  save(entity: TEntity): Promise<TEntity>;
  delete(id: TId): Promise<void>;
}

// Example usage:
// export interface IUserRepository extends IDomainRepository<User, string> {
//   findByEmail(email: string): Promise<User | null>;
//   findActiveUsers(): Promise<User[]>;
// }