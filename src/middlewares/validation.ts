import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

/**
 * Middleware to validate inputs and handle validation errors
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};

/**
 * User registration validation rules
 */
export const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .isAlphanumeric()
    .withMessage('Username can only contain letters and numbers'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  handleValidationErrors,
];

/**
 * Login validation rules
 */
export const loginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

/**
 * Book creation and update validation rules
 */
export const bookValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must be less than 255 characters'),

  body('author')
    .trim()
    .notEmpty()
    .withMessage('Author is required')
    .isLength({ max: 255 })
    .withMessage('Author must be less than 255 characters'),

  body('genre')
    .trim()
    .notEmpty()
    .withMessage('Genre is required')
    .isLength({ max: 100 })
    .withMessage('Genre must be less than 100 characters'),

  body('publishedYear')
    .isInt({ min: 1000, max: new Date().getFullYear() })
    .withMessage(
      `Published year must be between 1000 and ${new Date().getFullYear()}`,
    ),

  handleValidationErrors,
];

/**
 * Book ID validation rule
 */
export const bookIdValidation = [
  param('id').isInt().withMessage('Book ID must be an integer'),
  handleValidationErrors,
];

/**
 * Borrow book validation rules
 */
export const borrowBookValidation = [
  body('bookIds')
    .isArray({ min: 1 })
    .withMessage('At least one book ID is required'),

  body('bookIds.*').isInt().withMessage('Book IDs must be integers'),

  handleValidationErrors,
];

/**
 * Return book validation rules
 */
export const returnBookValidation = [
  body('borrowingIds')
    .isArray({ min: 1 })
    .withMessage('At least one borrowing ID is required'),

  body('borrowingIds.*').isInt().withMessage('Borrowing IDs must be integers'),

  handleValidationErrors,
];

/**
 * Search validation rule
 */
export const searchValidation = [
  query('q').trim().notEmpty().withMessage('Search query is required'),

  handleValidationErrors,
];

/**
 * User notes encryption/decryption validation
 */
export const notesValidation = [
  body('notes').trim().notEmpty().withMessage('Notes content is required'),

  handleValidationErrors,
];
