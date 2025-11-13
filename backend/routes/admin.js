const express = require("express");
const db = require("../config/db"); // ✅ Pool MySQL déjà configuré pour les promesses
const authenticateUser = require("../middleware/auth");
const authorizeAdmin = require("../middleware/admin");
const router = express.Router();

// 🔐 Middleware global : toutes les routes ci-dessous nécessitent un admin authentifié
router.use(authenticateUser, authorizeAdmin);

// ================================
// 🧮 DASHBOARD ADMIN (statistiques globales)
// ================================
router.get("/dashboard", async (req, res) => {
  try {
    const [[recipesCount], [usersCount], [worksCount], [commentsCount]] =
      await Promise.all([
        db.query("SELECT COUNT(*) AS count FROM recipe"),
        db.query("SELECT COUNT(*) AS count FROM site_user"),
        db.query("SELECT COUNT(*) AS count FROM work"),
        db.query("SELECT COUNT(*) AS count FROM comment"),
      ]);
    res.json({
      message: "Bienvenue, administrateur Cine-Délices !",
      recipesCount: recipesCount[0]?.count || 0,
      usersCount: usersCount[0]?.count || 0,
      worksCount: worksCount[0]?.count || 0,
      commentsCount: commentsCount[0]?.count || 0,
    });
  } catch (err) {
    console.error("❌ Erreur Dashboard :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// ================================
// 🎬 ŒUVRES (films/séries)
// ================================
router.get("/works", async (req, res) => {
  try {
    const [works] = await db.query(
      "SELECT code_work, title FROM work ORDER BY title"
    );
    res.json(works);
  } catch (err) {
    console.error("❌ Erreur récupération œuvres :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

router.post("/works", async (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === "") {
    return res.status(400).json({ message: "Le titre est requis." });
  }
  try {
    await db.query("INSERT INTO work (title) VALUES (?)", [title.trim()]);
    res.status(201).json({ message: "✅ Œuvre ajoutée avec succès !" });
  } catch (err) {
    console.error("❌ Erreur ajout œuvre :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// ================================
// 🍽️ RECETTES (admin CRUD)
// ================================
router.get("/recettes", async (req, res) => {
  try {
    const [recipes] = await db.query(`
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
      ORDER BY r.code_recipe DESC
    `);
    res.json(recipes);
  } catch (err) {
    console.error("❌ Erreur récupération recettes :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

module.exports = router;
