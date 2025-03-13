import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function main() {
  console.log('Starting to seed the database...');

  // Clean up existing data
  await prisma.borrowing.deleteMany({});
  await prisma.book.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Deleted existing data');

  // Create users (admin and regular users)
  const adminPassword = await hashPassword('admin123');
  const userPassword = await hashPassword('user123');

  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      password: adminPassword,
      isAdmin: true
    }
  });

  const regularUsers = await Promise.all([
    prisma.user.create({
      data: {
        username: 'john_doe',
        password: userPassword,
        isAdmin: false
      }
    }),
    prisma.user.create({
      data: {
        username: 'jane_smith',
        password: userPassword,
        isAdmin: false
      }
    }),
    prisma.user.create({
      data: {
        username: 'bob_johnson',
        password: userPassword,
        isAdmin: false
      }
    })
  ]);

  console.log(`Created ${regularUsers.length + 1} users`);

  // Book genres
  const genres = [
    'Science Fiction',
    'Fantasy',
    'Mystery',
    'Thriller',
    'Romance',
    'Historical Fiction',
    'Non-fiction',
    'Biography',
    'Self-help',
    'Horror'
  ];

  // Create dummy books
  const books = [];
  const bookTitles = [
    'The Lost City',
    'Midnight Dreams',
    'The Silent Echo',
    'Beyond the Horizon',
    'Whispers in the Dark',
    'The Last Guardian',
    'Eternal Flames',
    'Shadows of the Past',
    'The Forgotten Path',
    'Echoes of Tomorrow',
    'The Hidden Truth',
    'Secrets of the Universe',
    'The Broken Promise',
    'Destiny\'s Call',
    'The Enchanted Forest',
    'Voices in the Wind',
    'The Mysterious Island',
    'Chronicles of Time',
    'The Final Frontier',
    'Whispers of the Heart',
    'The Ancient Relic',
    'Legends of the Fallen',
    'The Golden Key',
    'Tears of the Moon',
    'The Immortal Quest',
    'Realms of Magic',
    'The Distant Shore',
    'Shadows of Doubt',
    'The Endless Journey',
    'Fragments of Memory',
    'The Crystal Cave',
    'Guardians of the Galaxy',
    'The Silent Witness',
    'Dreams of Paradise',
    'The Emerald City',
    'Visions of the Future',
    'The Crimson Sky',
    'Tales of Courage',
    'The Sapphire Sea',
    'Chronicles of Heroes'
  ];

  const authors = [
    'J.K. Rowling',
    'Stephen King',
    'George R.R. Martin',
    'Jane Austen',
    'Ernest Hemingway',
    'Agatha Christie',
    'Mark Twain',
    'Harper Lee',
    'F. Scott Fitzgerald',
    'Charles Dickens'
  ];

  for (let i = 0; i < 40; i++) {
    const title = bookTitles[i];
    const author = authors[Math.floor(Math.random() * authors.length)];
    const genre = genres[Math.floor(Math.random() * genres.length)];
    const publishedYear = Math.floor(Math.random() * (2024 - 1900 + 1)) + 1900;

    const book = await prisma.book.create({
      data: {
        title,
        author,
        genre,
        publishedYear
      }
    });

    books.push(book);
  }

  console.log(`Created ${books.length} books`);

  // Create borrowing records
  const borrowings = [];
  // User 1 borrows 3 books
  for (let i = 0; i < 3; i++) {
    const borrowing = await prisma.borrowing.create({
      data: {
        userId: regularUsers[0].id,
        bookId: books[i].id,
        borrowDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        isReturned: false
      }
    });
    borrowings.push(borrowing);
  }

  // User 2 borrows 5 books and returns 2
  for (let i = 3; i < 8; i++) {
    const isReturned = i < 5;
    const borrowDate = new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000);
    const returnDate = isReturned ? new Date(borrowDate.getTime() + Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000) : null;
    
    const borrowing = await prisma.borrowing.create({
      data: {
        userId: regularUsers[1].id,
        bookId: books[i].id,
        borrowDate,
        returnDate,
        isReturned
      }
    });
    borrowings.push(borrowing);
  }

  // User 3 borrows 4 books and returns all
  for (let i = 8; i < 12; i++) {
    const borrowDate = new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000);
    const returnDate = new Date(borrowDate.getTime() + Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000);
    
    const borrowing = await prisma.borrowing.create({
      data: {
        userId: regularUsers[2].id,
        bookId: books[i].id,
        borrowDate,
        returnDate,
        isReturned: true
      }
    });
    borrowings.push(borrowing);
  }

  console.log(`Created ${borrowings.length} borrowing records`);
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });