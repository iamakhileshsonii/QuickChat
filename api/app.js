import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware to parse cookies
app.use(cookieParser());

// CORS Options
var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200
};

// CORS Middleware
app.use(cors(corsOptions));

// Middleware to parse JSON bodies
app.use(express.json({
    limit: '16kb'
}));

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({
    limit: '16kb',
    extended: true
}));

// Middleware to serve static files
app.use(express.static('public/temp'));

// Import routes
import userRoute from './src/routes/user.route.js';
import messageRoute from './src/routes/message.route.js';
import conversationRoute from './src/routes/conversation.route.js';

// Define base URL
const baseURL = `/api/v1`;

// Use routes
app.use(`${baseURL}/user`, userRoute);
app.use(`${baseURL}/message`, messageRoute);
app.use(`${baseURL}/conversation`, conversationRoute);

export default app;
