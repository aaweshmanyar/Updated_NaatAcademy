const pool = require('../db');

// Insert form data into `kalam_submissions`
async function insertKalam(req, res) {
  try {
    const {
      name,
      email,
      whatsapp,
      city,
      country,
      poet_name,
      poet_book,
      poet_intro,
      kalam_title,
      genre,
      language,
      kalam_bahr,
      kalam
    } = req.body;

    // Insert Query
    const sql = `INSERT INTO kalam_submissions 
      (name, email, whatsapp, city, country, poet_name, poet_book, poet_intro, kalam_title, genre, language, kalam_bahr, kalam)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [name, email, whatsapp, city, country, poet_name, poet_book || null, poet_intro || null, kalam_title, genre, language, kalam_bahr || null, kalam];

    const [result] = await pool.query(sql, values);

    res.status(201).json({ message: "Record inserted", id: result.insertId });
  } catch (error) {
    console.error('Insert Error:', error);
    res.status(500).json({ error: "Failed to insert data" });
  }
}

// Get all kalam submissions
async function getKalamSubmissions(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM kalam_submissions ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Get Data Error:', error);
    res.status(500).json({ error: "Failed to get data" });
  }
}

module.exports = {
  insertKalam,
  getKalamSubmissions
};
