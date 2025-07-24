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

// --- THE FIX IS HERE: Create a whitelist of allowed domains ---
const allowedOrigins = [
    'http://localhost:5173',                // Your local dev frontend
    'https://the-new-job-portal.vercel.app/' // Your deployed Vercel frontend
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
};

// --- Global Middlewares ---
app.use(cors(corsOptions)); // Use the new, more flexible CORS options

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json({ limit: '10kb' }));

// --- Routes ---
app.get('/', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Job Portal API is live and running!' });
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