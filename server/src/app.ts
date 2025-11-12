import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import purchaseRoutes from './routes/purchaseRoutes';
import saleRoutes from './routes/saleRoutes';
import expenseRoutes from './routes/expenseRoutes';
import reportRoutes from './routes/reportRoutes';
import llmRoutes from './routes/llmRoutes';

export const createApp = (): Application => {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: config.cors.origin,
    credentials: true,
  }));

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging
  if (config.env === 'development') {
    app.use(morgan('dev'));
  }

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  const apiRouter = express.Router();
  apiRouter.use('/auth', authRoutes);
  apiRouter.use('/products', productRoutes);
  apiRouter.use('/purchases', purchaseRoutes);
  apiRouter.use('/sales', saleRoutes);
  apiRouter.use('/expenses', expenseRoutes);
  apiRouter.use('/reports', reportRoutes);
  apiRouter.use('/llm', llmRoutes);

  app.use('/api/v1', apiRouter);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // Error handler
  app.use(errorHandler);

  return app;
};
