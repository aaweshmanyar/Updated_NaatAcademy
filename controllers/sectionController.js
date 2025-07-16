const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');

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
        const [rows] = await pool.query('SELECT * FROM Section WHERE IsDeleted = 0');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching Section:', error);
        res.status(500).json({ message: 'Error fetching Section', error: error.message });
    }
};

// Get section by ID
exports.getSectionById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Section WHERE SectionID = ? AND IsDeleted = 0', [req.params.id]);
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
            'SELECT * FROM Section WHERE (SectionName LIKE ? OR SectionDescription LIKE ?) AND IsDeleted = 0',
            [searchTerm, searchTerm]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error searching sections:', error);
        res.status(500).json({ message: 'Error searching sections', error: error.message });
    }
};

// Create new section
exports.createSection = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Uploaded file:', req.file);

        if (!req.body) {
            return res.status(400).json({ message: 'No data provided', success: false });
        }

        const requiredFields = ['SectionName'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields,
                receivedData: req.body
            });
        }

        const sectionImageUrl = req.file
            ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
            : null;

        const query = `
            INSERT INTO Section (
                SectionName,
                SectionDescription,
                IsFeatured,
                SectionImageURL,
                IsDeleted
            ) VALUES (?, ?, ?, ?, ?)
        `;

        const values = [
            req.body.SectionName,
            req.body.SectionDescription || '',
            req.body.Features || '',
            sectionImageUrl,
            0
        ];

        const [result] = await pool.query(query, values);

        res.status(201).json({
            message: 'Section created successfully',
            sectionId: result.insertId,
            sectionImageUrl,
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

// Update section
exports.updateSection = async (req, res) => {
    try {
        console.log('Update request body:', req.body);
        console.log('Update uploaded file:', req.file);

        const sectionId = req.params.id;
        const [existingSection] = await pool.query(
            'SELECT * FROM Section WHERE SectionID = ? AND IsDeleted = 0',
            [sectionId]
        );

        if (existingSection.length === 0) {
            return res.status(404).json({ message: 'Section not found', success: false });
        }

        const updateFields = [];
        const values = [];

        if (req.body.SectionName !== undefined) {
            updateFields.push('SectionName = ?');
            values.push(req.body.SectionName);
        }
        if (req.body.SectionDescription !== undefined) {
            updateFields.push('SectionDescription = ?');
            values.push(req.body.SectionDescription);
        }
        if (req.body.Features !== undefined) {
            updateFields.push('Features = ?');
            values.push(req.body.Features);
        }

        if (req.file) {
            const sectionImageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            updateFields.push('SectionImageURL = ?');
            values.push(sectionImageUrl);

            if (existingSection[0].SectionImageURL) {
                const oldImagePath = existingSection[0].SectionImageURL.split('/uploads/')[1];
                if (oldImagePath) {
                    const fullPath = path.join(__dirname, '..', 'uploads', oldImagePath);
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                    }
                }
            }
        }

        values.push(sectionId);

        const query = `
            UPDATE Section 
            SET ${updateFields.join(', ')}
            WHERE SectionID = ? AND IsDeleted = 0
        `;

        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Section not found or no changes made',
                success: false
            });
        }

        const [updatedSection] = await pool.query(
            'SELECT * FROM Section WHERE SectionID = ? AND IsDeleted = 0',
            [sectionId]
        );

        res.json({
            message: 'Section updated successfully',
            section: updatedSection[0],
            success: true
        });

    } catch (error) {
        console.error('Error updating section:', error);
        res.status(500).json({
            message: 'Error updating section',
            error: error.message,
            success: false
        });
    }
};

// Delete section
exports.deleteSection = async (req, res) => {
    try {
        const sectionId = req.params.id;
        const [existingSection] = await pool.query(
            'SELECT * FROM Section WHERE SectionID = ? AND IsDeleted = 0',
            [sectionId]
        );

        if (existingSection.length === 0) {
            return res.status(404).json({ message: 'Section not found', success: false });
        }

        const [result] = await pool.query(
            'UPDATE Section SET IsDeleted = 1 WHERE SectionID = ?',
            [sectionId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ message: 'Section deletion failed', success: false });
        }

        res.json({ message: 'Section deleted successfully', success: true });

    } catch (error) {
        console.error('Error deleting section:', error);
        res.status(500).json({
            message: 'Error deleting section',
            error: error.message,
            success: false
        });
    }
};
 