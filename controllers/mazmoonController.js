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

// Get all mazmoon submissions (optional)
async function getAllMazmoon(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM mazmoon_submissions ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Fetch Error:', error);
    res.status(500).json({ error: 'ڈیٹا حاصل کرنے میں مسئلہ' });
  }
}

module.exports = {
  insertMazmoon,
  getAllMazmoon
};
