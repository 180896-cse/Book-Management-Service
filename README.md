# Book Management API

A RESTful API for a book management system built with TypeScript, Express, Node.js, and PostgreSQL. This project implements user authentication, book management, and borrowing functionalities with comprehensive API documentation using Swagger.

## Features

- **User Management**
  - User registration and authentication
  - JWT-based token authentication
  - Role-based access control (admin and regular users)
  - Secure password storage using bcrypt
  - Encrypted user notes using AES encryption

- **Book Management**
  - Create, read, update, and delete operations for books
  - Search functionality for books by title or author
  - Pagination support for book listings

- **Borrowing System**
  - Borrow one or multiple books
  - Return borrowed books
  - Track borrowing history
  - View currently borrowed books

- **Advanced Features**
  - Comprehensive API documentation with Swagger
  - Database schema design with proper relations
  - Secure authentication and data validation
  - Statistics on most borrowed books and active users
  - Optimized database queries with proper indexing

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Password Encryption**: bcrypt
- **Data Encryption**: CryptoJS
- **API Documentation**: Swagger/OpenAPI
- **Validation**: express-validator

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or later)
- npm or yarn
- PostgreSQL

## Getting Started

Follow these steps to set up and run the project locally.

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/book-management-api.git
cd book-management-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory with the following variables:

```
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/bookmanagement?schema=public"

# Server
PORT=3000
```

Replace `username`, `password`, and other values with your own configurations.

### 4. Set up the database

Make sure your PostgreSQL server is running, then run:

```bash
# Generate Prisma client
npm run prisma:generate

# Create database tables
npm run prisma:migrate

# Seed the database with initial data
npm run db:seed
```

### 5. Build and start the server

```bash
# Build the TypeScript code
npm run build

# Start the server
npm start
```

For development with hot-reload:

```bash
npm run dev
```

## Database Seeding

The seeding script creates:
- 1 admin user with username "admin" and password "admin123"
- 3 regular users with usernames "john_doe", "jane_smith", and "bob_johnson" (password: "user123")
- 40 books with various titles, authors, and genres
- 12 borrowing records distributed among the users

To re-run the seeding process:

```bash
npm run db:seed
```

## API Documentation

After starting the server, access the Swagger UI documentation at:

```
http://localhost:3000/
```

This interactive documentation allows you to:
- Explore all available endpoints
- Test API calls directly from the browser
- View request/response formats
- Understand authentication requirements

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Authenticate a user and get token

### Users
- `GET /api/users/profile` - Get current user profile
- `POST /api/users/notes` - Save encrypted notes
- `POST /api/users/promote` - Promote a user to admin (admin only)

### Books
- `POST /api/books` - Create a new book
- `GET /api/books` - Get all books (with pagination)
- `GET /api/books/:id` - Get a book by ID
- `PUT /api/books/:id` - Update a book
- `DELETE /api/books/:id` - Delete a book
- `GET /api/books/search` - Search books by title or author
- `GET /api/books/most-borrowed` - Get most frequently borrowed books

### Borrowings
- `POST /api/borrowings/borrow` - Borrow books
- `POST /api/borrowings/return` - Return borrowed books
- `GET /api/borrowings/user` - Get user's borrowings
- `GET /api/borrowings/stats` - Get borrowing statistics (admin only)


## Security Implementation

This project implements several security best practices:

1. **Password Hashing**: All passwords are hashed using bcrypt before storage
2. **JWT Authentication**: Secure token-based authentication system
3. **Input Validation**: All API inputs are validated and sanitized
4. **Encrypted Notes**: Demonstration of text encryption/decryption using AES
5. **Role-based Access Control**: Different permissions for admins and regular users

