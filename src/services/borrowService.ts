import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class BorrowService {
  /**
   * Borrow books
   * @param userId - ID of the user
   * @param bookIds - Array of book IDs to borrow
   */
  borrowBooks = async (userId:number, bookIds: number[]) => {
    // Validate all books exist
    const books = await prisma.book.findMany({
      where: {
        id: { in: bookIds },
      },
    });

    if (books.length !== bookIds.length) {
      throw new Error('One or more books not found');
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
      throw new Error('Some books are already borrowed');
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

    return borrowings;
  };

  /**
   * Return borrowed books
   * @param userId - ID of the user
   * @param borrowingIds - Array of borrowing record IDs to return
   */
  returnBooks = async (userId: number, borrowingIds: number[]) => {
    // Validate all borrowings exist and belong to the user
    const borrowings = await prisma.borrowing.findMany({
      where: {
        id: { in: borrowingIds },
        userId,
      },
    });

    if (borrowings.length !== borrowingIds.length) {
      throw new Error(
        "One or more borrowing records not found or don't belong to you",
      );
    }

    // Check if any books are already returned
    const alreadyReturnedIds = borrowings
      .filter((b: any) => b.isReturned)
      .map((b: any) => b.id);

    if (alreadyReturnedIds.length > 0) {
      throw new Error('Some books are already returned');
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

    return 'Books returned successfully';
  };

  /**
   * Get all books borrowed by the current user
   * @param userId - ID of the user
   * @param returnedStatus - Optional status of the books (returned or not)
   */
  getUserBorrowings = async (
    userId: number,
    returnedStatus: boolean | undefined,
  ) => {
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

    return borrowings;
  };

  /**
   * Get borrowing statistics (admin only)
   */
  getBorrowingStats = async () => {
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

    return {
      totalBorrowings: activeBorrowings + returnedBorrowings,
      activeBorrowings,
      returnedBorrowings,
      mostActiveUsers: activeUserStats,
      mostBorrowedBooks: popularBookStats,
    };
  };
}

const borrowService = new BorrowService();
export default borrowService;
