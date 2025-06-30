require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'Update_naatacademy',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Successfully connected to the database');
    connection.release();
});

// Routes
const articleRoutes = require('./routes/articleRoutes');
const writerRoutes = require('./routes/writerRoutes');
const bookRoutes = require('./routes/bookRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const groupRoutes = require('./routes/groupRoutes');
const kalaamRoutes = require('./routes/kalaamRoutes');
const sectionRoutes = require('./routes/sectionRoutes');
const topicRoutes = require('./routes/topicRoutes');

// Apply routes
app.use('/api/articles', articleRoutes);
app.use('/api/writers', writerRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/kalaam', kalaamRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/topics', topicRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 