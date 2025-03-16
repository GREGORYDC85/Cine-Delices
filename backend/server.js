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
    process.exit(1); // 🚀 Arrête le serveur si la connexion échoue
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

// 📌 Route pour récupérer les recettes classées par catégorie
app.get("/recipes", (req, res) => {
  const sql = `
    SELECT 
      r.code_recipe, 
      r.name AS recipe_name, 
      r.picture, 
      r.description,
      COALESCE(c.name, 'Autre') AS category,  -- Gère les recettes sans catégorie
      w.title AS film_serie
    FROM recipe r
    LEFT JOIN recipe_category rc ON r.code_recipe = rc.code_recipe
    LEFT JOIN category c ON rc.code_category = c.code_category
    LEFT JOIN recipe_work rw ON r.code_recipe = rw.code_recipe
    LEFT JOIN work w ON rw.code_work = w.code_work
    ORDER BY FIELD(c.name, 'Entrée', 'Plat', 'Dessert', 'Autre'), r.code_recipe; -- Trie dans l’ordre logique
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ Erreur lors de la récupération des recettes :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    console.log(
      `✅ ${result.length} recettes récupérées et triées par catégorie !`
    );
    res.json(result);
  });
});

// 📌 Route pour récupérer une recette par son ID
app.get("/recipes/:id", (req, res) => {
  const recipeId = req.params.id;
  const sql = `
    SELECT 
      r.code_recipe, 
      r.name AS recipe_name, 
      r.picture, 
      r.description,
      COALESCE(c.name, 'Autre') AS category, 
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

// 📌 Route de test pour voir si le serveur tourne
app.get("/", (req, res) => {
  res.send("🚀 API CineDélices fonctionne !");
});

// 📌 Démarrer le serveur et gérer les erreurs de port
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
