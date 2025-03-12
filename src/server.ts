import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';

// Route files
import bookRoutes from './routes/bookRoutes';
import borrowRoutes from './routes/borrowRoutes';
import { specs, swaggerUi } from './utils/swagger';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrowings', borrowRoutes);

// Swagger Documentation
app.use(
  '/',
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true }),
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err.stack);
    res.status(500).json({
      message: 'Something went wrong!',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  },
);
app.listen(PORT, () => {
  console.log(`Server is live Over http://localhost:${PORT}`);
});
export default app;
