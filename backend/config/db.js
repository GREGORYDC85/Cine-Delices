const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234", // Vérifie que c'est bien ton mot de passe MySQL
  database: "cine_delices",
});

// Vérifier la connexion
db.connect((err) => {
  if (err) {
    console.error("❌ Erreur de connexion à MySQL:", err);
    return;
  }
  console.log("✅ Connecté à MySQL");
});

module.exports = db;
