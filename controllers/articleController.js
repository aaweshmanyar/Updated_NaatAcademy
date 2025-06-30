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
        const [rows] = await pool.query('SELECT * FROM article');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ message: 'Error fetching articles', error: error.message });
    }
};

exports.getArticleById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM article WHERE id = ?', [req.params.id]);
        
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
            'SELECT * FROM article WHERE title LIKE ? OR content LIKE ?',
            [searchTerm, searchTerm]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error searching articles:', error);
        res.status(500).json({ message: 'Error searching articles', error: error.message });
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