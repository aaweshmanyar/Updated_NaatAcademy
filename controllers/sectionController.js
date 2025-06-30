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

// Get all sections
exports.getAllSections = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM section');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching sections:', error);
        res.status(500).json({ message: 'Error fetching sections', error: error.message });
    }
};

// Get section by ID
exports.getSectionById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM section WHERE id = ?', [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Section not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching section:', error);
        res.status(500).json({ message: 'Error fetching section', error: error.message });
    }
};

// Search sections
exports.searchSections = async (req, res) => {
    try {
        const searchTerm = `%${req.query.term}%`;
        const [rows] = await pool.query(
            'SELECT * FROM section WHERE name LIKE ? OR description LIKE ?',
            [searchTerm, searchTerm]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error searching sections:', error);
        res.status(500).json({ message: 'Error searching sections', error: error.message });
    }
}; 