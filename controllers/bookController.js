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
        const [rows] = await pool.query('SELECT * FROM Book WHERE IsDeleted = 0');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching Book:', error);
        res.status(500).json({ message: 'Error fetching Book', error: error.message });
    }
};

// Get book by ID
exports.getBookById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Book WHERE BookID = ? AND IsDeleted = 0', [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching Book:', error);
        res.status(500).json({ message: 'Error fetching Book', error: error.message });
    }
};

// Search books
exports.searchBooks = async (req, res) => {
    try {
        const searchTerm = `%${req.query.term}%`;
        const [rows] = await pool.query(
            'SELECT * FROM Book WHERE (Title LIKE ? OR AuthorName LIKE ?) AND IsDeleted = 0',
            [searchTerm, searchTerm]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error searching Book:', error);
        res.status(500).json({ message: 'Error searching Book', error: error.message });
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
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)        `;

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

// Update book
exports.updateBook = async (req, res) => {
    try {
        const bookId = req.params.id;

        // Check if book exists
        const [existingBook] = await pool.query(
            'SELECT * FROM Book WHERE BookID = ? AND IsDeleted = 0',
            [bookId]
        );

        if (existingBook.length === 0) {
            return res.status(404).json({
                message: 'Book not found',
                success: false
            });
        }

        // Get cover image URL from uploaded file or keep existing
        const coverImageUrl = req.file
            ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
            : req.body.CoverImageURL || existingBook[0].CoverImageURL;

        // Prepare the update query
        const query = `
            UPDATE Book 
            SET 
                Title = ?,
                AuthorID = ?,
                AuthorName = ?,
                LanguageID = ?,
                LanguageName = ?,
                CategoryID = ?,
                CategoryName = ?,
                GroupID = ?,
                GroupName = ?,
                SectionID = ?,
                SectionName = ?,
                CoverImageURL = ?,
                PublicationYear = ?,
                Description = ?
            WHERE BookID = ? AND IsDeleted = 0
        `;

        // Extract values from request body with fallbacks to existing values
        const values = [
            req.body.Title || existingBook[0].Title,
            req.body.AuthorID || existingBook[0].AuthorID,
            req.body.AuthorName || existingBook[0].AuthorName,
            req.body.LanguageID || existingBook[0].LanguageID,
            req.body.LanguageName || existingBook[0].LanguageName,
            req.body.CategoryID || existingBook[0].CategoryID,
            req.body.CategoryName || existingBook[0].CategoryName,
            req.body.GroupID || existingBook[0].GroupID,
            req.body.GroupName || existingBook[0].GroupName,
            req.body.SectionID || existingBook[0].SectionID,
            req.body.SectionName || existingBook[0].SectionName,
            coverImageUrl,
            req.body.PublicationYear || existingBook[0].PublicationYear,
            req.body.Description || existingBook[0].Description,
            bookId
        ];

        // Execute the update query
        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(400).json({
                message: 'Book update failed',
                success: false
            });
        }

        res.json({
            message: 'Book updated successfully',
            coverImageUrl: coverImageUrl,
            success: true
        });

    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({
            message: 'Error updating book',
            error: error.message,
            success: false
        });
    }
};

// Delete book (soft delete)
exports.deleteBook = async (req, res) => {
    try {
        const bookId = req.params.id;

        // Check if book exists
        const [existingBook] = await pool.query(
            'SELECT * FROM Book WHERE BookID = ? AND IsDeleted = 0',
            [bookId]
        );

        if (existingBook.length === 0) {
            return res.status(404).json({
                message: 'Book not found',
                success: false
            });
        }

        // Perform soft delete by setting IsDeleted to 1
        const [result] = await pool.query(
            'UPDATE Book SET IsDeleted = 1 WHERE BookID = ?',
            [bookId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({
                message: 'Book deletion failed',
                success: false
            });
        }

        res.json({
            message: 'Book deleted successfully',
            success: true
        });

    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({
            message: 'Error deleting book',
            error: error.message,
            success: false
        });
    }
}; 