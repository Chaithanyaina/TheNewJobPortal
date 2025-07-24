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

// --- CORS Configuration ---
const allowedOrigins = [
    'http://localhost:5173',
    'https://the-new-job-portal.vercel.app'
];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};

// --- Global Middlewares ---
app.use(cors(corsOptions));
app.use(helmet({ crossOriginResourcePolicy: false }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body Parser - This is crucial for reading `req.body`
app.use(express.json({ limit: '10kb' }));


// --- Routes ---
app.get('/', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Job Portal API is live and running!' });
});

app.use('/api/v1', apiV1);

// --- Error Handling for unmatched routes ---
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// --- Global Error Handler ---
app.use(errorHandler);

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});