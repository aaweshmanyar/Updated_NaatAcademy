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
        const [rows] = await pool.query('SELECT * FROM `Groups`');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ message: 'Error fetching groups', error: error.message });
    }
}; 

// Get group by ID
exports.getGroupById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM `Groups` WHERE GroupID = ?', [req.params.id]);
        
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
            'SELECT * FROM `Groups` WHERE GroupName LIKE ? OR GroupDescription LIKE ?',
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
        // Log the incoming request body and file
        console.log('Request body:', req.body);
        console.log('Uploaded file:', req.file);

        // Check if req.body exists
        if (!req.body) {
            return res.status(400).json({
                message: 'No data provided',
                success: false
            });
        }

        // Required fields validation
        const requiredFields = ['GroupName'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields: missingFields,
                receivedData: req.body
            });
        }

        // Prepare the insert query with all possible fields
        const query = `
            INSERT INTO \`Groups\` (
                GroupName,
                GroupDescription,
                GroupImageURL
            ) VALUES (?, ?, ?)
        `;

        // Get group image URL from uploaded file
        const groupImageUrl = req.file
            ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
            : null;

        // Extract values from request body with fallbacks for optional fields
        const values = [
            req.body.GroupName,
            req.body.GroupDescription || '',
            groupImageUrl
        ];

        // Log the values being inserted
        console.log('Inserting values:', values);

        // Execute the insert query
        const [result] = await pool.query(query, values);

        // Return success response with the new group ID
        res.status(201).json({
            message: 'Group created successfully',
            groupId: result.insertId,
            groupImageUrl: groupImageUrl,
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

// Update group
exports.updateGroup = async (req, res) => {
    try {
        // Log the incoming request body and file
        console.log('Update request body:', req.body);
        console.log('Update uploaded file:', req.file);

        const groupId = req.params.id;

        // Check if group exists
        const [existingGroup] = await pool.query(
            'SELECT * FROM `Groups` WHERE GroupID = ?',
            [groupId]
        );

        if (existingGroup.length === 0) {
            return res.status(404).json({
                message: 'Group not found',
                success: false
            });
        }

        // Prepare update fields
        const updateFields = [];
        const values = [];

        // Handle text fields
        if (req.body.GroupName !== undefined) {
            updateFields.push('GroupName = ?');
            values.push(req.body.GroupName);
        }
        if (req.body.GroupDescription !== undefined) {
            updateFields.push('GroupDescription = ?');
            values.push(req.body.GroupDescription);
        }

        // Handle image update
        if (req.file) {
            const groupImageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            updateFields.push('GroupImageURL = ?');
            values.push(groupImageUrl);

            // Delete old image if it exists
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

        // Add GroupID to values array
        values.push(groupId);

        // Construct and execute update query
        const query = `
            UPDATE \`Groups\`
            SET ${updateFields.join(', ')}
            WHERE GroupID = ?
        `;

        // Log the update query and values
        console.log('Update query:', query);
        console.log('Update values:', values);

        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Group not found or no changes made',
                success: false
            });
        }

        // Fetch updated group
        const [updatedGroup] = await pool.query(
            'SELECT * FROM `Groups` WHERE GroupID = ?',
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