require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://www.naatacademy.com')
  .split(',')
  .map(o => o.trim());

// Custom CORS options
const corsOptions = {
  origin: function (origin, callback) {
    // allow non-browser requests (like curl, server-to-server) which may have no origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy: Origin not allowed'));
  },
  credentials: true, // if you need cookies or auth headers
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

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

// File upload route
app.post('/api/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        // Always use https
        const imageUrl = `https://${req.get('host')}/uploads/${req.file.filename}`;
        res.json({ 
            message: 'File uploaded successfully',
            imageUrl: imageUrl
        });  
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ 
            message: 'Error uploading file',
            error: error.message
        });
    }
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
const languageRoutes = require('./routes/languageRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const Testingroute = require('./routes/TestingRoute');
const shareRoutes = require('./routes/shareRoutes');
const bazmedurood = require('./routes/bazmeDuroodRoutes')


// Apply routes
app.use('/api/articles', articleRoutes);
app.use('/api/writers', writerRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/kalaam', kalaamRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/languages', languageRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/testing', Testingroute); 
app.use('/share', shareRoutes);
app.use('/api', bazmedurood);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something broke!',
        error: err.message
    });
}); 
 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
