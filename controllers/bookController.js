const pool = require('../db')
// Get all books
exports.getAllBooks = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Book WHERE IsDeleted = 0");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching Book:", error);
    res
      .status(500)
      .json({ message: "Error fetching Book", error: error.message });
  }
};

// Get book by ID
exports.getBookById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM Book WHERE BookID = ? AND IsDeleted = 0",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching Book:", error);
    res
      .status(500)
      .json({ message: "Error fetching Book", error: error.message });
  }
};

// Search books
// controllers/bookController.js
exports.searchBooks = async (req, res) => {
  try {
    const userTerm = (req.query.term || "").trim().toLowerCase();
    if (!userTerm) {
      // If no search term, return empty array
      return res.json([]);
    }
    const searchTerm = `%${userTerm}%`;
    const [rows] = await pool.query(
      `SELECT * FROM Book 
             WHERE (LOWER(Title) LIKE ? OR LOWER(AuthorName) LIKE ?) 
               AND IsDeleted = 0`,
      [searchTerm, searchTerm]
    );
    // Always return array (even empty)
    return res.json(rows);
  } catch (error) {
    console.error("Error searching Book:", error);
    res.status(500).json({
      message: "Error searching Book",
      error: error.message,
    });
  }
};


exports.createBook = async (req, res) => {
    try {
        const imageFile = req.files && req.files.image ? req.files.image[0] : null;
        const pdfFile = req.files && req.files.pdf ? req.files.pdf[0] : null;

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
            imageFile ? imageFile.buffer : null,
            imageFile ? imageFile.mimetype : null,
            pdfFile ? pdfFile.buffer : null,
            pdfFile ? pdfFile.mimetype : null,
            req.body.PublicationYear || null,
            req.body.Description || null,
            0
        ];

        console.log(`Preparing to insert with ${values.length} values`);
        console.log(values);

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
                CoverImage,
                CoverImageMimeType,
                PdfFile,
                PdfMimeType,
                PublicationYear,
                Description,
                IsDeleted
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(query, values);

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
    const [existingBook] = await pool.query(
      "SELECT * FROM Book WHERE BookID = ? AND IsDeleted = 0",
      [bookId]
    );

    if (existingBook.length === 0) {
      return res.status(404).json({
        message: "Book not found",
        success: false,
      });
    }

    const book = existingBook[0];

    const imageFile = req.files && req.files.image ? req.files.image[0] : null;
    const pdfFile = req.files && req.files.pdf ? req.files.pdf[0] : null;

    // If file uploaded use new buffer/mimetype, else keep existing data
    const coverImage = imageFile ? imageFile.buffer : book.CoverImage;
    const coverImageMimeType = imageFile
      ? imageFile.mimetype
      : book.CoverImageMimeType;
    const pdfFileData = pdfFile ? pdfFile.buffer : book.PdfFile;
    const pdfMimeType = pdfFile ? pdfFile.mimetype : book.PdfMimeType;

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
                CoverImage = ?,
                CoverImageMimeType = ?,
                PdfFile = ?,
                PdfMimeType = ?,
                PublicationYear = ?,
                Description = ?
            WHERE BookID = ? AND IsDeleted = 0
        `;

    const values = [
      req.body.Title || book.Title,
      req.body.AuthorID || book.AuthorID,
      req.body.AuthorName || book.AuthorName,
      req.body.LanguageID || book.LanguageID,
      req.body.LanguageName || book.LanguageName,
      req.body.CategoryID || book.CategoryID,
      req.body.CategoryName || book.CategoryName,
      req.body.GroupID || book.GroupID,
      req.body.GroupName || book.GroupName,
      req.body.SectionID || book.SectionID,
      req.body.SectionName || book.SectionName,
      coverImage,
      coverImageMimeType,
      pdfFileData,
      pdfMimeType,
      req.body.PublicationYear || book.PublicationYear,
      req.body.Description || book.Description,
      bookId,
    ];

    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        message: "Book update failed",
        success: false,
      });
    }

    res.json({
      message: "Book updated successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({
      message: "Error updating book",
      error: error.message,
      success: false,
    });
  }
};

// Delete book (soft delete)
exports.deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;

    // Check if book exists
    const [existingBook] = await pool.query(
      "SELECT * FROM Book WHERE BookID = ? AND IsDeleted = 0",
      [bookId]
    );

    if (existingBook.length === 0) {
      return res.status(404).json({
        message: "Book not found",
        success: false,
      });
    }

    // Perform soft delete by setting IsDeleted to 1
    const [result] = await pool.query(
      "UPDATE Book SET IsDeleted = 1 WHERE BookID = ?",
      [bookId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        message: "Book deletion failed",
        success: false,
      });
    }

    res.json({
      message: "Book deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({
      message: "Error deleting book",
      error: error.message,
      success: false,
    });
  }
};

// Get books with limit and offset (pagination)
exports.getBooksPaginated = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = parseInt(req.query.offset, 10) || 0;

    const [rows] = await pool.query(
      "SELECT * FROM Book WHERE IsDeleted = 0 LIMIT ? OFFSET ?",
      [limit, offset]
    );

    const [countResult] = await pool.query(
      "SELECT COUNT(*) AS total FROM Book WHERE IsDeleted = 0"
    );

    res.json({
      total: countResult[0].total,
      limit,
      offset,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching paginated books:", error);
    res.status(500).json({
      message: "Error fetching paginated books",
      error: error.message,
      success: false,
    });
  }
};

// Get cover image binary by book ID
exports.getCoverImageById = async (req, res) => {
  try {
    const bookId = req.params.id;
    const [rows] = await pool.query(
      "SELECT CoverImage, CoverImageMimeType FROM Book WHERE BookID = ? AND IsDeleted = 0",
      [bookId]
    );

    if (rows.length === 0 || !rows[0].CoverImage) {
      return res.status(404).json({ message: "Cover image not found" });
    }

    res.setHeader("Content-Type", rows[0].CoverImageMimeType);
    res.send(rows[0].CoverImage);
  } catch (error) {
    console.error("Error fetching cover image:", error);
    res
      .status(500)
      .json({ message: "Error fetching cover image", error: error.message });
  }
};

// Get PDF binary by book ID
exports.getPdfById = async (req, res) => {
  try {
    const bookId = req.params.id;
    const [rows] = await pool.query(
      "SELECT PdfFile, PdfMimeType FROM Book WHERE BookID = ? AND IsDeleted = 0",
      [bookId]
    );

    if (rows.length === 0 || !rows[0].PdfFile) {
      return res.status(404).json({ message: "PDF not found" });
    }

    res.setHeader("Content-Type", rows[0].PdfMimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=book_${bookId}.pdf`
    );
    res.send(rows[0].PdfFile);
  } catch (error) {
    console.error("Error fetching PDF:", error);
    res
      .status(500)
      .json({ message: "Error fetching PDF", error: error.message });
  }
};
