require('dotenv').config();
const express = require('express');
const db = require('./db/db');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const postRoutes = require('./routes/postRoutes.js');
const storyRoutes = require('./routes/storyRoutes.js');

const app = express();
const PORT = process.env.PORT || 3000;




const corsOptions = {
    origin: 'http://localhost:3001', // <--- IMPORTANT: Replace with your actual frontend URL if different
    credentials: true, // Allow cookies/auth headers to be sent
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
};
app.use(cors(corsOptions));



app.use(express.json());

async function testDbConnection() {
    try {
        const result = await db.query('SELECT NOW() AS current_db_time');
        console.log('[DB Test]: Connection successful. Time from DB:', result.rows[0].current_db_time);
    } catch (error) {
        console.error('[DB Test]: Connection FAILED. Check credentials and server status.');
        console.error('Error details:', error.message);
        // process.exit(1);
    }
}


app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to the Social Media Backend API!',
        database_status: 'Connected and Ready'
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/stories', storyRoutes);

app.listen(PORT, () => {
    console.log(`\n======================================`);
    console.log(`Server is running on port: ${PORT}`);
    console.log(`Access at: http://localhost:${PORT}`);
    console.log(`======================================`);

    testDbConnection();
});