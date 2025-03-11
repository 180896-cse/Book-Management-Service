import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Borrow books
 * @param req Request object
 * @param res Response object
 */
export const borrowBooks = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userId = req.user.id;
    const { bookIds } = req.body;

    // Validate all books exist
    const books = await prisma.book.findMany({
      where: {
        id: { in: bookIds },
      },
    });

    if (books.length !== bookIds.length) {
      return res.status(400).json({ message: 'One or more books not found' });
    }

    // Check if any books are already borrowed
    const borrowedBooks = await prisma.borrowing.findMany({
      where: {
        bookId: { in: bookIds },
        isReturned: false,
      },
    });

    if (borrowedBooks.length > 0) {
      const alreadyBorrowedIds = borrowedBooks.map((b: any) => b.bookId);
      return res.status(400).json({
        message: 'Some books are already borrowed',
        alreadyBorrowedIds,
      });
    }

    // Create borrowing records
    const borrowings = await prisma.$transaction(
      bookIds.map((bookId: any) =>
        prisma.borrowing.create({
          data: {
            userId,
            bookId,
            borrowDate: new Date(),
            isReturned: false,
          },
        }),
      ),
    );

    res.status(201).json({
      message: 'Books borrowed successfully',
      borrowings,
    });
  } catch (error) {
    console.error('Borrow books error:', error);
    res.status(500).json({ message: 'Server error while borrowing books' });
  }
};

/**
 * Return borrowed books
 * @param req Request object
 * @param res Response object
 */
export const returnBooks = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userId = req.user.id;
    const { borrowingIds } = req.body;

    // Validate all borrowings exist and belong to the user
    const borrowings = await prisma.borrowing.findMany({
      where: {
        id: { in: borrowingIds },
        userId,
      },
    });

    if (borrowings.length !== borrowingIds.length) {
      return res.status(400).json({
        message:
          "One or more borrowing records not found or don't belong to you",
      });
    }

    // Check if any books are already returned
    const alreadyReturnedIds = borrowings
      .filter((b: any) => b.isReturned)
      .map((b: any) => b.id);

    if (alreadyReturnedIds.length > 0) {
      return res.status(400).json({
        message: 'Some books are already returned',
        alreadyReturnedIds,
      });
    }

    // Update borrowing records
    await prisma.$transaction(
      borrowingIds.map((id: any) =>
        prisma.borrowing.update({
          where: { id },
          data: {
            returnDate: new Date(),
            isReturned: true,
          },
        }),
      ),
    );

    res.json({ message: 'Books returned successfully' });
  } catch (error) {
    console.error('Return books error:', error);
    res.status(500).json({ message: 'Server error while returning books' });
  }
};

/**
 * Get all books borrowed by the current user
 * @param req Request object
 * @param res Response object
 */
export const getUserBorrowings = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userId = req.user.id;
    const returnedStatus =
      req.query.returned === 'true'
        ? true
        : req.query.returned === 'false'
        ? false
        : undefined;

    const borrowings = await prisma.borrowing.findMany({
      where: {
        userId,
        ...(returnedStatus !== undefined && { isReturned: returnedStatus }),
      },
      include: {
        book: true,
      },
      orderBy: { borrowDate: 'desc' },
    });

    res.json({ borrowings });
  } catch (error) {
    console.error('Get user borrowings error:', error);
    res.status(500).json({ message: 'Server error while fetching borrowings' });
  }
};

/**
 * Get borrowing statistics (admin only)
 * @param req Request object
 * @param res Response object
 */
export const getBorrowingStats = async (req: Request, res: Response) => {
  try {
    // Get total active borrowings
    const activeBorrowings = await prisma.borrowing.count({
      where: { isReturned: false },
    });

    // Get total returned borrowings
    const returnedBorrowings = await prisma.borrowing.count({
      where: { isReturned: true },
    });

    // Get most active users (users with most borrowings)
    const mostActiveUsers = await prisma.borrowing.groupBy({
      by: ['userId'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    // Get most borrowed books
    const mostBorrowedBooks = await prisma.borrowing.groupBy({
      by: ['bookId'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    // Get users data
    const userIds = mostActiveUsers.map((item: any) => item.userId);
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        username: true,
      },
    });

    // Get books data
    const bookIds = mostBorrowedBooks.map((item: any) => item.bookId);
    const books = await prisma.book.findMany({
      where: {
        id: { in: bookIds },
      },
    });

    // Prepare response
    const activeUserStats = mostActiveUsers.map((item: any) => {
      const userData = users.find((u: any) => u.id === item.userId);
      return {
        user: userData,
        borrowCount: item._count.id,
      };
    });

    const popularBookStats = mostBorrowedBooks.map((item: any) => {
      const bookData = books.find((b: any) => b.id === item.bookId);
      return {
        book: bookData,
        borrowCount: item._count.id,
      };
    });

    res.json({
      totalBorrowings: activeBorrowings + returnedBorrowings,
      activeBorrowings,
      returnedBorrowings,
      mostActiveUsers: activeUserStats,
      mostBorrowedBooks: popularBookStats,
    });
  } catch (error) {
    console.error('Get borrowing stats error:', error);
    res
      .status(500)
      .json({ message: 'Server error while fetching borrowing statistics' });
  }
};
