import express from 'express';
import dotenv from 'dotenv';
import { paymentRoutes } from './routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());


app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => {
  res.send('buildasLab API is running!');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
