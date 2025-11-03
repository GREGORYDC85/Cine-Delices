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
// 🌍 Middlewares globaux
// ================================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://cine-delices-frontend.onrender.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
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
};

if (process.env.DB_SSL === "true") {
  dbOptions.ssl = { rejectUnauthorized: false };
  console.log("🔐 SSL activé pour connexion MySQL Aiven");
}

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
// 🧱 Middleware d'authentification admin
// ================================
function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Token manquant" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "maSuperCleSecrete"
    );

    if (decoded.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Accès refusé : administrateur requis" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
}

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
      r.ingredients,
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
// 🧮 Route Admin - Dashboard
// ================================
app.get("/admin/dashboard", verifyAdmin, async (req, res) => {
  try {
    const [[recipesCount], [usersCount], [worksCount], [commentsCount]] =
      await Promise.all([
        db.promise().query("SELECT COUNT(*) AS count FROM recipe"),
        db.promise().query("SELECT COUNT(*) AS count FROM user"),
        db.promise().query("SELECT COUNT(*) AS count FROM work"),
        db.promise().query("SELECT COUNT(*) AS count FROM comment"),
      ]);

    res.json({
      message: "Bienvenue, administrateur Cine-Délices !",
      recipesCount: recipesCount[0]?.count || 0,
      usersCount: usersCount[0]?.count || 0,
      worksCount: worksCount[0]?.count || 0,
      commentsCount: commentsCount[0]?.count || 0,
    });
  } catch (error) {
    console.error("❌ Erreur Dashboard :", error);
    res.status(500).json({ error: "Erreur serveur lors du calcul des stats" });
  }
});

// ================================
// 🚀 Lancement du serveur
// ================================
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Serveur CineDélices lancé sur le port ${PORT}`);
});

module.exports = db;
