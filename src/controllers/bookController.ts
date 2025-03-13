// src/controllers/bookController.ts
import { Request, Response } from 'express';
import bookService from '../services/bookService';

/**
 * Create a new book
 */
export const createBook = async (req: Request, res: Response) => {
  try {
    const { title, author, genre, publishedYear } = req.body;

    const newBook = await bookService.createBook(
      title,
      author,
      genre,
      Number(publishedYear),
    );

    res.status(201).json({
      message: 'Book created successfully',
      book: newBook,
    });
  } catch (error: any) {
    console.error('Create book error:', error);
    res
      .status(500)
      .json({ message: error.message || 'Server error while creating book' });
  }
};

/**
 * Get all books with pagination
 */
export const getAllBooks = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const { books, total } = await bookService.getAllBooks(page, limit);

    res.json({
      books,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error: any) {
    console.error('Get books error:', error);
    res
      .status(500)
      .json({ message: error.message || 'Server error while fetching books' });
  }
};

/**
 * Get a book by ID
 */
export const getBookById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const book = await bookService.getBookById(id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ book });
  } catch (error: any) {
    console.error('Get book by ID error:', error);
    res
      .status(500)
      .json({ message: error.message || 'Server error while fetching book' });
  }
};

/**
 * Update a book
 */
export const updateBook = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { title, author, genre, publishedYear } = req.body;

    const updatedBook = await bookService.updateBook(
      id,
      title,
      author,
      genre,
      Number(publishedYear),
    );

    res.json({
      message: 'Book updated successfully',
      book: updatedBook,
    });
  } catch (error: any) {
    console.error('Update book error:', error);
    res
      .status(500)
      .json({ message: error.message || 'Server error while updating book' });
  }
};

/**
 * Delete a book
 */
export const deleteBook = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const message = await bookService.deleteBook(id);

    res.json({ message });
  } catch (error: any) {
    console.error('Delete book error:', error);
    res
      .status(500)
      .json({ message: error.message || 'Server error while deleting book' });
  }
};

/**
 * Search books by title or author
 */
export const searchBooks = async (req: Request, res: Response) => {
  try {
    const query = String(req.query.q || '');
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const { books, total } = await bookService.searchBooks(query, page, limit);

    res.json({
      books,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error: any) {
    console.error('Search books error:', error);
    res
      .status(500)
      .json({ message: error.message || 'Server error while searching books' });
  }
};

/**
 * Get most frequently borrowed books
 */
export const getMostBorrowedBooks = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 10;

    const mostBorrowedBooks = await bookService.getMostBorrowedBooks(limit);

    res.json({ mostBorrowedBooks });
  } catch (error: any) {
    console.error('Most borrowed books error:', error);
    res
      .status(500)
      .json({
        message:
          error.message || 'Server error while fetching most borrowed books',
      });
  }
};
