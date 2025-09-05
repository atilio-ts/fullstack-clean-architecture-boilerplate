// Domain services contain business logic that doesn't naturally fit within an entity
// They operate on domain objects and enforce business rules

export interface IDomainService {
  // Domain services should be stateless and contain pure business logic
}

// Example usage:
// export interface IPasswordService extends IDomainService {
//   hashPassword(password: string): string;
//   validatePassword(password: string, hash: string): boolean;
//   generateSecurePassword(): string;
// }
//
// export interface IPricingService extends IDomainService {
//   calculateDiscount(user: User, product: Product): number;
//   applyPromotion(order: Order, promotionCode: string): Order;
// }