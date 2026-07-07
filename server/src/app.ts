import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { notFound, errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/v1', routes);

// 404
app.use(notFound);

// Error handler
app.use(errorHandler);

app.get('/', (_req, res) => res.send('Student Bio-Data API'));

export default app;
