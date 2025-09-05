export interface IApplicationService {
  // Application services coordinate between domain objects and infrastructure
  // They contain workflow logic but no business rules
}

// Example usage:
// export interface IUserService extends IApplicationService {
//   createUser(userData: CreateUserData): Promise<User>;
//   updateUser(id: string, userData: UpdateUserData): Promise<User>;
//   deleteUser(id: string): Promise<void>;
// }