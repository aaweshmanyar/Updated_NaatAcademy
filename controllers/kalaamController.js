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

// Get all kalaam entries
exports.getAllKalaam = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM kalaam');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching kalaam:', error);
        res.status(500).json({ message: 'Error fetching kalaam', error: error.message });
    }
};

// Get kalaam by ID
exports.getKalaamById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM kalaam WHERE id = ?', [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Kalaam not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching kalaam:', error);
        res.status(500).json({ message: 'Error fetching kalaam', error: error.message });
    }
};

// Search kalaam
exports.searchKalaam = async (req, res) => {
    try {
        const searchTerm = `%${req.query.term}%`;
        const [rows] = await pool.query(
            'SELECT * FROM kalaam WHERE title LIKE ? OR content LIKE ?',
            [searchTerm, searchTerm]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error searching kalaam:', error);
        res.status(500).json({ message: 'Error searching kalaam', error: error.message });
    }
}; 