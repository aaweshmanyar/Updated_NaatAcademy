const pool = require('../db')

// Get all languages
exports.getAllLanguages = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Language WHERE IsDeleted = 0');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching languages:', error);
        res.status(500).json({ 
            message: 'Error fetching languages', 
            error: error.message,
            success: false 
        });
    }
};

// Get language by ID
exports.getLanguageById = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM Language WHERE LanguageID = ? AND IsDeleted = 0', 
            [req.params.id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ 
                message: 'Language not found',
                success: false 
            });
        }
        
        res.json({
            language: rows[0],
            success: true
        });
    } catch (error) {
        console.error('Error fetching language:', error);
        res.status(500).json({ 
            message: 'Error fetching language', 
            error: error.message,
            success: false 
        });
    }
};

// Create new language
exports.createLanguage = async (req, res) => {
    try {
        // Required fields validation
        const requiredFields = ['LanguageName'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields: missingFields,
                success: false
            });
        }

        // Check if language already exists
        const [existingLanguage] = await pool.query(
            'SELECT * FROM Language WHERE LanguageName = ? AND IsDeleted = 0',
            [req.body.LanguageName]
        );

        if (existingLanguage.length > 0) {
            return res.status(400).json({
                message: 'Language already exists',
                success: false
            });
        }

        // Prepare the insert query
        const query = `
            INSERT INTO Language (
                LanguageName,
                Description,
                IsDeleted
            ) VALUES (?, ?, ?)
        `;

        const values = [
            req.body.LanguageName,
            req.body.Description || null,
            0  // IsDeleted defaults to 0 (false)
        ];

        // Execute the insert query
        const [result] = await pool.query(query, values);

        // Return success response
        res.status(201).json({
            message: 'Language created successfully',
            languageId: result.insertId,
            success: true
        });

    } catch (error) {
        console.error('Error creating language:', error);
        res.status(500).json({
            message: 'Error creating language',
            error: error.message,
            success: false
        });
    }
};

// Update language
exports.updateLanguage = async (req, res) => {
    try {
        const languageId = req.params.id;

        // Check if language exists
        const [existingLanguage] = await pool.query(
            'SELECT * FROM Language WHERE LanguageID = ? AND IsDeleted = 0',
            [languageId]
        );

        if (existingLanguage.length === 0) {
            return res.status(404).json({
                message: 'Language not found',
                success: false
            });
        }

        // Required fields validation
        const requiredFields = ['LanguageName'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields: missingFields,
                success: false
            });
        }

        // Check if updated name conflicts with existing language
        if (req.body.LanguageName !== existingLanguage[0].LanguageName) {
            const [nameCheck] = await pool.query(
                'SELECT * FROM Language WHERE LanguageName = ? AND LanguageID != ? AND IsDeleted = 0',
                [req.body.LanguageName, languageId]
            );

            if (nameCheck.length > 0) {
                return res.status(400).json({
                    message: 'Language name already exists',
                    success: false
                });
            }
        }

        // Prepare the update query
        const query = `
            UPDATE Language SET
                LanguageName = ?,
                Description = ?
            WHERE LanguageID = ?
        `;

        const values = [
            req.body.LanguageName,
            req.body.Description || null,
            languageId
        ];

        // Execute the update query
        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Language not found or no changes made',
                success: false
            });
        }

        res.json({
            message: 'Language updated successfully',
            languageId: languageId,
            success: true
        });

    } catch (error) {
        console.error('Error updating language:', error);
        res.status(500).json({
            message: 'Error updating language',
            error: error.message,
            success: false
        });
    }
};

// Delete language
exports.deleteLanguage = async (req, res) => {
    try {
        const languageId = req.params.id;

        // Check if language exists and is not already deleted
        const [existingLanguage] = await pool.query(
            'SELECT * FROM Language WHERE LanguageID = ? AND IsDeleted = 0',
            [languageId]
        );

        if (existingLanguage.length === 0) {
            return res.status(404).json({
                message: 'Language not found or already deleted',
                success: false
            });
        }

        // Perform soft delete
        const [result] = await pool.query(
            'UPDATE Language SET IsDeleted = 1 WHERE LanguageID = ?',
            [languageId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Failed to delete language',
                success: false
            });
        }

        res.json({
            message: 'Language deleted successfully',
            languageId: languageId,
            success: true
        });

    } catch (error) {
        console.error('Error deleting language:', error);
        res.status(500).json({
            message: 'Error deleting language',
            error: error.message,
            success: false
        });
    }
}; 