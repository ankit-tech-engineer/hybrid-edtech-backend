const { errorResponse } = require('../utils/response');

const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
  if (error) {
    const errors = error.details.map((d) => d.message);
    return errorResponse(res, 'Validation failed', 422, errors);
  }
  req[source] = value;
  next();
};

module.exports = validate;
