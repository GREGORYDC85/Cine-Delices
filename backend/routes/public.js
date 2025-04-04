const express = require("express");
const db = require("../config/db");

const router = express.Router();

// ✅ Route publique pour récupérer toutes les recettes (affichées sur /recipes)
router.get("/recipes", (req, res) => {
  const query = `
    SELECT r.*, c.name AS category_name
    FROM recipe r
    LEFT JOIN category c ON r.code_category = c.code_category
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

module.exports = router;
