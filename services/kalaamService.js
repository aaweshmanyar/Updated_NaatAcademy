const mysql = require('mysql2');

// Create MySQL pool with promise support
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'Update_naatacademy',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

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
