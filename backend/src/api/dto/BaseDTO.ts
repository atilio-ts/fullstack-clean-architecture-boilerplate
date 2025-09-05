// Data Transfer Objects (DTOs) define the shape of data for API requests/responses
// They should contain no business logic, only data structure

export abstract class BaseDTO {
  // Base validation method that can be overridden
  validate?(): void;
}

// Example usage:
// export class CreateUserRequestDTO extends BaseDTO {
//   name!: string;
//   email!: string;
//   password!: string;
//
//   validate(): void {
//     if (!this.name || this.name.trim().length === 0) {
//       throw new Error('Name is required');
//     }
//     if (!this.email) {
//       throw new Error('Email is required');
//     }
//   }
// }
//
// export class UserResponseDTO extends BaseDTO {
//   id!: string;
//   name!: string;
//   email!: string;
//   createdAt!: Date;
// }