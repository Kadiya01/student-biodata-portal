import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

type SchemaMap = {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
};

export function validate(schemas: SchemaMap) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        (req as any).body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as any;
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as any;
      }
      return next();
    } catch (err: any) {
      const z = err?.errors || err;
      if (Array.isArray(z)) {
        const errors = z.map((e: any) => ({ path: e.path?.join('.') || e.path, message: e.message }));
        return res.status(400).json({ errors });
      }
      return res.status(400).json({ error: err?.message || 'Invalid input' });
    }
  };
}
