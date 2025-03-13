import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Swagger definition
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Book Management API',
      version: '1.0.0',
      description: 'API for managing books, users, and borrowing operations',
      contact: {
        name: 'Pratap Shantanu',
        email: 'shantanupratap180896@gmail.com',
      },
    },
    servers: [
      {
        //Prod
        url: 'https://book-management-service-6awe.onrender.com',
        description: 'Production server',
        //local
        // url: 'http://localhost:3000',
        // description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'https',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            id: {
              type: 'integer',
              description: 'User ID',
            },
            username: {
              type: 'string',
              description: 'User name',
            },
            password: {
              type: 'string',
              description: 'User password',
            },
            isAdmin: {
              type: 'boolean',
              description: 'Admin status',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Update timestamp',
            },
          },
        },
        Book: {
          type: 'object',
          required: ['title', 'author', 'genre', 'publishedYear'],
          properties: {
            id: {
              type: 'integer',
              description: 'Book ID',
            },
            title: {
              type: 'string',
              description: 'Book title',
            },
            author: {
              type: 'string',
              description: 'Book author',
            },
            genre: {
              type: 'string',
              description: 'Book genre',
            },
            publishedYear: {
              type: 'integer',
              description: 'Year of publication',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Update timestamp',
            },
          },
        },
        Borrowing: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Borrowing ID',
            },
            userId: {
              type: 'integer',
              description: 'User ID',
            },
            bookId: {
              type: 'integer',
              description: 'Book ID',
            },
            borrowDate: {
              type: 'string',
              format: 'date-time',
              description: 'Borrow date',
            },
            returnDate: {
              type: 'string',
              format: 'date-time',
              description: 'Return date',
            },
            isReturned: {
              type: 'boolean',
              description: 'Return status',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.ts'], // Path to the API routes files
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
