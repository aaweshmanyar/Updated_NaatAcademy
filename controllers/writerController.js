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

// Get all writers
exports.getAllWriters = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Writer WHERE IsDeleted = 0');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching Writer:', error);
        res.status(500).json({ message: 'Error fetching Writer', error: error.message });
    }
};

// Get writer by ID
exports.getWriterById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Writer WHERE WriterID = ? AND IsDeleted = 0', [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Writer not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching writer:', error);
        res.status(500).json({ message: 'Error fetching writer', error: error.message });
    }
};

// Search writers
exports.searchWriters = async (req, res) => {
    try {
        const searchTerm = `%${req.query.term}%`;
        const [rows] = await pool.query(
            'SELECT * FROM Writer WHERE (Name LIKE ? OR Bio LIKE ?) AND IsDeleted = 0',
            [searchTerm, searchTerm]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error searching writers:', error);
        res.status(500).json({ message: 'Error searching writers', error: error.message });
    }
};

// Create new writer
exports.createWriter = async (req, res) => {
  try {
    // Required fields validation
    const requiredFields = ['Name', 'LanguageID'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Missing required fields',
        missingFields,
      });
    }

    // Extract WriterTypes array from req.body, supports string or array or undefined
    const writerTypes = Array.isArray(req.body.WriterTypes)
      ? req.body.WriterTypes
      : typeof req.body.WriterTypes === 'string'
      ? [req.body.WriterTypes]
      : [];

    // Map selected writer types to booleans
    const isPoetWriter = writerTypes.includes('Poet Writer') ? 1 : 0;
    const isArticleWriter = writerTypes.includes('Article Writer') ? 1 : 0;
    const isBookWriter = writerTypes.includes('Book Writer') ? 1 : 0;

    // Prepare insert query with all relevant fields including the 3 boolean columns
    const query = `
      INSERT INTO Writer (
        Name,
        LanguageID,
        LanguageName,
        Status,
        GroupID,
        GroupName,
        SectionID,
        SectionName,
        ProfileImageURL,
        Bio,
        wiladat,
        Wisal,
        IsPoetWriter,
        IsArticleWriter,
        IsBookWriter,
        IsDeleted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Construct profile image URL based on uploaded file or request body
    const profileImageUrl = req.file
      ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
      : req.body.ProfileImageURL || null;

    // Gather values for insertion, handling optional fields gracefully
    const values = [
      req.body.Name,
      req.body.LanguageID,
      req.body.LanguageName || null,
      req.body.Status || null,
      req.body.GroupID || null,
      req.body.GroupName || '',
      req.body.SectionID || null,
      req.body.SectionName || '',
      profileImageUrl,
      req.body.Bio || '',
      req.body.wiladat || null,
      req.body.Wisal || null,
      isPoetWriter,
      isArticleWriter,
      isBookWriter,
      0  // IsDeleted defaults to 0 (false)
    ];

    const [result] = await pool.query(query, values);

    // Send success response including inserted writer ID
    res.status(201).json({
      message: 'Writer created successfully',
      writerId: result.insertId,
      profileImageUrl,
      success: true,
    });
  } catch (error) {
    console.error('Error creating writer:', error);
    res.status(500).json({
      message: 'Error creating writer',
      error: error.message,
      success: false,
    });
  }
};


// Update writer
exports.updateWriter = async (req, res) => {
  try {
    const writerId = req.params.id;

    // Check if the Writer exists and is not deleted
    const [existingWriter] = await pool.query(
      'SELECT * FROM Writer WHERE WriterID = ? AND IsDeleted = 0',
      [writerId]
    );

    if (existingWriter.length === 0) {
      return res.status(404).json({
        message: 'Writer not found',
        success: false,
      });
    }

    // Extract WriterTypes array from req.body; if undefined, null indicates no change
    const writerTypes = Array.isArray(req.body.WriterTypes)
      ? req.body.WriterTypes
      : typeof req.body.WriterTypes === 'string'
      ? [req.body.WriterTypes]
      : null;

    // Map to booleans or fallback to existing values if no update
    const isPoetWriter = writerTypes !== null
      ? writerTypes.includes('Poet Writer') ? 1 : 0
      : existingWriter[0].IsPoetWriter;

    const isArticleWriter = writerTypes !== null
      ? writerTypes.includes('Article Writer') ? 1 : 0
      : existingWriter[0].IsArticleWriter;

    const isBookWriter = writerTypes !== null
      ? writerTypes.includes('Book Writer') ? 1 : 0
      : existingWriter[0].IsBookWriter;

    // Profile image URL - uploaded file or existing or from request body
    const profileImageUrl = req.file
      ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
      : req.body.ProfileImageURL || existingWriter[0].ProfileImageURL;

    // Prepare update query including the three boolean columns
    const query = `
      UPDATE Writer
      SET
        Name = ?,
        LanguageID = ?,
        LanguageName = ?,
        Status = ?,
        GroupID = ?,
        GroupName = ?,
        SectionID = ?,
        SectionName = ?,
        ProfileImageURL = ?,
        Bio = ?,
        wiladat = ?,
        Wisal = ?,
        IsPoetWriter = ?,
        IsArticleWriter = ?,
        IsBookWriter = ?
      WHERE WriterID = ? AND IsDeleted = 0
    `;

    // Prepare updated values, falling back to existing where not provided
    const values = [
      req.body.Name || existingWriter[0].Name,
      req.body.LanguageID || existingWriter[0].LanguageID,
      req.body.LanguageName || existingWriter[0].LanguageName,
      req.body.Status || existingWriter[0].Status,
      req.body.GroupID || existingWriter[0].GroupID,
      req.body.GroupName || existingWriter[0].GroupName,
      req.body.SectionID || existingWriter[0].SectionID,
      req.body.SectionName || existingWriter[0].SectionName,
      profileImageUrl,
      req.body.Bio || existingWriter[0].Bio,
      req.body.wiladat || existingWriter[0].wiladat,
      req.body.Wisal || existingWriter[0].Wisal,
      isPoetWriter,
      isArticleWriter,
      isBookWriter,
      writerId
    ];

    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        message: 'Writer update failed',
        success: false,
      });
    }

    res.json({
      message: 'Writer updated successfully',
      profileImageUrl,
      success: true,
    });

  } catch (error) {
    console.error('Error updating writer:', error);
    res.status(500).json({
      message: 'Error updating writer',
      error: error.message,
      success: false,
    });
  }
};


// Delete writer (soft delete)
exports.deleteWriter = async (req, res) => {
    try {
        const writerId = req.params.id;

        // Check if writer exists
        const [existingWriter] = await pool.query(
            'SELECT * FROM Writer WHERE WriterID = ? AND IsDeleted = 0',
            [writerId]
        );

        if (existingWriter.length === 0) {
            return res.status(404).json({
                message: 'Writer not found',
                success: false
            });
        }

        // Perform soft delete by setting IsDeleted to 1
        const [result] = await pool.query(
            'UPDATE Writer SET IsDeleted = 1 WHERE WriterID = ?',
            [writerId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({
                message: 'Writer deletion failed',
                success: false
            });
        }

        res.json({
            message: 'Writer deleted successfully',
            success: true
        });

    } catch (error) {
        console.error('Error deleting writer:', error);
        res.status(500).json({
            message: 'Error deleting writer',
            error: error.message,
            success: false
        });
    }
};


// Add this with your other controller functions
exports.getLimitedWriters = async (req, res) => {
    try {
        // Validate and parse parameters
        const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Max 100 items
        const offset = parseInt(req.query.offset) || 0;
        
        // Get total count for pagination info
        const [countRows] = await pool.query(
            'SELECT COUNT(*) as total FROM Writer WHERE IsDeleted = 0'
        );
        const total = countRows[0].total;

        // Get paginated data
        const [rows] = await pool.query(
            'SELECT * FROM Writer WHERE IsDeleted = 0 ORDER BY WriterID LIMIT ? OFFSET ?',
            [limit, offset]
        );
        
        res.json({
            success: true,
            data: rows,
            pagination: {
                limit,
                offset,
                total,
                returned: rows.length,
                hasMore: offset + rows.length < total
            }
        });
    } catch (error) {
        console.error('Error fetching limited writers:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching limited writers', 
            error: error.message 
        });
    }
};