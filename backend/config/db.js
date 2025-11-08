const mysql = require("mysql2");

const dbOptions = {
  host: process.env.DB_HOST?.trim(),
  user: process.env.DB_USER?.trim(),
  password: process.env.DB_PASSWORD?.trim(),
  database: process.env.DB_NAME?.trim(),
  port: Number(process.env.DB_PORT) || 17025,
  connectTimeout: 10000,
  ssl:
    process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10, // ✅ plusieurs connexions simultanées
  queueLimit: 0,
};

const pool = mysql.createPool(dbOptions);

pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Erreur de connexion à MySQL :", err.message);
  } else {
    console.log("✅ Pool MySQL connecté à Aiven !");
    connection.release();
  }
});

module.exports = pool;
