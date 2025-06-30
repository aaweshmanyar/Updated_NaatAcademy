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
        const [rows] = await pool.query('SELECT * FROM section WHERE SectionID = ?', [req.params.id]);
        
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
            'SELECT * FROM section WHERE SectionName LIKE ? OR SectionDescription LIKE ?',
            [searchTerm, searchTerm]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error searching sections:', error);
        res.status(500).json({ message: 'Error searching sections', error: error.message });
    }
};

exports.createSection = async (req, res) => {
    try {
        // Required fields validation
        const requiredFields = ['SectionName'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields: missingFields
            });
        }

        // Prepare the insert query with all possible fields
        const query = `
            INSERT INTO section (
                SectionName,
                SectionDescription
            ) VALUES (?, ?)
        `;

        // Extract values from request body with fallbacks for optional fields
        const values = [
            req.body.SectionName,
            req.body.SectionDescription || null
        ];

        // Execute the insert query
        const [result] = await pool.query(query, values);

        // Return success response with the new section ID
        res.status(201).json({
            message: 'Section created successfully',
            sectionId: result.insertId,
            success: true
        });

    } catch (error) {
        console.error('Error creating section:', error);
        res.status(500).json({
            message: 'Error creating section',
            error: error.message,
            success: false
        });
    }
}; 