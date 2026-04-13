import { ApiError } from '../utils/ApiError.js';

/**
 * Generic Zod validation middleware factory.
 * Usage: validate(myZodSchema) — validates req.body by default
 *
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} source
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(ApiError.badRequest('Validation failed', details));
    }
    // Attach coerced & defaulted data
    req[source] = result.data;
    next();
  };
}
