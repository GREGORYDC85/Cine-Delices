const express = require("express");
const db = require("../config/db");

const router = express.Router();

// ✅ Route publique pour récupérer toutes les recettes
router.get("/recipes", (req, res) => {
  const query = `
    SELECT r.*, c.name AS category_name
    FROM recipe r
    LEFT JOIN recipe_category rc ON r.code_recipe = rc.code_recipe
    LEFT JOIN category c ON rc.code_category = c.code_category
    ORDER BY r.code_recipe DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Erreur récupération recettes :", err);
      return res.status(500).json({ message: "Erreur serveur." });
    }
    res.json(results);
  });
});

// 🔍 Route de recherche par mot-clé (titre, description ou catégorie)
router.get("/recipes/search", (req, res) => {
  const searchTerm = req.query.q?.toLowerCase() || "";

  const sql = `
    SELECT 
      r.*, 
      c.name AS category_name
    FROM recipe r
    LEFT JOIN recipe_category rc ON r.code_recipe = rc.code_recipe
    LEFT JOIN category c ON rc.code_category = c.code_category
    WHERE LOWER(r.name) LIKE ?
      OR LOWER(r.description) LIKE ?
      OR LOWER(c.name) LIKE ?
    ORDER BY r.code_recipe DESC
  `;

  const likeQuery = `%${searchTerm}%`;

  db.query(sql, [likeQuery, likeQuery, likeQuery], (err, results) => {
    if (err) {
      console.error("❌ Erreur lors de la recherche :", err);
      return res.status(500).json({ message: "Erreur serveur." });
    }

    res.json(results);
  });
});

module.exports = router;
