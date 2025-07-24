const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'naat_academy',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();



exports.getallpost = async (req, res) => {
    try {
        let limit = parseInt(req.query.limit, 10);
        if (isNaN(limit) || limit <= 0) limit = 50;
        if (limit > 200) limit = 200;

        let offset = parseInt(req.query.offset, 10);
        if (isNaN(offset) || offset < 0) offset = 0;

        const [rows] = await pool.query(`
            SELECT 
                post.id,
                post.slug,
                post.image,
                post.title,
                post.about,
                post.tag,
                post.style,
                post.seperationLines,
                post.language,
                post.postLanguage1,
                post.postLanguage2,
                post.postTranslate,
                post.createdOn,
                post.modifiedOn,
                post.isPublished,
                post.isDeleted,

                writer.id AS writerId,
                writer.slug AS writerSlug,
                writer.writerName,
                writer.writerYears,
                writer.image AS writerImage,

                books.id AS bookId,
                books.slug AS bookSlug,
                books.bookName,
                books.bookWriter,
                books.bookLanguage,
                books.bookTopic,
                books.aboutBook,
                books.attachment AS bookAttachment

            FROM post
            LEFT JOIN writer ON post.writer = writer.id
            LEFT JOIN books ON post.book = books.id
            WHERE post.isDeleted = 0
            LIMIT ? OFFSET ?
        `, [limit, offset]);

        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

