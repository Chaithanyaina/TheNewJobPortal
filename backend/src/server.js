import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import apiV1 from './api/index.js';
import errorHandler from './middleware/error.middleware.js';
import AppError from './utils/AppError.js';

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json({ limit: '10kb' }));

const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200
};

// --- Global Middlewares ---
app.use(cors(corsOptions));

// THE FIX IS HERE: We configure helmet to allow cross-origin resources.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json({ limit: '10kb' }));

// This line serves static files from the 'public' folder
app.use('/public', express.static('public'));

// --- Routes ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

app.use('/api/v1', apiV1);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// --- Global Error Handler ---
app.use(errorHandler);

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});