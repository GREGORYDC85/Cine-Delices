// routes/adminRecettes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authenticateUser = require("../middleware/auth");
const authorizeAdmin = require("../middleware/admin");

/* =====================================================
 ✅ Route publique pour breadcrumb (accessible sans login)
====================================================== */
router.get("/public/:id", (req, res) => {
  const recipeId = req.params.id;

  const sql = `
    SELECT 
      r.code_recipe, 
      r.name
    FROM recipe r
    WHERE r.code_recipe = ?
  `;

  db.query(sql, [recipeId], (err, results) => {
    if (err) {
      console.error("❌ Erreur publique récupération recette :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Recette non trouvée" });
    }
    res.json(results[0]);
  });
});

/* =====================================================
 ✅ Route admin : Obtenir toutes les recettes
====================================================== */
router.get("/", authenticateUser, authorizeAdmin, (req, res) => {
  const sql = `
    SELECT 
      r.code_recipe, 
      r.name, 
      r.author, 
      rc.code_category,
      COALESCE(c.name, 'Non classée') AS category
    FROM recipe r
    LEFT JOIN recipe_category rc ON r.code_recipe = rc.code_recipe
    LEFT JOIN category c ON rc.code_category = c.code_category
    ORDER BY r.code_recipe DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Erreur récupération des recettes :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    res.json(results);
  });
});

/* =====================================================
 ✅ Route admin : Obtenir une recette par ID
====================================================== */
router.get("/:id", authenticateUser, authorizeAdmin, (req, res) => {
  const recipeId = req.params.id;

  const sql = `
    SELECT 
      r.code_recipe, 
      r.name, 
      r.author, 
      rc.code_category,
      COALESCE(c.name, 'Non classée') AS category
    FROM recipe r
    LEFT JOIN recipe_category rc ON r.code_recipe = rc.code_recipe
    LEFT JOIN category c ON rc.code_category = c.code_category
    WHERE r.code_recipe = ?
  `;

  db.query(sql, [recipeId], (err, results) => {
    if (err) {
      console.error("❌ Erreur récupération de la recette :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Recette non trouvée" });
    }
    res.json(results[0]);
  });
});

module.exports = router;
