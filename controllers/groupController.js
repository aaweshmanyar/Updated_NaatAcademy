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

// Get all groups
exports.getAllGroups = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Groups');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ message: 'Error fetching groups', error: error.message });
    }
};

// Get group by ID
exports.getGroupById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Groups WHERE id = ?', [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Group not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching group:', error);
        res.status(500).json({ message: 'Error fetching group', error: error.message });
    }
};

// Search groups
exports.searchGroups = async (req, res) => {
    try {
        const searchTerm = `%${req.query.term}%`;
        const [rows] = await pool.query(
            'SELECT * FROM Groups WHERE name LIKE ? OR description LIKE ?',
            [searchTerm, searchTerm]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error searching groups:', error);
        res.status(500).json({ message: 'Error searching groups', error: error.message });
    }
}; 