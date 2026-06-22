import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/v1', routes);

app.get('/', (_req, res) => res.send('Student Bio-Data API'));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening on ${port}`));
