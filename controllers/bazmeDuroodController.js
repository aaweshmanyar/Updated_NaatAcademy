const pool = require('../db')

// Insert a new entry
exports.insertBazmeDurood = async (req, res) => {
    try {
        const { full_name_roman, country, city, durood_count, dua } = req.body;

        const [result] = await pool.query(
            `INSERT INTO bazmedurood (full_name_roman, country, city, durood_count, dua) VALUES (?, ?, ?, ?, ?)`,
            [full_name_roman, country, city, durood_count, dua]
        );

        res.status(201).json({ message: 'Entry inserted successfully', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all entries
exports.getAllBazmeDurood = async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM bazmedurood ORDER BY inserted_date DESC`);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get by ID
exports.getBazmeDuroodById = async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM bazmedurood WHERE id = ?`, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get with limit
exports.getBazmeDuroodWithLimit = async (req, res) => {
    try {
        const limit = parseInt(req.params.limit);
        const [rows] = await pool.query(`SELECT * FROM bazmedurood ORDER BY inserted_date DESC LIMIT ?`, [limit]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get with limit & offset (pagination)
exports.getBazmeDuroodPaginated = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit);
        const offset = parseInt(req.query.offset);
        const [rows] = await pool.query(
            `SELECT * FROM bazmedurood ORDER BY inserted_date DESC LIMIT ? OFFSET ?`,
            [limit, offset]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



// Get total durood count
exports.getTotalDuroodCount = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT SUM(durood_count) AS total_durood_count
       FROM bazmedurood
       WHERE durood_count IS NOT NULL AND durood_count > 0`
    );

    // If the table is empty, SUM returns null, so default to 0
    const total = rows[0].total_durood_count || 0;

    res.json({ total_durood_count: total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
