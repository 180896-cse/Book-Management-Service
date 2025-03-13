import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class BookService {
  /**
   * Create a new book
   */
  createBook = async (
    title: string,
    author: string,
    genre: string,
    publishedYear: number,
  ) => {
    try {
      const newBook = await prisma.book.create({
        data: {
          title,
          author,
          genre,
          publishedYear,
        },
      });

      return newBook;
    } catch (error) {
      throw new Error('Error while creating book');
    }
  };

  /**
   * Get all books with pagination
   */
  getAllBooks = async (page: number, limit: number) => {
    try {
      const skip = (page - 1) * limit;

      const books = await prisma.book.findMany({
        skip,
        take: limit,
        orderBy: { title: 'asc' },
      });

      const total = await prisma.book.count();

      return { books, total };
    } catch (error) {
      throw new Error('Error while fetching books');
    }
  };

  /**
   * Get a book by ID
   */
  getBookById = async (id: number) => {
    try {
      const book = await prisma.book.findUnique({
        where: { id },
      });

      return book;
    } catch (error) {
      throw new Error('Error while fetching book');
    }
  };

  /**
   * Update a book
   */
  updateBook = async (
    id: number,
    title: string,
    author: string,
    genre: string,
    publishedYear: number,
  ) => {
    try {
      const book = await prisma.book.findUnique({
        where: { id },
      });

      if (!book) {
        throw new Error('Book not found');
      }

      const updatedBook = await prisma.book.update({
        where: { id },
        data: {
          title,
          author,
          genre,
          publishedYear,
        },
      });

      return updatedBook;
    } catch (error) {
      throw new Error('Error while updating book');
    }
  };

  /**
   * Delete a book
   */
  deleteBook = async (id: number) => {
    try {
      const book = await prisma.book.findUnique({
        where: { id },
      });

      if (!book) {
        throw new Error('Book not found');
      }

      const activeBorrowings = await prisma.borrowing.count({
        where: {
          bookId: id,
          isReturned: false,
        },
      });

      if (activeBorrowings > 0) {
        throw new Error('Cannot delete book that is currently borrowed');
      }

      await prisma.book.delete({
        where: { id },
      });

      return 'Book deleted successfully';
    } catch (error) {
      throw new Error('Error while deleting book');
    }
  };

  /**
   * Search books by title or author
   */
  searchBooks = async (query: string, page: number, limit: number) => {
    try {
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

      return { books, total };
    } catch (error) {
      throw new Error('Error while searching books');
    }
  };

  /**
   * Get most frequently borrowed books
   */
  getMostBorrowedBooks = async (limit: number) => {
    try {
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

      const bookIds = mostBorrowedBooks.map((item: any) => item.bookId);

      const booksData = await prisma.book.findMany({
        where: {
          id: { in: bookIds },
        },
      });

      const result = mostBorrowedBooks.map((item: any) => {
        const bookData = booksData.find((book: any) => book.id === item.bookId);
        return {
          book: bookData,
          borrowCount: item._count.bookId,
        };
      });

      return result;
    } catch (error) {
      throw new Error('Error while fetching most borrowed books');
    }
  };
}

const bookService = new BookService();
export default bookService;
