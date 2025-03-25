const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// 📌 Rendre les images accessibles
app.use("/images", express.static("public/images"));

// 📌 Connexion MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "1234",
  database: process.env.DB_NAME || "cine_delices",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Erreur connexion MySQL :", err);
    process.exit(1);
  }
  console.log("✅ Connecté à MySQL");
});

// 📌 Routes importées
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);

// 📌 Middleware JWT
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Aucun token fourni." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token invalide" });
  }
};

// 📌 Récupération profil utilisateur
app.get("/api/profile", authenticateUser, (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT code_user AS id, name, firstname, email, pseudo, description, gender, birthdate
    FROM site_user
    WHERE code_user = ?;
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("❌ Erreur récupération profil :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.json(result[0]);
  });
});

// 📌 Mise à jour du profil utilisateur
app.put("/api/profile/update", authenticateUser, (req, res) => {
  const userId = req.user.id;
  const { firstname, name, email, pseudo, description, gender, birthdate } =
    req.body;

  const sql = `
    UPDATE site_user
    SET firstname = ?, name = ?, email = ?, pseudo = ?, description = ?, gender = ?, birthdate = ?
    WHERE code_user = ?;
  `;

  db.query(
    sql,
    [firstname, name, email, pseudo, description, gender, birthdate, userId],
    (err) => {
      if (err) {
        console.error("❌ Erreur mise à jour profil :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }
      res.json({ message: "✅ Profil mis à jour avec succès !" });
    }
  );
});

// 📌 Mise à jour du mot de passe
app.put("/api/profile/password", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res
      .status(400)
      .json({ error: "Mot de passe invalide (6 caractères min)" });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const sql = "UPDATE site_user SET password = ? WHERE code_user = ?";

    db.query(sql, [hashedPassword, userId], (err) => {
      if (err) {
        console.error("❌ Erreur maj mot de passe :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }
      res.json({ message: "🔒 Mot de passe mis à jour." });
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur hashage" });
  }
});

// 📌 Middleware Admin
const authorizeAdmin = require("./middleware/admin");

// 📌 Route admin
app.get("/admin/dashboard", authenticateUser, authorizeAdmin, (req, res) => {
  res.json({ message: "Bienvenue sur le tableau de bord Admin" });
});

// 📌 Récupération de toutes les recettes
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
        SELECT GROUP_CONCAT(DISTINCT CONCAT(i.name, ' (', con.quantity, ')') ORDER BY i.name SEPARATOR ', ')
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
      console.error("❌ Erreur récupération recettes :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    res.json(result);
  });
});

// 📌 Récupération d'une recette spécifique
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
        SELECT GROUP_CONCAT(DISTINCT CONCAT(i.name, ' (', con.quantity, ')') ORDER BY i.name SEPARATOR ', ')
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
      console.error("❌ Erreur récupération recette :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "Recette non trouvée" });
    }
    res.json(result[0]);
  });
});

// 📌 Route test
app.get("/", (req, res) => {
  res.send("🚀 API CineDélices fonctionne !");
});

// 📌 Lancement du serveur
const PORT = process.env.PORT || 5002;
const server = app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} déjà utilisé.`);
    process.exit(1);
  } else {
    console.error("❌ Erreur serveur :", err);
  }
});
