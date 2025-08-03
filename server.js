// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/portfolio.js';
import config from './config/config.js';

// Load environment variables
dotenv.config();

// Connect to Database

const app = express();



const corsOptions = {
  origin: 'http://localhost:5173', // ✅ exact frontend domain
  credentials: true, // ✅ allow cookies to be sent
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
// Cookie Parser Middleware
app.use(cookieParser());

// Body Parser Middleware
app.use(express.json());

// --- API Routes ---
app.get('/', (req, res) => res.send('MindCare API Running'));
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', chatRoutes);


// --- Start Server ---
const PORT = config.port || process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
