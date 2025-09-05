import { Request, Response } from 'express';

export abstract class BaseController {
  protected ok<T>(res: Response, dto?: T): Response {
    if (dto) {
      res.type('application/json');
      return res.status(200).json(dto);
    } else {
      return res.sendStatus(200);
    }
  }

  protected created(res: Response): Response {
    return res.sendStatus(201);
  }

  protected clientError(res: Response, message?: string): Response {
    return res.status(400).json({
      message: message || 'Bad request'
    });
  }

  protected unauthorized(res: Response, message?: string): Response {
    return res.status(401).json({
      message: message || 'Unauthorized'
    });
  }

  protected forbidden(res: Response, message?: string): Response {
    return res.status(403).json({
      message: message || 'Forbidden'
    });
  }

  protected notFound(res: Response, message?: string): Response {
    return res.status(404).json({
      message: message || 'Not found'
    });
  }

  protected fail(res: Response, error: Error | string): Response {
    console.log(error);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
}