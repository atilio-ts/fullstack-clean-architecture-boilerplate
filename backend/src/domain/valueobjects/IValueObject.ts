// Value objects are immutable objects that represent a descriptive aspect of the domain
// They should be compared by their values, not identity

export interface IValueObject {
  equals(other: IValueObject): boolean;
}

// Example usage:
// export class Email implements IValueObject {
//   constructor(private readonly value: string) {
//     this.validate();
//   }
//
//   private validate(): void {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(this.value)) {
//       throw new Error('Invalid email format');
//     }
//   }
//
//   equals(other: IValueObject): boolean {
//     return other instanceof Email && this.value === other.value;
//   }
//
//   toString(): string {
//     return this.value;
//   }
// }