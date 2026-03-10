import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRoute from './routes/userRoute.js';
import doctorRoute from './routes/doctorRoute.js';
import adminRoute from './routes/adminRoute.js';
import prescriptionRoute from './routes/prescriptionRoute.js';
import reviewRoute from './routes/reviewRoute.js';
import historyRoute from './routes/historyRoute.js';
import healthRoute from './routes/healthRoute.js';
import logsRoute from './routes/logsRoute.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoute);
app.use('/api/doctors', doctorRoute);
app.use('/api/admins', adminRoute);
app.use('/api/prescription', prescriptionRoute);
app.use('/api/reviews', reviewRoute);
app.use('/api/history', historyRoute);
app.use('/api/healthmetrics', healthRoute);
app.use('/api/doctorlogs', logsRoute);

// Basic route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
