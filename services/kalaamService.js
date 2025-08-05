const pool = require('../db')


// Function to fetch kalaam by ID
exports.getKalaamById = async (id) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Kalaam WHERE KalaamID = ?', [id]);

    // Return first kalaam or null if not found
    return rows.length ? rows[0] : null;
  } catch (err) {
    console.error('DB Error in getKalaamById:', err);
    throw err;
  }
};
