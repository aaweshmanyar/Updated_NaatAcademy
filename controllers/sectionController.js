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
        const [rows] = await pool.query('SELECT * FROM Section');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching Section:', error);
        res.status(500).json({ message: 'Error fetching Section', error: error.message });
    }
};

// Get section by ID
exports.getSectionById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Section WHERE SectionID = ?', [req.params.id]);
        
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
            'SELECT * FROM Section WHERE SectionName LIKE ? OR SectionDescription LIKE ?',
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
        const requiredFields = ['SectionName'];
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
            INSERT INTO Section (
                SectionName,
                SectionDescription,
                SectionImageURL
            ) VALUES (?, ?, ?)
        `;

        // Get section image URL from uploaded file
        const sectionImageUrl = req.file
            ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
            : null;

        // Extract values from request body with fallbacks for optional fields
        const values = [
            req.body.SectionName,
            req.body.SectionDescription || '',
            sectionImageUrl
        ];

        // Log the values being inserted
        console.log('Inserting values:', values);

        // Execute the insert query
        const [result] = await pool.query(query, values);

        // Return success response with the new section ID
        res.status(201).json({
            message: 'Section created successfully',
            sectionId: result.insertId,
            sectionImageUrl: sectionImageUrl,
            success: true
        });

    } catch (error) {
        console.error('Error creating section:', error);
        res.status(500).json({
            message: 'Error creating section',
            error: error.message,
            receivedBody: req.body,
            success: false
        });
    }
};

// Update section
exports.updateSection = async (req, res) => {
    try {
        // Log the incoming request body and file
        console.log('Update request body:', req.body);
        console.log('Update uploaded file:', req.file);

        const sectionId = req.params.id;

        // Check if section exists
        const [existingSection] = await pool.query(
            'SELECT * FROM Section WHERE SectionID = ?',
            [sectionId]
        );

        if (existingSection.length === 0) {
            return res.status(404).json({
                message: 'Section not found',
                success: false
            });
        }

        // Prepare update fields
        const updateFields = [];
        const values = [];

        // Handle text fields
        if (req.body.SectionName !== undefined) {
            updateFields.push('SectionName = ?');
            values.push(req.body.SectionName);
        }
        if (req.body.SectionDescription !== undefined) {
            updateFields.push('SectionDescription = ?');
            values.push(req.body.SectionDescription);
        }

        // Handle image update
        if (req.file) {
            const sectionImageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            updateFields.push('SectionImageURL = ?');
            values.push(sectionImageUrl);

            // Delete old image if it exists
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

        // Add SectionID to values array
        values.push(sectionId);

        // Construct and execute update query
        const query = `
            UPDATE Section 
            SET ${updateFields.join(', ')}
            WHERE SectionID = ?
        `;

        // Log the update query and values
        console.log('Update query:', query);
        console.log('Update values:', values);

        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Section not found or no changes made',
                success: false
            });
        }

        // Fetch updated section
        const [updatedSection] = await pool.query(
            'SELECT * FROM Section WHERE SectionID = ?',
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