const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "cine_delices",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Erreur de connexion à MySQL:", err);
  } else {
    console.log("✅ Connecté à MySQL");
  }
});

module.exports = db;
