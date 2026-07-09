import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { notFound, errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

app.get('/', (_req, res) => res.send('Student Bio-Data API'));

app.use('/api/v1', routes);

// 404
app.use(notFound);

// Error handler
app.use(errorHandler);

export default app;
