const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: "127.0.0.1", // 🔥 correction clé
  user: "root",
  password: "1234",
  database: "cine_delices",
  port: 3306, // 🔥 explicite
});

db.connect((err) => {
  if (err) {
    console.error("❌ Erreur de connexion à MySQL :", err.message);
    return;
  }
  console.log("✅ Connecté à MySQL");
});

module.exports = db;
