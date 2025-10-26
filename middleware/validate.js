const Joi = require('joi');

/**
 * Validate registration body middleware
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
exports.validateRegistration = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

/**
 * Validate wardrobe item body middleware
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
exports.validateWardrobeItem = (req, res, next) => {
  const schema = Joi.object({
    garmentType: Joi.string().min(2).required(),
    color: Joi.string().optional(),
    season: Joi.string().optional(),
    pattern: Joi.string().optional(),
    fabric: Joi.string().optional(),
    formality: Joi.string().optional(),
    imageUrl: Joi.string().uri().optional(),
    status: Joi.string().valid('active', 'archived').optional()
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};
