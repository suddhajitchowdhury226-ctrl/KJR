const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const apiRoutes = require('./routes/api');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
// Allow requests from the production frontend, local file:// pages (null origin), and localhost
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost:5001',
      'http://localhost:5173',
      'http://localhost:5500',
      'http://127.0.0.1:5500',
      'http://127.0.0.1:3000',
      'null', // file:// pages send "null" as origin string
    ];
    // Allow requests with no origin (local file:// access, Postman, curl, etc.)
    if (!origin || origin === 'null' || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { MongoMemoryServer } = require('mongodb-memory-server');

// Connect to MongoDB
async function connectDB() {
  try {
    let dbUri = process.env.MONGODB_URI;

    // If the user hasn't put a real MongoDB connection string, use an in-memory DB for now
    if (!dbUri || dbUri.includes('YOUR_USER')) {
      console.log('Using in-memory MongoDB for local testing...');
      const mongoServer = await MongoMemoryServer.create();
      dbUri = mongoServer.getUri();
    }

    await mongoose.connect(dbUri);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}
connectDB();

// Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
