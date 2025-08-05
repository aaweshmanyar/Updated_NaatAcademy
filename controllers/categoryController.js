const pool = require('../db')

// Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Category WHERE IsDeleted = 0');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Category WHERE CategoryID = ? AND IsDeleted = 0', [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ message: 'Error fetching category', error: error.message });
    }
};

// Search categories
exports.searchCategories = async (req, res) => {
    try {
        const searchTerm = `%${req.query.term}%`;
        const [rows] = await pool.query(
            'SELECT * FROM Category WHERE (Name LIKE ? OR Description LIKE ?) AND IsDeleted = 0',
            [searchTerm, searchTerm]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error searching categories:', error);
        res.status(500).json({ message: 'Error searching categories', error: error.message });
    }
};

exports.createCategory = async (req, res) => {
    try {
        // Required fields validation
        const requiredFields = ['Name', 'Slug'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields: missingFields
            });
        }

        // Prepare the insert query with all possible fields
        const query = `
            INSERT INTO Category (
                Name,
                Slug,
                Color,
                GroupID,
                GroupName,
                Description,
                IsDeleted
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        // Extract values from request body with fallbacks for optional fields
        const values = [
            req.body.Name,
            req.body.Slug,
            req.body.Color || null,
            req.body.GroupID || null,
            req.body.GroupName || null,
            req.body.Description || null,
            0  // IsDeleted defaults to 0 (false)
        ];

        // Execute the insert query
        const [result] = await pool.query(query, values);

        // Return success response with the new category ID
        res.status(201).json({
            message: 'Category created successfully',
            categoryId: result.insertId,
            success: true
        });

    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({
            message: 'Error creating category',
            error: error.message,
            success: false
        });
    }
}; 

// Update category
exports.updateCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;

        // Check if category exists
        const [existingCategory] = await pool.query(
            'SELECT * FROM Category WHERE CategoryID = ? AND IsDeleted = 0',
            [categoryId]
        );

        if (existingCategory.length === 0) {
            return res.status(404).json({
                message: 'Category not found',
                success: false
            });
        }

        // Prepare the update query
        const query = `
            UPDATE Category 
            SET 
                Name = ?,
                Slug = ?,
                Color = ?,
                GroupID = ?,
                GroupName = ?,
                Description = ?
            WHERE CategoryID = ? AND IsDeleted = 0
        `;

        // Extract values from request body with fallbacks to existing values
        const values = [
            req.body.Name || existingCategory[0].Name,
            req.body.Slug || existingCategory[0].Slug,
            req.body.Color || existingCategory[0].Color,
            req.body.GroupID || existingCategory[0].GroupID,
            req.body.GroupName || existingCategory[0].GroupName,
            req.body.Description || existingCategory[0].Description,
            categoryId
        ];

        // Execute the update query
        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(400).json({
                message: 'Category update failed',
                success: false
            });
        }

        res.json({
            message: 'Category updated successfully',
            success: true
        });

    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({
            message: 'Error updating category',
            error: error.message,
            success: false
        });
    }
};

// Delete category (soft delete)
exports.deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;

        // Check if category exists
        const [existingCategory] = await pool.query(
            'SELECT * FROM Category WHERE CategoryID = ? AND IsDeleted = 0',
            [categoryId]
        );

        if (existingCategory.length === 0) {
            return res.status(404).json({
                message: 'Category not found',
                success: false
            });
        }

        // Perform soft delete by setting IsDeleted to 1
        const [result] = await pool.query(
            'UPDATE Category SET IsDeleted = 1 WHERE CategoryID = ?',
            [categoryId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({
                message: 'Category deletion failed',
                success: false
            });
        }

        res.json({
            message: 'Category deleted successfully',
            success: true
        });

    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({
            message: 'Error deleting category',
            error: error.message,
            success: false
        });
    }
}; 