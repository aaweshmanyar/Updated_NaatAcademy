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

// Get all books
exports.getAllBooks = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM book WHERE IsDeleted = 0');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Error fetching books', error: error.message });
    }
};

// Get book by ID
exports.getBookById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM book WHERE BookID = ? AND IsDeleted = 0', [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({ message: 'Error fetching book', error: error.message });
    }
};

// Search books
exports.searchBooks = async (req, res) => {
    try {
        const searchTerm = `%${req.query.term}%`;
        const [rows] = await pool.query(
            'SELECT * FROM book WHERE (Title LIKE ? OR AuthorName LIKE ?) AND IsDeleted = 0',
            [searchTerm, searchTerm]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error searching books:', error);
        res.status(500).json({ message: 'Error searching books', error: error.message });
    }
};

exports.createBook = async (req, res) => {
    try {
        // Required fields validation
        const requiredFields = ['Title', 'AuthorID', 'LanguageID', 'CategoryID'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields: missingFields
            });
        }

        // Validate PublicationYear format if provided
        // if (req.body.PublicationYear) {
        //     const yearRegex = /^\d{4}$/;
        //     if (!yearRegex.test(req.body.PublicationYear)) {
        //         return res.status(400).json({
        //             message: 'Invalid PublicationYear format. Must be a 4-digit year (YYYY)',
        //             success: false
        //         });
        //     }
        // }

        // Prepare the insert query with all possible fields
        const query = `
            INSERT INTO Book (
                Title,
                AuthorID,
                AuthorName,
                LanguageID,
                LanguageName,
                CategoryID,
                CategoryName,
                GroupID,
                GroupName,
                SectionID,
                SectionName,
                CoverImageURL,
                PublicationYear,
                Description,
                IsDeleted
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Extract values from request body with fallbacks for optional fields
        const coverImageUrl = req.file
            ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
            : req.body.CoverImageURL || null;
        const values = [
            req.body.Title,
            req.body.AuthorID,
            req.body.AuthorName || null,
            req.body.LanguageID,
            req.body.LanguageName || null,
            req.body.CategoryID,
            req.body.CategoryName || null,
            req.body.GroupID || null,
            req.body.GroupName || null,
            req.body.SectionID || null,
            req.body.SectionName || null,
            coverImageUrl,
            req.body.PublicationYear || null,
            req.body.Description || null,
            0  // IsDeleted defaults to 0 (false)
        ];

        // Execute the insert query
        const [result] = await pool.query(query, values);

        // Return success response with the new book ID
        res.status(201).json({
            message: 'Book created successfully',
            bookId: result.insertId,
            success: true
        });

    } catch (error) {
        console.error('Error creating book:', error);
        res.status(500).json({
            message: 'Error creating book',
            error: error.message,
            success: false
        });
    }
}; 