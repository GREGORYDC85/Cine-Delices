const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// 📌 Connexion à la base de données MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "1234",
  database: process.env.DB_NAME || "cine_delices",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Erreur de connexion à MySQL:", err);
    process.exit(1); // Arrête le serveur si la connexion échoue
  }
  console.log("✅ Connecté à MySQL");
});

// 📌 Importer les routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);

// 📌 Importer les middlewares
const authenticateUser = require("./middleware/auth");
const authorizeAdmin = require("./middleware/admin");

// 📌 Route protégée pour le tableau de bord (admin uniquement)
app.get("/admin/dashboard", authenticateUser, authorizeAdmin, (req, res) => {
  res.json({ message: "Bienvenue sur le tableau de bord Admin" });
});

// 📌 Route de test pour voir si le serveur tourne
app.get("/", (req, res) => {
  res.send("🚀 API CineDélices fonctionne !");
});

// 📌 Vérifier si le port 5001 est déjà utilisé et le libérer si nécessaire
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});

// 📌 Gérer les erreurs de démarrage (ex: port déjà utilisé)
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} déjà utilisé. Tente de libérer le port...`);
    process.exit(1); // Arrête proprement le serveur
  } else {
    console.error("❌ Erreur serveur :", err);
  }
});
