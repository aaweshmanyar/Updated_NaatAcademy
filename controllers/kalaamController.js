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

// Helper function to generate search keys
function generateSearchKeys(text) {
    if (!text) return [];
    
    // Clean the text: remove extra spaces, convert to lowercase
    text = text.trim().toLowerCase().replace(/\s+/g, ' ');
    
    const keys = new Set();
    
    // Split text into words
    const words = text.split(' ');
    
    words.forEach(word => {
        // Generate substrings for each word
        for (let i = 1; i <= word.length; i++) {
            keys.add(word.substring(0, i));
        }
        
        // Add the complete word
        keys.add(word);
    });
    
    return Array.from(keys);
}

// Helper function to generate search keys from multiple fields
function generateKalaamSearchKeys(kalaam) {
    const searchableFields = [
        kalaam.Title,
        kalaam.WriterName,
        kalaam.CategoryName,
        kalaam.GroupName,
        kalaam.SectionName,
        kalaam.ContentUrdu,
        kalaam.ContentRomanUrdu,
        kalaam.ContentArabic,
        kalaam.ContentEnglish
    ];
    
    const allKeys = new Set();
    
    searchableFields.forEach(field => {
        if (field) {
            generateSearchKeys(field).forEach(key => allKeys.add(key));
        }
    });
    
    return Array.from(allKeys).join(' ');
}

// Get all kalaams
exports.getAllKalaams = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Kalaam WHERE IsDeleted = 0');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching kalaams:', error);
        res.status(500).json({ message: 'Error fetching kalaams', error: error.message });
    }
};

// Get kalaam by ID
exports.getKalaamById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Kalaam WHERE KalaamID = ? AND IsDeleted = 0', [req.params.id]);
        
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
        const searchTerm = req.query.term.trim().toLowerCase();
        const searchKeys = generateSearchKeys(searchTerm);
        
        // Create WHERE conditions for each search key
        const searchConditions = searchKeys.map(() => 'SearchKeys LIKE ?').join(' OR ');
        const searchValues = searchKeys.map(key => `%${key}%`);
        
        const query = `
            SELECT * FROM Kalaam 
            WHERE (${searchConditions})
            AND IsDeleted = 0
            ORDER BY 
                CASE 
                    WHEN Title LIKE ? THEN 1
                    WHEN WriterName LIKE ? THEN 2
                    WHEN CategoryName LIKE ? THEN 3
                    WHEN ContentUrdu LIKE ? THEN 4
                    WHEN ContentRomanUrdu LIKE ? THEN 5
                    ELSE 6
                END,
                Title
        `;
        
        // Add exact match parameters for ORDER BY
        const orderByParams = [
            `%${searchTerm}%`, 
            `%${searchTerm}%`, 
            `%${searchTerm}%`,
            `%${searchTerm}%`,
            `%${searchTerm}%`
        ];
        const queryParams = [...searchValues, ...orderByParams];
        
        const [rows] = await pool.query(query, queryParams);
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

        // Generate search keys
        const searchKeys = generateKalaamSearchKeys(req.body);

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
                SearchKeys,
                IsFeatured,
                IsSelected,
                IsDeleted
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            searchKeys,
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

// Update kalaam
exports.updateKalaam = async (req, res) => {
    try {
        const kalaamId = req.params.id;
        console.log('Updating kalaam ID:', kalaamId);
        console.log('Received update data:', req.body);

        // First, check if the kalaam exists
        const [existingKalaam] = await pool.query(
            'SELECT * FROM Kalaam WHERE KalaamID = ? AND IsDeleted = 0',
            [kalaamId]
        );

        if (existingKalaam.length === 0) {
            return res.status(404).json({
                message: 'Kalaam not found',
                success: false
            });
        }

        // Required fields validation
        const requiredFields = ['Title', 'WriterID', 'CategoryID'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields: missingFields,
                success: false
            });
        }

        // Generate search keys
        const searchKeys = generateKalaamSearchKeys(req.body);

        // Prepare the update query with all possible fields
        const query = `
            UPDATE Kalaam SET
                Title = ?,
                WriterID = ?,
                WriterName = ?,
                CategoryID = ?,
                CategoryName = ?,
                ContentUrdu = ?,
                ContentRomanUrdu = ?,
                ContentArabic = ?,
                ContentEnglish = ?,
                GroupID = ?,
                GroupName = ?,
                SectionID = ?,
                SectionName = ?,
                SearchKeys = ?,
                IsFeatured = ?,
                IsSelected = ?
            WHERE KalaamID = ?
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
            searchKeys,
            req.body.IsFeatured || 0,
            req.body.IsSelected || 0,
            kalaamId
        ];

        console.log('Executing update query with values:', values);

        // Execute the update query
        const [result] = await pool.query(query, values);

        console.log('Update result:', result);

        // Check if the kalaam was actually updated
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Kalaam not found or no changes made',
                success: false
            });
        }

        // Return success response
        res.json({
            message: 'Kalaam updated successfully',
            kalaamId: kalaamId,
            success: true
        });

    } catch (error) {
        console.error('Error updating kalaam:', error);
        console.error('Error details:', {
            code: error.code,
            errno: error.errno,
            sqlMessage: error.sqlMessage,
            sqlState: error.sqlState,
            sql: error.sql
        });
        
        // Send a more detailed error response
        res.status(500).json({
            message: 'Error updating kalaam',
            error: error.message,
            sqlError: error.sqlMessage,
            success: false
        });
    }
};

// Delete kalaam
exports.deleteKalaam = async (req, res) => {
    try {
        const kalaamId = req.params.id;
        console.log('Deleting kalaam ID:', kalaamId);

        // First, check if the kalaam exists and is not already deleted
        const [existingKalaam] = await pool.query(
            'SELECT * FROM Kalaam WHERE KalaamID = ? AND IsDeleted = 0',
            [kalaamId]
        );

        if (existingKalaam.length === 0) {
            return res.status(404).json({
                message: 'Kalaam not found or already deleted',
                success: false
            });
        }

        // Perform soft delete by setting IsDeleted = 1
        const [result] = await pool.query(
            'UPDATE Kalaam SET IsDeleted = 1 WHERE KalaamID = ?',
            [kalaamId]
        );

        // Check if the kalaam was actually updated
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Failed to delete kalaam',
                success: false
            });
        }

        // Return success response
        res.json({
            message: 'Kalaam deleted successfully',
            kalaamId: kalaamId,
            success: true
        });

    } catch (error) {
        console.error('Error deleting kalaam:', error);
        console.error('Error details:', {
            code: error.code,
            errno: error.errno,
            sqlMessage: error.sqlMessage,
            sqlState: error.sqlState,
            sql: error.sql
        });
        
        // Send a more detailed error response
        res.status(500).json({
            message: 'Error deleting kalaam',
            error: error.message,
            sqlError: error.sqlMessage,
            success: false
        });
    }
}; 