import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Create a new book
 */
export const createBook = async (req: Request, res: Response) => {
  try {
    const { title, author, genre, publishedYear } = req.body;

    const newBook = await prisma.book.create({
      data: {
        title,
        author,
        genre,
        publishedYear: Number(publishedYear),
      },
    });

    res.status(201).json({
      message: 'Book created successfully',
      book: newBook,
    });
  } catch (error) {
    console.error('Create book error:', error);
    res.status(500).json({ message: 'Server error while creating book' });
  }
};

/**
 * Get all books with pagination
 */
export const getAllBooks = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const books = await prisma.book.findMany({
      skip,
      take: limit,
      orderBy: { title: 'asc' },
    });

    const total = await prisma.book.count();

    res.json({
      books,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ message: 'Server error while fetching books' });
  }
};

/**
 * Get a book by ID
 */
export const getBookById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ book });
  } catch (error) {
    console.error('Get book by ID error:', error);
    res.status(500).json({ message: 'Server error while fetching book' });
  }
};

/**
 * Update a book
 */
export const updateBook = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { title, author, genre, publishedYear } = req.body;

    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const updatedBook = await prisma.book.update({
      where: { id },
      data: {
        title,
        author,
        genre,
        publishedYear: Number(publishedYear),
      },
    });

    res.json({
      message: 'Book updated successfully',
      book: updatedBook,
    });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ message: 'Server error while updating book' });
  }
};

/**
 * Delete a book
 */
export const deleteBook = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if book is currently borrowed
    const activeBorrowings = await prisma.borrowing.count({
      where: {
        bookId: id,
        isReturned: false,
      },
    });

    if (activeBorrowings > 0) {
      return res.status(400).json({
        message: 'Cannot delete book that is currently borrowed',
      });
    }

    await prisma.book.delete({
      where: { id },
    });

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ message: 'Server error while deleting book' });
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
    const skip = (page - 1) * limit;

    const books = await prisma.book.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { author: { contains: query, mode: 'insensitive' } },
        ],
      },
      skip,
      take: limit,
      orderBy: { title: 'asc' },
    });

    const total = await prisma.book.count({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { author: { contains: query, mode: 'insensitive' } },
        ],
      },
    });

    res.json({
      books,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Search books error:', error);
    res.status(500).json({ message: 'Server error while searching books' });
  }
};

/**
 * Get most frequently borrowed books
 */
export const getMostBorrowedBooks = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 10;

    const mostBorrowedBooks = await prisma.borrowing.groupBy({
      by: ['bookId'],
      _count: {
        bookId: true,
      },
      orderBy: {
        _count: {
          bookId: 'desc',
        },
      },
      take: limit,
    });

    const bookIds = mostBorrowedBooks.map((item:any) => item.bookId);

    const booksData = await prisma.book.findMany({
      where: {
        id: { in: bookIds },
      },
    });

    const result = mostBorrowedBooks.map((item:any) => {
      const bookData = booksData.find((book:any) => book.id === item.bookId);
      return {
        book: bookData,
        borrowCount: item._count.bookId,
      };
    });

    res.json({ mostBorrowedBooks: result });
  } catch (error) {
    console.error('Most borrowed books error:', error);
    res
      .status(500)
      .json({ message: 'Server error while fetching most borrowed books' });
  }
};
