import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodType } from 'zod';

type SchemaMap = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

export function validate(schemas: SchemaMap) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        }));
        return res.status(400).json({ errors });
      }
      return res.status(400).json({ error: err instanceof Error ? err.message : 'Invalid input' });
    }
  };
}
