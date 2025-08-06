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

// Get all kalam submissions (Admin Purpose)
async function getKalamSubmissions(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM kalam_submissions ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Get Data Error:', error);
    res.status(500).json({ error: "Failed to get data" });
  }
}

// Get Approved Kalam Submissions (For Frontend)
async function getApprovedKalamSubmissions(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM kalam_submissions WHERE Approved = 0 ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Get Approved Data Error:', error);
    res.status(500).json({ error: "Failed to get approved data" });
  }
}

// Get Single Kalam Submission by ID
async function getKalamById(req, res) {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM kalam_submissions WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Get By ID Error:', error);
    res.status(500).json({ error: "Failed to get data by ID" });
  }
}

// Update Kalam Submission by ID
async function updateKalam(req, res) {
  const { id } = req.params;
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
    kalam,
    Approved
  } = req.body;

  try {
    const sql = `UPDATE kalam_submissions SET 
      name = ?, email = ?, whatsapp = ?, city = ?, country = ?, 
      poet_name = ?, poet_book = ?, poet_intro = ?, kalam_title = ?, 
      genre = ?, language = ?, kalam_bahr = ?, kalam = ?, Approved = ?
      WHERE id = ?`;

    const values = [name, email, whatsapp, city, country, poet_name, poet_book || null, poet_intro || null, kalam_title, genre, language, kalam_bahr || null, kalam, Approved, id];

    const [result] = await pool.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.json({ message: "Record updated successfully" });
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ error: "Failed to update data" });
  }
}

// Delete Kalam Submission by ID
async function deleteKalam(req, res) {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM kalam_submissions WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.json({ message: "Record deleted successfully" });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ error: "Failed to delete data" });
  }
}



// Get  Kalam Submissions with Limit (Frontend)
async function getKalamWithLimit(req, res) {
  const count = parseInt(req.query.count) || 3; // default 3 if not provided
  try {
    const [rows] = await pool.query('SELECT * FROM kalam_submissions ORDER BY created_at DESC LIMIT ?', [count]);
    res.json(rows);
  } catch (error) {
    console.error('Fetch Approved With Limit Error:', error);
    res.status(500).json({ error: 'Failed to get approved data with limit' });
  }
}


// Get Total Count of Kalam Submissions (No Filter)
async function getKalamSubmissionCount(req, res) {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM kalam_submissions');
    res.json({ total: rows[0].total });
  } catch (error) {
    console.error('Count Fetch Error:', error);
    res.status(500).json({ error: 'Failed to get total count' });
  }
}

module.exports = {
  insertKalam,
  getKalamSubmissions,
  getApprovedKalamSubmissions,
  getKalamById,
  updateKalam,
  deleteKalam,
  getKalamWithLimit,
  getKalamSubmissionCount
};
