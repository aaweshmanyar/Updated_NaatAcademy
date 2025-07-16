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

// Get all groups (only not deleted)
exports.getAllGroups = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM `Groups` WHERE IsDeleted = 0');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ message: 'Error fetching groups', error: error.message });
    }
};

// Get group by ID
exports.getGroupById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM `Groups` WHERE GroupID = ? AND IsDeleted = 0', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Group not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching group:', error);
        res.status(500).json({ message: 'Error fetching group', error: error.message });
    }
};

// Search groups by name or description
exports.searchGroups = async (req, res) => {
    try {
        const searchTerm = `%${req.query.term}%`;
        const [rows] = await pool.query(
            'SELECT * FROM `Groups` WHERE (GroupName LIKE ? OR GroupDescription LIKE ?) AND IsDeleted = 0',
            [searchTerm, searchTerm]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error searching groups:', error);
        res.status(500).json({ message: 'Error searching groups', error: error.message });
    }
};

// Create new group
exports.createGroup = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Uploaded file:', req.file);

        if (!req.body) {
            return res.status(400).json({ message: 'No data provided', success: false });
        }

        const requiredFields = ['GroupName'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields,
                receivedData: req.body
            });
        }

        const groupImageUrl = req.file
            ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
            : null;

        const values = [
            req.body.GroupName,
            req.body.GroupDescription || '',
            groupImageUrl,
            0, // IsDeleted = 0 (default)
            req.body.IsFeatured === '1' || req.body.IsFeatured === 1 ? 1 : 0
        ];

        const query = `
            INSERT INTO \`Groups\` (
                GroupName,
                GroupDescription,
                GroupImageURL,
                IsDeleted,
                IsFeatured
            ) VALUES (?, ?, ?, ?, ?)
        `;

        console.log('Inserting values:', values);

        const [result] = await pool.query(query, values);

        res.status(201).json({
            message: 'Group created successfully',
            groupId: result.insertId,
            groupImageUrl,
            success: true
        });

    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({
            message: 'Error creating group',
            error: error.message,
            receivedBody: req.body,
            success: false
        });
    }
};

// Update existing group
exports.updateGroup = async (req, res) => {
    try {
        console.log('Update request body:', req.body);
        console.log('Update uploaded file:', req.file);

        const groupId = req.params.id;

        const [existingGroup] = await pool.query(
            'SELECT * FROM `Groups` WHERE GroupID = ? AND IsDeleted = 0',
            [groupId]
        );

        if (existingGroup.length === 0) {
            return res.status(404).json({ message: 'Group not found', success: false });
        }

        const updateFields = [];
        const values = [];

        if (req.body.GroupName !== undefined) {
            updateFields.push('GroupName = ?');
            values.push(req.body.GroupName);
        }

        if (req.body.GroupDescription !== undefined) {
            updateFields.push('GroupDescription = ?');
            values.push(req.body.GroupDescription);
        }

        if (req.body.IsFeatured !== undefined) {
            updateFields.push('IsFeatured = ?');
            values.push(req.body.IsFeatured === '1' || req.body.IsFeatured === 1 ? 1 : 0);
        }

        if (req.file) {
            const groupImageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            updateFields.push('GroupImageURL = ?');
            values.push(groupImageUrl);

            if (existingGroup[0].GroupImageURL) {
                const oldImagePath = existingGroup[0].GroupImageURL.split('/uploads/')[1];
                if (oldImagePath) {
                    const fullPath = path.join(__dirname, '..', 'uploads', oldImagePath);
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                    }
                }
            }
        }

        values.push(groupId);

        const query = `
            UPDATE \`Groups\`
            SET ${updateFields.join(', ')}
            WHERE GroupID = ? AND IsDeleted = 0
        `;

        console.log('Update query:', query);
        console.log('Update values:', values);

        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Group not found or no changes made',
                success: false
            });
        }

        const [updatedGroup] = await pool.query(
            'SELECT * FROM \`Groups\` WHERE GroupID = ? AND IsDeleted = 0',
            [groupId]
        );

        res.json({
            message: 'Group updated successfully',
            group: updatedGroup[0],
            success: true
        });

    } catch (error) {
        console.error('Error updating group:', error);
        res.status(500).json({
            message: 'Error updating group',
            error: error.message,
            success: false
        });
    }
};

// Soft delete group (IsDeleted = 1)
exports.deleteGroup = async (req, res) => {
    try {
        const groupId = req.params.id;

        const [existingGroup] = await pool.query(
            'SELECT * FROM `Groups` WHERE GroupID = ? AND IsDeleted = 0',
            [groupId]
        );

        if (existingGroup.length === 0) {
            return res.status(404).json({ message: 'Group not found', success: false });
        }

        const [result] = await pool.query(
            'UPDATE `Groups` SET IsDeleted = 1 WHERE GroupID = ?',
            [groupId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ message: 'Group deletion failed', success: false });
        }

        res.json({ message: 'Group deleted successfully', success: true });

    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({
            message: 'Error deleting group',
            error: error.message,
            success: false
        });
    }
};
