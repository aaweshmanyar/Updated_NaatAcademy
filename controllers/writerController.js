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
        const [rows] = await pool.query('SELECT * FROM writer WHERE IsDeleted = 0');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching writers:', error);
        res.status(500).json({ message: 'Error fetching writers', error: error.message });
    }
};

// Get writer by ID
exports.getWriterById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM writer WHERE WriterID = ? AND IsDeleted = 0', [req.params.id]);
        
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
            'SELECT * FROM writer WHERE (Name LIKE ? OR Bio LIKE ?) AND IsDeleted = 0',
            [searchTerm, searchTerm]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error searching writers:', error);
        res.status(500).json({ message: 'Error searching writers', error: error.message });
    }
};

// Create new writer
exports.createWriter = async (req, res) => {
    try {
        // Required fields validation
        const requiredFields = ['Name', 'LanguageID'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields: missingFields
            });
        }

        // Prepare the insert query with all possible fields
        const query = `
            INSERT INTO writer (
                Name,
                LanguageID,
                LanguageName,
                Status,
                GroupID,
                GroupName,
                SectionID,
                SectionName,
                ProfileImageURL,
                Bio,
                IsDeleted
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Extract values from request body with fallbacks for optional fields
        const values = [
            req.body.Name,
            req.body.LanguageID,
            req.body.LanguageName || null,
            req.body.Status || null,
            req.body.GroupID || null,
            req.body.GroupName || null,
            req.body.SectionID || null,
            req.body.SectionName || null,
            req.body.ProfileImageURL || null,
            req.body.Bio || null,
            0  // IsDeleted defaults to 0 (false)
        ];

        // Execute the insert query
        const [result] = await pool.query(query, values);

        // Return success response with the new writer ID
        res.status(201).json({
            message: 'Writer created successfully',
            writerId: result.insertId,
            success: true
        });

    } catch (error) {
        console.error('Error creating writer:', error);
        res.status(500).json({
            message: 'Error creating writer',
            error: error.message,
            success: false
        });
    }
}; 