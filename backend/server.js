const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();

// 🔗 Middleware globaux
app.use(cors());
app.use(express.json());
app.use("/images", express.static("public/images"));

// 🔌 Connexion MySQL
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

// 🔐 Middlewares
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

const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Accès interdit (admin uniquement)" });
  }
  next();
};

// ✅ Import des routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const likeRoutes = require("./routes/likes");
const commentRoutes = require("./routes/comments");
const adminCommentRoutes = require("./routes/adminComments");
const adminWorksRoutes = require("./routes/adminWorks");
const adminUsersRoutes = require("./routes/adminUsers");

// 📦 Montage des routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/admin/comments", adminCommentRoutes);
app.use("/admin/works", adminWorksRoutes);
app.use("/admin/users", adminUsersRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentRoutes); // ✅ route manquante ajoutée ici

// ✅ Route profil utilisateur connecté
app.get("/api/profile", authenticateUser, (req, res) => {
  const userId = req.user.id;

  db.query(
    "SELECT pseudo, email, firstname, name, gender, birthdate, description FROM site_user WHERE code_user = ?",
    [userId],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Erreur serveur." });
      if (result.length === 0)
        return res.status(404).json({ error: "Utilisateur non trouvé." });
      res.json(result[0]);
    }
  );
});

// ✅ Mise à jour profil
app.put("/api/profile/update", authenticateUser, (req, res) => {
  const userId = req.user.id;
  const { pseudo, email, firstname, name, gender, birthdate, description } =
    req.body;

  db.query(
    `UPDATE site_user 
     SET pseudo = ?, email = ?, firstname = ?, name = ?, gender = ?, birthdate = ?, description = ?
     WHERE code_user = ?`,
    [pseudo, email, firstname, name, gender, birthdate, description, userId],
    (err) => {
      if (err) return res.status(500).json({ error: "Erreur MAJ profil" });
      res.json({ message: "✅ Profil mis à jour." });
    }
  );
});

// ✅ Changement de mot de passe
app.put("/api/profile/password", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ error: "Mot de passe requis." });
  }

  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    db.query(
      "UPDATE site_user SET password = ? WHERE code_user = ?",
      [hashed, userId],
      (err) => {
        if (err)
          return res.status(500).json({ error: "Erreur MAJ mot de passe" });
        res.json({ message: "🔐 Mot de passe mis à jour." });
      }
    );
  } catch (err) {
    console.error("❌ Erreur hash mot de passe :", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// ✅ Recettes likées
app.get("/api/likes", authenticateUser, (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT 
      r.code_recipe, 
      r.name AS recipe_name, 
      r.picture, 
      r.description
    FROM liked_recipe l
    JOIN recipe r ON l.code_recipe = r.code_recipe
    WHERE l.code_user = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("❌ Erreur récupération recettes likées :", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    res.json(results);
  });
});

// ✅ Liste publique des recettes
app.get("/recipes", (req, res) => {
  const sql = `
    SELECT 
      r.code_recipe, 
      r.name AS recipe_name, 
      r.picture, 
      r.description,
      r.instruction,
      rc.code_category,                        
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
    ORDER BY FIELD(category, 'Entrée', 'Plat', 'Dessert', 'Autre'), r.code_recipe;
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur serveur" });
    res.json(result);
  });
});

// 🔍 Recherche de recettes
app.get("/recipes/search", (req, res) => {
  const search = `%${req.query.q.toLowerCase()}%`;

  const sql = `
    SELECT DISTINCT 
      r.code_recipe,
      r.name AS recipe_name,
      r.picture,
      r.description,
      r.instruction,
      rc.code_category,
      COALESCE(c.name, 'Autre') AS category,
      COALESCE(w.title, '') AS film_serie,
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
    LEFT JOIN contains ctn ON r.code_recipe = ctn.code_recipe
    LEFT JOIN ingredient ing ON ctn.code_ingredient = ing.code_ingredient
    WHERE 
      LOWER(r.name) LIKE ? OR 
      LOWER(r.description) LIKE ? OR 
      LOWER(w.title) LIKE ? OR
      LOWER(ing.name) LIKE ?
    ORDER BY FIELD(category, 'Entrée', 'Plat', 'Dessert', 'Autre'), r.code_recipe;
  `;

  db.query(sql, [search, search, search, search], (err, results) => {
    if (err) {
      console.error("❌ Erreur recherche :", err);
      return res.status(500).json({ error: "Erreur lors de la recherche." });
    }

    const fixedResults = results.map((recipe) => ({
      ...recipe,
      code_category: recipe.code_category || 0,
    }));

    res.json(fixedResults);
  });
});

// ✅ Détail d'une recette
app.get("/recipes/:id", (req, res) => {
  const recipeId = req.params.id;

  const sql = `
    SELECT 
      r.code_recipe, 
      r.name AS recipe_name, 
      r.picture, 
      r.description,
      r.instruction,
      rc.code_category,                        
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
    if (err) return res.status(500).json({ error: "Erreur serveur" });
    if (result.length === 0)
      return res.status(404).json({ error: "Recette non trouvée" });
    res.json(result[0]);
  });
});

// 🧪 Route test
app.get("/", (req, res) => {
  res.send("🚀 API CineDélices fonctionne !");
});

// 🚀 Lancer le serveur
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
