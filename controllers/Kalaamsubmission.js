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



//Insert kalaam
exports.createKalam = (req, res) => {
    const {
        name, email, whatsapp, city, country,
        poet_name, poet_book, poet_intro,
        kalam_title, genre, language, kalam_bahr, kalam
    } = req.body;

    const sql = `
        INSERT INTO kalam_submissions (
            name, email, whatsapp, city, country,
            poet_name, poet_book, poet_intro,
            kalam_title, genre, language, kalam_bahr, kalam
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        name, email, whatsapp, city, country,
        poet_name, poet_book, poet_intro,
        kalam_title, genre, language, kalam_bahr, kalam
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Insert error:', err);
            return res.status(500).json({ message: 'Database error', error: err });
        }
        res.status(201).json({ message: 'Kalam submitted successfully', id: result.insertId });
    });
};

// GET All Kalam Submissions
exports.getAllKalam = (req, res) => {
    const sql = `SELECT * FROM kalam_submissions ORDER BY created_at DESC`;
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }
        res.json(results);
    });
};

// UPDATE Kalam by ID
exports.updateKalam = (req, res) => {
    const {
        name, email, whatsapp, city, country,
        poet_name, poet_book, poet_intro,
        kalam_title, genre, language, kalam_bahr, kalam
    } = req.body;

    const id = req.params.id;

    const sql = `
        UPDATE kalam_submissions SET
            name = ?, email = ?, whatsapp = ?, city = ?, country = ?,
            poet_name = ?, poet_book = ?, poet_intro = ?,
            kalam_title = ?, genre = ?, language = ?, kalam_bahr = ?, kalam = ?
        WHERE id = ?
    `;

    const values = [
        name, email, whatsapp, city, country,
        poet_name, poet_book, poet_intro,
        kalam_title, genre, language, kalam_bahr, kalam, id
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Update error:', err);
            return res.status(500).json({ message: 'Database error', error: err });
        }
        res.json({ message: 'Kalam updated successfully' });
    });
};