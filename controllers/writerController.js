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
        const [rows] = await pool.query('SELECT * FROM Writer WHERE IsDeleted = 0');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching Writer:', error);
        res.status(500).json({ message: 'Error fetching Writer', error: error.message });
    }
};

// Get writer by ID
exports.getWriterById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Writer WHERE WriterID = ? AND IsDeleted = 0', [req.params.id]);
        
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
            'SELECT * FROM Writer WHERE (Name LIKE ? OR Bio LIKE ?) AND IsDeleted = 0',
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
            INSERT INTO Writer (
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
                wiladat,
                Wisal,
                IsDeleted
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Get profile image URL from uploaded file or request body
        const profileImageUrl = req.file
            ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
            : req.body.ProfileImageURL || null;

        // Extract values from request body with fallbacks for optional fields
        const values = [
            req.body.Name,
            req.body.LanguageID,
            req.body.LanguageName || null,
            req.body.Status || null,
            req.body.GroupID || null,
            req.body.GroupName || '',
            req.body.SectionID || null,
            req.body.SectionName || '',
            profileImageUrl,
            req.body.Bio || '',
            req.body.wiladat || null,
            req.body.Wisal || null,
            0  // IsDeleted defaults to 0 (false)
        ];

        // Execute the insert query
        const [result] = await pool.query(query, values);

        // Return success response with the new writer ID
        res.status(201).json({
            message: 'Writer created successfully',
            writerId: result.insertId,
            profileImageUrl: profileImageUrl,
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

// Update writer
exports.updateWriter = async (req, res) => {
    try {
        const writerId = req.params.id;

        // Check if writer exists
        const [existingWriter] = await pool.query(
            'SELECT * FROM Writer WHERE WriterID = ? AND IsDeleted = 0',
            [writerId]
        );

        if (existingWriter.length === 0) {
            return res.status(404).json({
                message: 'Writer not found',
                success: false
            });
        }

        // Get profile image URL from uploaded file or keep existing
        const profileImageUrl = req.file
            ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
            : req.body.ProfileImageURL || existingWriter[0].ProfileImageURL;

        // Prepare the update query
        const query = `
            UPDATE Writer 
            SET 
                Name = ?,
                LanguageID = ?,
                LanguageName = ?,
                Status = ?,
                GroupID = ?,
                GroupName = ?,
                SectionID = ?,
                SectionName = ?,
                ProfileImageURL = ?,
                Bio = ?,
                wiladat = ?,
                Wisal = ?
            WHERE WriterID = ? AND IsDeleted = 0
        `;

        // Extract values from request body with fallbacks to existing values
        const values = [
            req.body.Name || existingWriter[0].Name,
            req.body.LanguageID || existingWriter[0].LanguageID,
            req.body.LanguageName || existingWriter[0].LanguageName,
            req.body.Status || existingWriter[0].Status,
            req.body.GroupID || existingWriter[0].GroupID,
            req.body.GroupName || existingWriter[0].GroupName,
            req.body.SectionID || existingWriter[0].SectionID,
            req.body.SectionName || existingWriter[0].SectionName,
            profileImageUrl,
            req.body.Bio || existingWriter[0].Bio,
            req.body.wiladat || existingWriter[0].wiladat,
            req.body.Wisal || existingWriter[0].Wisal,
            writerId
        ];

        // Execute the update query
        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(400).json({
                message: 'Writer update failed',
                success: false
            });
        }

        res.json({
            message: 'Writer updated successfully',
            profileImageUrl: profileImageUrl,
            success: true
        });

    } catch (error) {
        console.error('Error updating writer:', error);
        res.status(500).json({
            message: 'Error updating writer',
            error: error.message,
            success: false
        });
    }
};

// Delete writer (soft delete)
exports.deleteWriter = async (req, res) => {
    try {
        const writerId = req.params.id;

        // Check if writer exists
        const [existingWriter] = await pool.query(
            'SELECT * FROM Writer WHERE WriterID = ? AND IsDeleted = 0',
            [writerId]
        );

        if (existingWriter.length === 0) {
            return res.status(404).json({
                message: 'Writer not found',
                success: false
            });
        }

        // Perform soft delete by setting IsDeleted to 1
        const [result] = await pool.query(
            'UPDATE Writer SET IsDeleted = 1 WHERE WriterID = ?',
            [writerId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({
                message: 'Writer deletion failed',
                success: false
            });
        }

        res.json({
            message: 'Writer deleted successfully',
            success: true
        });

    } catch (error) {
        console.error('Error deleting writer:', error);
        res.status(500).json({
            message: 'Error deleting writer',
            error: error.message,
            success: false
        });
    }
};