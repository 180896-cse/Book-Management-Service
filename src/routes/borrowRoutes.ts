import express from 'express';
import * as borrowController from '../controllers/borrowController';
import { authenticate } from '../middlewares/auth';
import {
  borrowBookValidation,
  returnBookValidation,
} from '../middlewares/validation';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Borrowings
 *   description: API endpoints for managing book borrowings
 */

/**
 * @swagger
 * /api/borrowings/borrow:
 *   post:
 *     summary: Borrow one or more books
 *     tags: [Borrowings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookIds
 *             properties:
 *               bookIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of book IDs to borrow
 *                 example: [1, 2, 3]
 *     responses:
 *       201:
 *         description: Books borrowed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Books borrowed successfully
 *                 borrowings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       userId:
 *                         type: integer
 *                       bookId:
 *                         type: integer
 *                       borrowDate:
 *                         type: string
 *                         format: date-time
 *                       isReturned:
 *                         type: boolean
 *       400:
 *         description: Invalid request or books already borrowed
 *       401:
 *         description: Unauthorized - token missing or invalid
 *       500:
 *         description: Server error
 */
router.post(
  '/borrow',
  authenticate,
  borrowBookValidation,
  borrowController.borrowBooks,
);

/**
 * @swagger
 * /api/borrowings/return:
 *   post:
 *     summary: Return borrowed books
 *     tags: [Borrowings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - borrowingIds
 *             properties:
 *               borrowingIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of borrowing IDs to return
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Books returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Books returned successfully
 *       400:
 *         description: Invalid request or books already returned
 *       401:
 *         description: Unauthorized - token missing or invalid
 *       500:
 *         description: Server error
 */
router.post(
  '/return',
  authenticate,
  returnBookValidation,
  borrowController.returnBooks,
);

/**
 * @swagger
 * /api/borrowings/user:
 *   get:
 *     summary: Get all books borrowed by the current user
 *     tags: [Borrowings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: returned
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by return status (optional)
 *     responses:
 *       200:
 *         description: List of borrowings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 borrowings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       userId:
 *                         type: integer
 *                       bookId:
 *                         type: integer
 *                       borrowDate:
 *                         type: string
 *                         format: date-time
 *                       returnDate:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       isReturned:
 *                         type: boolean
 *                       book:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           title:
 *                             type: string
 *                           author:
 *                             type: string
 *                           genre:
 *                             type: string
 *                           publishedYear:
 *                             type: integer
 *       401:
 *         description: Unauthorized - token missing or invalid
 *       500:
 *         description: Server error
 */
router.get('/user', authenticate, borrowController.getUserBorrowings);

export default router;
