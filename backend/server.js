const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// 📌 Connexion à la base de données MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234", // Vérifie que c'est bien ton mot de passe MySQL
  database: "cine_delices",
});

// 📌 Vérifier la connexion à MySQL
db.connect((err) => {
  if (err) {
    console.error("❌ Erreur de connexion à MySQL:", err);
    return;
  }
  console.log("✅ Connecté à MySQL");
});

// 📌 Importer les routes d'authentification
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes); // ✅ Ajoute les routes d'authentification

// 📌 Importer le middleware d'authentification
const authenticateUser = require("./middleware/auth");

// 📌 Importer les routes utilisateur (profil sécurisé)
const userRoutes = require("./routes/user");
app.use("/user", userRoutes);

// 📌 Importer les routes admin
const adminRoutes = require("./routes/admin");
app.use("/admin", adminRoutes); // ✅ Active les routes admin

// 📌 Importer le middleware authorizeAdmin (rôle admin uniquement)
const authorizeAdmin = require("./middleware/admin");

// 📌 Route protégée pour le tableau de bord (admin uniquement)
app.get("/admin/dashboard", authenticateUser, authorizeAdmin, (req, res) => {
  // Si l'utilisateur est authentifié et a le rôle "admin", alors il accède au tableau de bord
  res.json({ message: "Bienvenue sur le tableau de bord Admin" });
});

// 📌 Route API pour récupérer toutes les recettes et leurs films/séries associés
app.get("/recipes", (req, res) => {
  const sql = `
    SELECT r.code_recipe, r.name AS recipe_name, r.picture, r.description, 
           w.title AS film_serie
    FROM recipe r
    LEFT JOIN recipe_work rw ON r.code_recipe = rw.code_recipe
    LEFT JOIN work w ON rw.code_work = w.code_work
    ORDER BY r.code_recipe;
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ Erreur lors de la récupération des recettes :", err);
      res.status(500).json({ error: "Erreur serveur" });
      return;
    }
    res.json(result);
  });
});

// 📌 Route API pour récupérer une recette par ID
app.get("/recipes/:id", (req, res) => {
  const recipeId = req.params.id;
  const sql = `
    SELECT r.code_recipe, r.name AS recipe_name, r.picture, r.description, 
           w.title AS film_serie
    FROM recipe r
    LEFT JOIN recipe_work rw ON r.code_recipe = rw.code_recipe
    LEFT JOIN work w ON rw.code_work = w.code_work
    WHERE r.code_recipe = ? 
  `;

  db.query(sql, [recipeId], (err, result) => {
    if (err) {
      console.error("❌ Erreur lors de la récupération de la recette :", err);
      res.status(500).json({ error: "Erreur serveur" });
      return;
    }
    res.json(result.length ? result[0] : { message: "Recette non trouvée" });
  });
});

// 📌 Route protégée pour afficher le profil utilisateur
app.get("/user/profile", authenticateUser, (req, res) => {
  res.json({ message: "Profil utilisateur sécurisé", user: req.user });
});

// 📌 Route de test pour voir si le serveur tourne
app.get("/", (req, res) => {
  res.send("🚀 API CineDélices fonctionne !");
});

// 📌 Démarrer le serveur
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur ${PORT}`);
});
