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

// Get all topics
exports.getAllTopics = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Topic');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching topics:', error);
        res.status(500).json({ message: 'Error fetching topics', error: error.message });
    }
};

// Get topic by ID
exports.getTopicById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Topic WHERE id = ?', [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Topic not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching topic:', error);
        res.status(500).json({ message: 'Error fetching topic', error: error.message });
    }
};

// Search topics
exports.searchTopics = async (req, res) => {
    try {
        const searchTerm = `%${req.query.term}%`;
        const [rows] = await pool.query(
            'SELECT * FROM Topic WHERE title LIKE ? OR description LIKE ?',
            [searchTerm, searchTerm]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error searching topics:', error);
        res.status(500).json({ message: 'Error searching topics', error: error.message });
    }
}; 