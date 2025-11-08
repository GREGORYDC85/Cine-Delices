// ================================
// 🌐 Configuration & Imports
// ================================
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config(); // Charge .env uniquement en local
}

console.log("🔍 Variables d'environnement détectées :");
console.log({
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_NAME: process.env.DB_NAME,
  DB_SSL: process.env.DB_SSL,
});

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();

// ================================
// 🌍 Middleware CORS sécurisé (Render + local)
// ================================
const allowedOrigins = [
  "http://localhost:5173",
  "https://cine-delices-frontend.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.warn("🚫 CORS refusé pour :", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());
app.use("/images", express.static("public/images"));

// ================================
// ⚙️ Configuration MySQL (Aiven)
// ================================
const dbOptions = {
  host: process.env.DB_HOST?.trim(),
  user: process.env.DB_USER?.trim(),
  password: process.env.DB_PASSWORD?.trim(),
  database: process.env.DB_NAME?.trim(),
  port: Number(process.env.DB_PORT) || 17025,
  connectTimeout: 10000,
  ssl:
    process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
};

console.log("🧩 Configuration MySQL finale :", dbOptions);

const db = mysql.createConnection(dbOptions);

db.connect((err) => {
  if (err) {
    console.error("❌ Erreur connexion MySQL :", err.message);
  } else {
    console.log("✅ Connecté à MySQL Aiven !");
  }
});

// ================================
// 🔗 Import des routes
// ================================
const authRoutes = require("./routes/auth"); // ✅ Ajouté
const adminRoutes = require("./routes/admin"); // ✅ (si tu veux les routes admin séparées)

// ================================
// 📦 Utilisation des routes
// ================================
app.use("/auth", authRoutes); // ✅ active /auth/login et /auth/register
app.use("/admin", adminRoutes); // ✅ active /admin/dashboard, /admin/works, etc.

// ================================
// 📡 ROUTES PUBLIQUES
// ================================
app.get("/", (req, res) => {
  res.send("🚀 API CineDélices connectée à Aiven et déployée sur Render !");
});

// 📜 Route : toutes les recettes
app.get("/recipes", (req, res) => {
  const sql = `
    SELECT 
      r.code_recipe, 
      r.name AS recipe_name, 
      r.picture, 
      r.description, 
      c.name AS category, 
      c.code_category, 
      w.title AS film_serie
    FROM recipe r
    LEFT JOIN recipe_category rc ON r.code_recipe = rc.code_recipe
    LEFT JOIN category c ON rc.code_category = c.code_category
    LEFT JOIN recipe_work rw ON r.code_recipe = rw.code_recipe
    LEFT JOIN work w ON rw.code_work = w.code_work
    ORDER BY r.code_recipe;
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ Erreur MySQL (toutes les recettes) :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    res.json(result);
  });
});

// 📜 Route : recette par ID
app.get("/recipes/:id", (req, res) => {
  const recipeId = req.params.id;
  const sql = `
    SELECT 
      r.code_recipe, 
      r.name AS recipe_name, 
      r.picture, 
      r.description, 
      c.name AS category, 
      c.code_category, 
      r.instruction,
      w.title AS film_serie
    FROM recipe r
    LEFT JOIN recipe_category rc ON r.code_recipe = rc.code_recipe
    LEFT JOIN category c ON rc.code_category = c.code_category
    LEFT JOIN recipe_work rw ON r.code_recipe = rw.code_recipe
    LEFT JOIN work w ON rw.code_work = w.code_work
    WHERE r.code_recipe = ?;
  `;

  db.query(sql, [recipeId], (err, result) => {
    if (err) {
      console.error("❌ Erreur MySQL (recette ID) :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    res.json(result.length ? result[0] : { message: "Recette non trouvée" });
  });
});

// ================================
// 🚀 Lancement du serveur
// ================================
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Serveur CineDélices lancé sur le port ${PORT}`);
});

module.exports = require("./config/db");
