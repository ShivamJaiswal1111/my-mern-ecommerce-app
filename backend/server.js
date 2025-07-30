import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js'; // Ensure this import is here
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(express.json()); // Body parser for JSON data (parses incoming JSON request bodies)
app.use(cors()); // Enable CORS for all origins

// Serve static files from the 'uploads' folder
// This makes files in 'backend/uploads' accessible via URLs like http://0.0.0.0:5001/uploads/filename.jpg
app.use('/uploads', express.static('uploads')); // <--- KEEP ONLY THIS ONE INSTANCE

// Custom Error Handling for JSON parsing errors specifically
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Bad JSON received:', err.message);
    console.error('Request URL:', req.originalUrl);
    console.error('Request Method:', req.method);
    return res.status(400).send({ message: 'Invalid JSON payload in request' });
  }
  next(err);
});

// API Routes - These are your actual application routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes); // <--- THIS LINE IS NOW CORRECTLY ADDED
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Basic Route (for testing if API is running, e.g., http://0.0.0.0:5001/)
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Database Connection
const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected Successfully!');
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
};

// Connect to DB and then start server
connectDB().then(() => {
    const HOST = 'localhost';
    const NEW_PORT = 5001;

    app.listen(NEW_PORT, HOST, () => {
        console.log(`Server running on http://${HOST}:${NEW_PORT}`);
    });
});