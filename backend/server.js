// ================================
// 🌐 Configuration & Imports
// ================================
require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const winston = require("winston");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const app = express();

// ================================
// 📁 Crée le dossier logs/ et teste l'écriture
// ================================
const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}
fs.writeFileSync(
  path.join(logsDir, "test_ecriture.txt"),
  "Node.js peut écrire ici !"
);
console.log("✅ Fichier test_ecriture.txt créé dans logs/");

// ================================
// 📝 Configuration des logs avec Winston
// ================================
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
    }),
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
    }),
  ],
});

// ================================
// 🌍 Middleware
// ================================
app.use(cors());
// app.use(helmet()); // Désactivé pour le développement (réactive-le en production)
app.use(express.json({ limit: "10mb" }));

// ================================
// 🔧 Middleware pour injecter le logger et le pool MySQL
// ================================
app.use((req, res, next) => {
  req.logger = logger;
  next();
});

// ================================
// ⚙️ Configuration MySQL
// ================================
const dbOptions = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
};

const db = mysql.createPool(dbOptions);
db.getConnection()
  .then(() => logger.info("✅ Connexion MySQL établie !"))
  .catch((err) => logger.error(`❌ Erreur MySQL : ${err.message}`));

// Injecte le pool MySQL dans les requêtes
app.use((req, res, next) => {
  req.db = db;
  next();
});

// ================================
// 📤 Import des routes
// ================================
const recipesRoutes = require("./routes/recipes");

// ================================
// 📤 Utilisation des routes
// ================================
app.use("/api/recipes", recipesRoutes);

// ================================
// 🚀 Route racine (test)
// ================================
app.get("/", (req, res) => {
  req.logger.info("✅ Route / appelée");
  res.send("API CineDélices en marche !");
});

// ================================
// 🚀 Lancement du serveur
// ================================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  logger.info(`✅ Serveur démarré sur http://localhost:${PORT}`);
});

// ================================
// 🛠️ Gestion des erreurs globales
// ================================
app.use((err, req, res, next) => {
  req.logger.error(`❌ Erreur serveur : ${err.message}`);
  res.status(500).json({ error: "Erreur interne du serveur" });
});
