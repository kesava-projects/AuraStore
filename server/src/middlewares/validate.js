import { ZodError } from 'zod';

export function validate(schema, source = 'body') {
  return async (req, res, next) => {
    try {
      let dataToValidate;
      if (source === 'body') dataToValidate = req.body;
      else if (source === 'query') dataToValidate = req.query;
      else if (source === 'params') dataToValidate = req.params;
      else if (source === 'all') {
        dataToValidate = {
          body: req.body,
          query: req.query,
          params: req.params,
        };
      }

      const parsed = await schema.parseAsync(dataToValidate);
      if (source === 'body') req.body = parsed;
      else if (source === 'query') req.query = parsed;
      else if (source === 'params') req.params = parsed;

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message:
              details.map((d) => (d.field ? `${d.field}: ${d.message}` : d.message)).join('; ') ||
              'Validation failed',
            details,
          },
        });
      }
      next(err);
    }
  };
}
