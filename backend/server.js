const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

// 🔗 Import connexion MySQL (depuis db.js)
const db = require("./db");

const app = express();

// 🔧 Middlewares globaux
app.use(cors());
app.use(express.json());
app.use("/images", express.static("public/images"));

// 🧠 Route debug
app.get("/", (req, res) => {
  res.send("🚀 API CineDélices fonctionne et est connectée à Aiven !");
});

// 📜 Route : toutes les recettes
app.get("/recipes", (req, res) => {
  const sql = `
    SELECT 
      r.code_recipe, 
      r.name AS recipe_name, 
      r.picture, 
      r.description, 
      w.title AS film_serie
    FROM recipe r
    LEFT JOIN recipe_work rw ON r.code_recipe = rw.code_recipe
    LEFT JOIN work w ON rw.code_work = w.code_work
    ORDER BY r.code_recipe;
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ Erreur récupération recettes :", err);
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
      w.title AS film_serie
    FROM recipe r
    LEFT JOIN recipe_work rw ON r.code_recipe = rw.code_recipe
    LEFT JOIN work w ON rw.code_work = w.code_work
    WHERE r.code_recipe = ?;
  `;

  db.query(sql, [recipeId], (err, result) => {
    if (err) {
      console.error("❌ Erreur récupération recette :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    res.json(result.length ? result[0] : { message: "Recette non trouvée" });
  });
});

// ✅ Middleware d'authentification JWT (optionnel)
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Aucun token fourni." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Token invalide" });
  }
};

// 🚀 Lancer le serveur
const PORT = process.env.PORT || 5003;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});
