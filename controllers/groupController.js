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
        const [rows] = await pool.query('SELECT * FROM `group`');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ message: 'Error fetching groups', error: error.message });
    }
};

// Get group by ID
exports.getGroupById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM `group` WHERE GroupID = ?', [req.params.id]);
        
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
            'SELECT * FROM `group` WHERE GroupName LIKE ? OR GroupDescription LIKE ?',
            [searchTerm, searchTerm]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error searching groups:', error);
        res.status(500).json({ message: 'Error searching groups', error: error.message });
    }
};

exports.createGroup = async (req, res) => {
    try {
        // Required fields validation
        const requiredFields = ['GroupName'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields: missingFields
            });
        }

        // Prepare the insert query with all possible fields
        const query = `
            INSERT INTO \`group\` (
                GroupName,
                GroupDescription
            ) VALUES (?, ?)
        `;

        // Extract values from request body with fallbacks for optional fields
        const values = [
            req.body.GroupName,
            req.body.GroupDescription || null
        ];

        // Execute the insert query
        const [result] = await pool.query(query, values);

        // Return success response with the new group ID
        res.status(201).json({
            message: 'Group created successfully',
            groupId: result.insertId,
            success: true
        });

    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({
            message: 'Error creating group',
            error: error.message,
            success: false
        });
    }
}; 