import { Request, Response, NextFunction } from 'express';

// Middleware interface for Express.js middlewares
export interface IMiddleware {
  handle(req: Request, res: Response, next: NextFunction): void | Promise<void>;
}

// Example usage:
// export class AuthenticationMiddleware implements IMiddleware {
//   async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
//     const token = req.headers.authorization;
//     
//     if (!token) {
//       res.status(401).json({ message: 'No token provided' });
//       return;
//     }
//
//     try {
//       // Validate token logic here
//       next();
//     } catch (error) {
//       res.status(401).json({ message: 'Invalid token' });
//     }
//   }
// }