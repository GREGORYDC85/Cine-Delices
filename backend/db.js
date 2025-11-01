const mysql = require("mysql2");
const fs = require("fs");
require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectTimeout: 10000,
};

// 🔐 Connexion sécurisée avec SSL si activé
if (process.env.DB_SSL === "true") {
  try {
    dbConfig.ssl = {
      ca: fs.readFileSync(__dirname + "/ca.pem"),
      rejectUnauthorized: true,
    };
    console.log("🔐 Certificat SSL chargé avec succès");
  } catch (err) {
    console.error("⚠️ Erreur chargement certificat SSL :", err.message);
  }
}

const db = mysql.createConnection(dbConfig);

db.connect((err) => {
  if (err) {
    console.error("❌ Erreur connexion MySQL :", err.message);
  } else {
    console.log("✅ Connecté à MySQL Aiven !");
  }
});

module.exports = db;
