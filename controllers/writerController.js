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

// Get all writers
exports.getAllWriters = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Writer');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching writers:', error);
        res.status(500).json({ message: 'Error fetching writers', error: error.message });
    }
};

// Get writer by ID
exports.getWriterById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Writer WHERE id = ?', [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Writer not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching writer:', error);
        res.status(500).json({ message: 'Error fetching writer', error: error.message });
    }
};

// Search writers
exports.searchWriters = async (req, res) => {
    try {
        const searchTerm = `%${req.query.term}%`;
        const [rows] = await pool.query(
            'SELECT * FROM Writer WHERE name LIKE ? OR bio LIKE ?',
            [searchTerm, searchTerm]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error searching writers:', error);
        res.status(500).json({ message: 'Error searching writers', error: error.message });
    }
}; 