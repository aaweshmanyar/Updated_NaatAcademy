const mysql = require('mysql2');
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'Update_naatacademy',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

exports.getAllArticles = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM article WHERE IsDeleted = 0');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ message: 'Error fetching articles', error: error.message });
    }
};

exports.getArticleById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM article WHERE ArticleID = ? AND IsDeleted = 0', [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Article not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching article:', error);
        res.status(500).json({ message: 'Error fetching article', error: error.message });
    }
};

exports.searchArticles = async (req, res) => {
    try {
        const searchTerm = `%${req.query.term}%`;
        const [rows] = await pool.query(
            'SELECT * FROM article WHERE (Title LIKE ? OR ContentUrdu LIKE ? OR ContentEnglish LIKE ?) AND IsDeleted = 0',
            [searchTerm, searchTerm, searchTerm]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error searching articles:', error);
        res.status(500).json({ message: 'Error searching articles', error: error.message });
    }
};

exports.createArticle = async (req, res) => {
    try {
        console.log('Received article data:', req.body);

        // Required fields validation
        const requiredFields = ['Title', 'WriterID', 'CategoryID'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            console.log('Missing required fields:', missingFields);
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields: missingFields
            });
        }

        // Convert string IDs to numbers if they're strings
        const writerId = parseInt(req.body.WriterID);
        const categoryId = parseInt(req.body.CategoryID);
        const groupId = req.body.GroupID ? parseInt(req.body.GroupID) : null;
        const sectionId = req.body.SectionID ? parseInt(req.body.SectionID) : null;

        if (isNaN(writerId) || isNaN(categoryId)) {
            return res.status(400).json({
                message: 'Invalid ID format',
                error: 'WriterID and CategoryID must be valid numbers'
            });
        }

        // Prepare the insert query with all possible fields
        const query = `
            INSERT INTO article (
                Title,
                WriterID,
                WriterName,
                CategoryID,
                CategoryName,
                ThumbnailURL,
                ContentUrdu,
                ContentEnglish,
                GroupID,
                GroupName,
                SectionID,
                SectionName,
                IsDeleted
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Extract values from request body with fallbacks for optional fields
        const values = [
            req.body.Title,
            writerId,
            req.body.WriterName || null,
            categoryId,
            req.body.CategoryName || null,
            req.body.ThumbnailURL || null,
            req.body.ContentUrdu || null,
            req.body.ContentEnglish || null,
            groupId,
            req.body.GroupName || null,
            sectionId,
            req.body.SectionName || null,
            0  // IsDeleted defaults to 0 (false)
        ];

        console.log('Executing query with values:', values);

        // Execute the insert query
        const [result] = await pool.query(query, values);

        console.log('Insert result:', result);

        // Return success response with the new article ID
        res.status(201).json({
            message: 'Article created successfully',
            articleId: result.insertId,
            success: true
        });

    } catch (error) {
        console.error('Error creating article:', error);
        console.error('Error details:', {
            code: error.code,
            errno: error.errno,
            sqlMessage: error.sqlMessage,
            sqlState: error.sqlState,
            sql: error.sql
        });
        
        // Send a more detailed error response
        res.status(500).json({
            message: 'Error creating article',
            error: error.message,
            sqlError: error.sqlMessage,
            success: false
        });
    }
};

// Get all user details
exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Article');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Article WHERE id = ?', [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
};

// Search users by title or content
exports.searchUsers = async (req, res) => {
    try {
        const searchTerm = `%${req.query.term}%`;
        const [rows] = await pool.query(
            'SELECT * FROM Article WHERE title LIKE ? OR content LIKE ?',
            [searchTerm, searchTerm]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ message: 'Error searching users', error: error.message });
    }
}; 