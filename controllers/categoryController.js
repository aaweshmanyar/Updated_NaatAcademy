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

// Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM category WHERE IsDeleted = 0');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM category WHERE CategoryID = ? AND IsDeleted = 0', [req.params.id]);
        
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
            'SELECT * FROM category WHERE (Name LIKE ? OR Description LIKE ?) AND IsDeleted = 0',
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
            INSERT INTO category (
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