const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");
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
    process.exit(1);
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

// 📌 Middleware d'authentification
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: "Accès non autorisé. Aucun token fourni." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token invalide" });
  }
};

// 📌 Route protégée : profil utilisateur
app.get("/api/profile", authenticateUser, (req, res) => {
  const userId = req.user.id;
  const sql =
    "SELECT id, first_name, last_name, email, gender, age FROM users WHERE id = ?";

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("❌ Erreur lors de la récupération du profil :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.json(result[0]);
  });
});

// 📌 Route pour mettre à jour le profil
app.put("/api/profile/update", authenticateUser, (req, res) => {
  const userId = req.user.id;
  const { first_name, last_name, gender, age } = req.body;

  const sql = `
    UPDATE users 
    SET first_name = ?, last_name = ?, gender = ?, age = ?
    WHERE id = ?;
  `;

  db.query(sql, [first_name, last_name, gender, age, userId], (err, result) => {
    if (err) {
      console.error("❌ Erreur lors de la mise à jour du profil :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    res.json({ message: "✅ Profil mis à jour avec succès !" });
  });
});

// 📌 Middleware d'autorisation admin
const authorizeAdmin = require("./middleware/admin");

// 📌 Route admin
app.get("/admin/dashboard", authenticateUser, authorizeAdmin, (req, res) => {
  res.json({ message: "Bienvenue sur le tableau de bord Admin" });
});

// 📌 Route pour toutes les recettes
app.get("/recipes", (req, res) => {
  const sql = `
    SELECT 
      r.code_recipe, 
      r.name AS recipe_name, 
      r.picture, 
      r.description,
      r.instruction,
      COALESCE(c.name, 'Autre') AS category,
      w.title AS film_serie,
      (
        SELECT GROUP_CONCAT(DISTINCT i.name ORDER BY i.name SEPARATOR ', ')
        FROM contains con
        JOIN ingredient i ON con.code_ingredient = i.code_ingredient
        WHERE con.code_recipe = r.code_recipe
      ) AS ingredients
    FROM recipe r
    LEFT JOIN recipe_category rc ON r.code_recipe = rc.code_recipe
    LEFT JOIN category c ON rc.code_category = c.code_category
    LEFT JOIN recipe_work rw ON r.code_recipe = rw.code_recipe
    LEFT JOIN work w ON rw.code_work = w.code_work
    ORDER BY FIELD(c.name, 'Entrée', 'Plat', 'Dessert', 'Autre'), r.code_recipe;
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ Erreur lors de la récupération des recettes :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    console.log(`✅ ${result.length} recettes récupérées avec succès !`);
    res.json(result);
  });
});

// 📌 Route pour une recette spécifique
app.get("/recipes/:id", (req, res) => {
  const recipeId = req.params.id;

  const sql = `
    SELECT 
      r.code_recipe, 
      r.name AS recipe_name, 
      r.picture, 
      r.description,
      r.instruction,
      COALESCE(c.name, 'Autre') AS category, 
      w.title AS film_serie,
      (
        SELECT GROUP_CONCAT(DISTINCT i.name ORDER BY i.name SEPARATOR ', ')
        FROM contains con
        JOIN ingredient i ON con.code_ingredient = i.code_ingredient
        WHERE con.code_recipe = r.code_recipe
      ) AS ingredients
    FROM recipe r
    LEFT JOIN recipe_category rc ON r.code_recipe = rc.code_recipe
    LEFT JOIN category c ON rc.code_category = c.code_category
    LEFT JOIN recipe_work rw ON r.code_recipe = rw.code_recipe
    LEFT JOIN work w ON rw.code_work = w.code_work
    WHERE r.code_recipe = ?;
  `;

  db.query(sql, [recipeId], (err, result) => {
    if (err) {
      console.error("❌ Erreur lors de la récupération de la recette :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    if (result.length === 0) {
      console.log("⚠️ Recette non trouvée :", recipeId);
      return res.status(404).json({ error: "Recette non trouvée" });
    }
    console.log(`✅ Recette ${recipeId} récupérée avec succès !`);
    res.json(result[0]);
  });
});

// 📌 Test serveur
app.get("/", (req, res) => {
  res.send("🚀 API CineDélices fonctionne !");
});

// 📌 Démarrer le serveur
const PORT = process.env.PORT || 5002;
const server = app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} déjà utilisé. Tente de libérer le port...`);
    process.exit(1);
  } else {
    console.error("❌ Erreur serveur :", err);
  }
});
