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

// Get all kalaams
exports.getAllKalaams = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM kalaam WHERE IsDeleted = 0');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching kalaams:', error);
        res.status(500).json({ message: 'Error fetching kalaams', error: error.message });
    }
};

// Get kalaam by ID
exports.getKalaamById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM kalaam WHERE KalaamID = ? AND IsDeleted = 0', [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Kalaam not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching kalaam:', error);
        res.status(500).json({ message: 'Error fetching kalaam', error: error.message });
    }
};

// Search kalaams
exports.searchKalaams = async (req, res) => {
    try {
        const searchTerm = `%${req.query.term}%`;
        const [rows] = await pool.query(
            `SELECT * FROM kalaam 
            WHERE (Title LIKE ? 
                OR ContentUrdu LIKE ? 
                OR ContentRomanUrdu LIKE ? 
                OR ContentArabic LIKE ? 
                OR ContentEnglish LIKE ?) 
            AND IsDeleted = 0`,
            [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error searching kalaams:', error);
        res.status(500).json({ message: 'Error searching kalaams', error: error.message });
    }
};

// Create new kalaam
exports.createKalaam = async (req, res) => {
    try {
        // Required fields validation
        const requiredFields = ['Title', 'WriterID', 'CategoryID'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields: missingFields
            });
        }

        // Prepare the insert query with all possible fields
        const query = `
            INSERT INTO Kalaam (
                Title,
                WriterID,
                WriterName,
                CategoryID,
                CategoryName,
                ContentUrdu,
                ContentRomanUrdu,
                ContentArabic,
                ContentEnglish,
                GroupID,
                GroupName,
                SectionID,
                SectionName,
                IsFeatured,
                IsSelected,
                IsDeleted
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Extract values from request body with fallbacks for optional fields
        const values = [
            req.body.Title,
            req.body.WriterID,
            req.body.WriterName || null,
            req.body.CategoryID,
            req.body.CategoryName || null,
            req.body.ContentUrdu || null,
            req.body.ContentRomanUrdu || null,
            req.body.ContentArabic || null,
            req.body.ContentEnglish || null,
            req.body.GroupID || null,
            req.body.GroupName || null,
            req.body.SectionID || null,
            req.body.SectionName || null,
            req.body.IsFeatured || 0,
            req.body.IsSelected || 0,
            0  // IsDeleted defaults to 0 (false)
        ];

        // Execute the insert query
        const [result] = await pool.query(query, values);

        // Return success response with the new kalaam ID
        res.status(201).json({
            message: 'Kalaam created successfully',
            kalaamId: result.insertId,
            success: true
        });

    } catch (error) {
        console.error('Error creating kalaam:', error);
        res.status(500).json({
            message: 'Error creating kalaam',
            error: error.message,
            success: false
        });
    }
}; 