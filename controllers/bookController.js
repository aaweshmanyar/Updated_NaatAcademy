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

// Get all books
exports.getAllBooks = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Book');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Error fetching books', error: error.message });
    }
};

// Get book by ID
exports.getBookById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Book WHERE id = ?', [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({ message: 'Error fetching book', error: error.message });
    }
};

// Search books
exports.searchBooks = async (req, res) => {
    try {
        const searchTerm = `%${req.query.term}%`;
        const [rows] = await pool.query(
            'SELECT * FROM Book WHERE title LIKE ? OR description LIKE ?',
            [searchTerm, searchTerm]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error searching books:', error);
        res.status(500).json({ message: 'Error searching books', error: error.message });
    }
}; 