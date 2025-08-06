const pool = require('../db'); // adjust path as needed

// Insert new mazmoon submission
async function insertMazmoon(req, res) {
  try {
    const {
      name,
      email,
      whatsapp,
      city,
      country,
      mazmoon_title,
      mazmoon_category,
      mazmoon_content
    } = req.body;

    const sql = `INSERT INTO mazmoon_submissions 
      (name, email, whatsapp, city, country, mazmoon_title, mazmoon_category, mazmoon_content)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [name, email, whatsapp, city, country, mazmoon_title, mazmoon_category, mazmoon_content];

    const [result] = await pool.query(sql, values);
    
    res.status(201).json({ message: 'مضمون کامیابی کے ساتھ جمع ہوگیا', id: result.insertId });
  } catch (error) {
    console.error('Insert Error:', error);
    res.status(500).json({ error: 'مضمون جمع کرنے میں خرابی ہوئی' });
  }
}

// Get all mazmoon submissions (Admin)
async function getAllMazmoon(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM mazmoon_submissions ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Fetch Error:', error);
    res.status(500).json({ error: 'ڈیٹا حاصل کرنے میں مسئلہ' });
  }
}

// Get approved mazmoon submissions (Frontend)
async function getApprovedMazmoon(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM mazmoon_submissions WHERE Approved = 0 ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Fetch Approved Error:', error);
    res.status(500).json({ error: 'منظور شدہ ڈیٹا حاصل کرنے میں مسئلہ' });
  }
}

// Get single mazmoon by ID
async function getMazmoonById(req, res) {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM mazmoon_submissions WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'ریکارڈ نہیں ملا' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Fetch By ID Error:', error);
    res.status(500).json({ error: 'ریکارڈ حاصل کرنے میں مسئلہ' });
  }
}

// Update mazmoon by ID
async function updateMazmoon(req, res) {
  const { id } = req.params;
  const {
    name,
    email,
    whatsapp,
    city,
    country,
    mazmoon_title,
    mazmoon_category,
    mazmoon_content,
    Approved
  } = req.body;

  try {
    const sql = `UPDATE mazmoon_submissions SET 
      name = ?, email = ?, whatsapp = ?, city = ?, country = ?, 
      mazmoon_title = ?, mazmoon_category = ?, mazmoon_content = ?, Approved = ?
      WHERE id = ?`;

    const values = [name, email, whatsapp, city, country, mazmoon_title, mazmoon_category, mazmoon_content, Approved, id];

    const [result] = await pool.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ریکارڈ نہیں ملا' });
    }

    res.json({ message: 'ریکارڈ کامیابی سے اپ ڈیٹ ہوگیا' });
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ error: 'ریکارڈ اپ ڈیٹ کرنے میں مسئلہ' });
  }
}

// Delete mazmoon by ID
async function deleteMazmoon(req, res) {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM mazmoon_submissions WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ریکارڈ نہیں ملا' });
    }

    res.json({ message: 'ریکارڈ کامیابی سے حذف ہوگیا' });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ error: 'ریکارڈ حذف کرنے میں مسئلہ' });
  }
}


// Get Approved Mazmoon Submissions with Limit (Frontend)
async function getMazmoonWithLimit(req, res) {
  const count = parseInt(req.query.count) || 3; // default 3 if not provided
  try {
    const [rows] = await pool.query('SELECT * FROM mazmoon_submissions ORDER BY created_at DESC LIMIT ?', [count]);
    res.json(rows);
  } catch (error) {
    console.error('Fetch Approved With Limit Error:', error);
    res.status(500).json({ error: 'منظور شدہ محدود ڈیٹا حاصل کرنے میں مسئلہ' });
  }
}


// Get Total Count of Mazmoon Submissions (No Filter)
async function getMazmoonSubmissionCount(req, res) {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM mazmoon_submissions');
    res.json({ total: rows[0].total });
  } catch (error) {
    console.error('Count Fetch Error:', error);
    res.status(500).json({ error: 'کل ریکارڈز حاصل کرنے میں مسئلہ' });
  }
}

module.exports = {
  insertMazmoon,
  getAllMazmoon,
  getApprovedMazmoon,
  getMazmoonById,
  updateMazmoon,
  deleteMazmoon,
  getMazmoonWithLimit,
  getMazmoonSubmissionCount
};
