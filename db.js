   // db.js
   const mysql = require('mysql2');
   const pool = mysql.createPool({
     host: process.env.DB_HOST,
     user: process.env.DB_USER,
     password: process.env.DB_PASSWORD,
     database: 'Update_naatacademy',
     waitForConnections: true,
     connectionLimit: 10, // or lower, based on your server's limit
     queueLimit: 0
   }).promise();
   module.exports = pool;