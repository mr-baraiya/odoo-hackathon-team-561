// const { validate } = require('express-validation');
const Joi = require('joi');

// exports.validate = (schema) => validate(schema, { context: true });

function ValidationError(details) {
  this.name = 'ValidationError';
  this.message = 'Validation Error';
  this.isJoi = true;
  this.details = details;
}

ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = ValidationError;

const validate = (schema) => (req, res, next) => {
  req.body = req.body || {};

  Object.keys(schema).forEach((key) => {

    const { error, value } = key === 'query' ? schema[key].validate(req.customQuery) : schema[key].validate(req[key]);

    if (error) {
      const details = { [key]: {} };

      error.details.forEach((detail) => {
        details[key][detail.path[0]] = detail.message;
      });

      throw new ValidationError(details);
    }

    if (key === 'query') req.customQuery = value;
    else req[key] = value;

  });

  next();
};

module.exports = { validate, ValidationError, Joi };
