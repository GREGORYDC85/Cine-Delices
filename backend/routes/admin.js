const express = require("express");
const db = require("../config/db");
const authenticateUser = require("../middleware/auth");
const authorizeAdmin = require("../middleware/admin");

const router = express.Router();

// 🔐 Middleware : toutes les routes ci-dessous sont sécurisées
router.use(authenticateUser, authorizeAdmin);

// 🧪 Dashboard admin simple
router.get("/dashboard", (req, res) => {
  res.json({ message: "Bienvenue sur le dashboard admin", admin: req.user });
});

// 📚 Liste des œuvres
router.get("/works", async (req, res) => {
  try {
    const connection = await db.promise();
    const [works] = await connection.query(
      "SELECT code_work, title FROM work ORDER BY title"
    );
    res.json(works);
  } catch (err) {
    console.error("❌ Erreur récupération œuvres :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// ➕ Ajouter une œuvre
router.post("/works", async (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === "") {
    return res.status(400).json({ message: "Le titre est requis." });
  }

  try {
    const connection = await db.promise();
    await connection.query("INSERT INTO work (title) VALUES (?)", [
      title.trim(),
    ]);
    res.status(201).json({ message: "✅ Œuvre ajoutée avec succès !" });
  } catch (err) {
    console.error("❌ Erreur ajout œuvre :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// ✅ Récupérer toutes les recettes avec la catégorie (correction ici)
router.get("/recettes", async (req, res) => {
  try {
    const connection = await db.promise();
    const [recipes] = await connection.query(`
      SELECT 
        r.code_recipe, 
        r.name, 
        r.author, 
        rc.code_category,
        COALESCE(c.name, 'Non classée') AS category,
        r.total_time, 
        r.servings, 
        r.picture, 
        r.description, 
        r.instruction, 
        rw.code_work
      FROM recipe r
      LEFT JOIN recipe_category rc ON r.code_recipe = rc.code_recipe
      LEFT JOIN category c ON rc.code_category = c.code_category
      LEFT JOIN recipe_work rw ON r.code_recipe = rw.code_recipe
    `);
    res.json(recipes);
  } catch (err) {
    console.error("❌ Erreur récupération recettes :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
