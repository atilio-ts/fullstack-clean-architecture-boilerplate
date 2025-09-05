export interface IUseCase<TRequest, TResponse> {
  execute(request: TRequest): Promise<TResponse>;
}

// Example usage:
// export class CreateUserUseCase implements IUseCase<CreateUserRequest, UserResponse> {
//   constructor(private userRepository: IUserRepository) {}
//   
//   async execute(request: CreateUserRequest): Promise<UserResponse> {
//     // Business logic here
//   }
// }