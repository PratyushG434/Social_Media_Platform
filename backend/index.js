import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Import routes
import authRoutes from './api/auth/auth.routes.js';
import userRoutes from './api/users/user.routes.js';
import postRoutes from './api/posts/post.routes.js';
// import storyRoutes from './api/stories/story.routes.js'; // You would add this

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // To parse JSON bodies

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
// app.use('/api/stories', storyRoutes);

// Simple health check route
app.get('/', (req, res) => {
    res.send('Instagram Clone API is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});