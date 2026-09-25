import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import connectDB from './config/db';
import invoiceRoutes from './routes/invoiceRoutes';

const app = express();
const PORT = process.env.PORT || 5001;

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/invoices', invoiceRoutes);

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Invoice Backend API (TypeScript) Running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
