const pool = require('../db')

// Get all topics
exports.getAllTopics = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Topic WHERE IsDeleted = 0');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching topics:', error);
        res.status(500).json({ message: 'Error fetching topics', error: error.message });
    }
};

// Get topic by ID
exports.getTopicById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Topic WHERE TopicID = ? AND IsDeleted = 0', [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Topic not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching topic:', error);
        res.status(500).json({ message: 'Error fetching topic', error: error.message });
    }
};

// Search topics 
exports.searchTopics = async (req, res) => {
    try {
        const searchTerm = `%${req.query.term}%`;
        const [rows] = await pool.query(
            'SELECT * FROM Topic WHERE (Title LIKE ? OR Description LIKE ?) AND IsDeleted = 0',
            [searchTerm, searchTerm]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error searching topics:', error);
        res.status(500).json({ message: 'Error searching topics', error: error.message });
    }
}; 

// Create new topic
exports.createTopic = async (req, res) => {
    try {
        // Required fields validation
        const requiredFields = ['Title', 'CategoryID', 'Slug'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields: missingFields
            });
        }

        // Prepare the insert query
        const query = `
            INSERT INTO Topic (
                Title,
                CategoryID,
                CategoryName,
                Slug,
                GroupID,
                GroupName,
                Description,
                IsDeleted
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        // Extract values from request body with fallbacks for optional fields
        const values = [
            req.body.Title,
            req.body.CategoryID,
            req.body.CategoryName || null,
            req.body.Slug,
            req.body.GroupID || null,
            req.body.GroupName || null,
            req.body.Description || null,
            0 // IsDeleted defaults to 0 (false)
        ];

        // Execute the insert query
        const [result] = await pool.query(query, values);

        // Return success response with the new topic ID
        res.status(201).json({
            message: 'Topic created successfully',
            topicId: result.insertId,
            success: true
        });
    } catch (error) {
        console.error('Error creating topic:', error);
        res.status(500).json({
            message: 'Error creating topic',
            error: error.message,
            success: false
        });
    }
}; 

// Update topic
exports.updateTopic = async (req, res) => {
    try {
        const topicId = req.params.id;

        // Check if topic exists
        const [existingTopic] = await pool.query(
            'SELECT * FROM Topic WHERE TopicID = ? AND IsDeleted = 0',
            [topicId]
        );

        if (existingTopic.length === 0) {
            return res.status(404).json({
                message: 'Topic not found',
                success: false
            });
        }

        // Prepare the update query
        const query = `
            UPDATE Topic 
            SET 
                Title = ?,
                CategoryID = ?,
                CategoryName = ?,
                Slug = ?,
                GroupID = ?,
                GroupName = ?,
                Description = ?
            WHERE TopicID = ? AND IsDeleted = 0
        `;

        // Extract values from request body with fallbacks to existing values
        const values = [
            req.body.Title || existingTopic[0].Title,
            req.body.CategoryID || existingTopic[0].CategoryID,
            req.body.CategoryName || existingTopic[0].CategoryName,
            req.body.Slug || existingTopic[0].Slug,
            req.body.GroupID || existingTopic[0].GroupID,
            req.body.GroupName || existingTopic[0].GroupName,
            req.body.Description || existingTopic[0].Description,
            topicId
        ];

        // Execute the update query
        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(400).json({
                message: 'Topic update failed',
                success: false
            });
        }

        // Fetch updated topic
        const [updatedTopic] = await pool.query(
            'SELECT * FROM Topic WHERE TopicID = ? AND IsDeleted = 0',
            [topicId]
        );

        res.json({
            message: 'Topic updated successfully',
            topic: updatedTopic[0],
            success: true
        });

    } catch (error) {
        console.error('Error updating topic:', error);
        res.status(500).json({
            message: 'Error updating topic',
            error: error.message,
            success: false
        });
    }
};

// Delete topic (soft delete)
exports.deleteTopic = async (req, res) => {
    try {
        const topicId = req.params.id;

        // Check if topic exists
        const [existingTopic] = await pool.query(
            'SELECT * FROM Topic WHERE TopicID = ? AND IsDeleted = 0',
            [topicId]
        );

        if (existingTopic.length === 0) {
            return res.status(404).json({
                message: 'Topic not found',
                success: false
            });
        }

        // Perform soft delete by setting IsDeleted to 1
        const [result] = await pool.query(
            'UPDATE Topic SET IsDeleted = 1 WHERE TopicID = ?',
            [topicId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({
                message: 'Topic deletion failed',
                success: false
            });
        }

        res.json({
            message: 'Topic deleted successfully',
            success: true
        });

    } catch (error) {
        console.error('Error deleting topic:', error);
        res.status(500).json({
            message: 'Error deleting topic',
            error: error.message,
            success: false
        });
    }
}; 