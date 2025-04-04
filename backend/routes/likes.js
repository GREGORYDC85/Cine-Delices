const express = require("express");
const db = require("../config/db");
const authenticateUser = require("../middleware/auth");

const router = express.Router();

// ✅ Vérifier si l'utilisateur a liké une recette
router.get("/:id", authenticateUser, (req, res) => {
  const userId = req.user.id;
  const recipeId = req.params.id;

  const query = `
    SELECT * FROM liked_recipe
    WHERE code_user = ? AND code_recipe = ?
  `;

  db.query(query, [userId, recipeId], (err, result) => {
    if (err) {
      console.error("❌ Erreur lors de la vérification du like :", err);
      return res.status(500).json({ liked: false });
    }
    res.json({ liked: result.length > 0 });
  });
});

// ✅ Ajouter un like
router.post("/", authenticateUser, (req, res) => {
  const userId = req.user.id;
  const { recipeId } = req.body;

  if (!recipeId) {
    return res.status(400).json({ message: "ID de recette manquant." });
  }

  const query = `
    INSERT IGNORE INTO liked_recipe (code_user, code_recipe)
    VALUES (?, ?)
  `;

  db.query(query, [userId, recipeId], (err) => {
    if (err) {
      console.error("❌ Erreur ajout like :", err);
      return res.status(500).json({ message: "Erreur serveur." });
    }
    res.status(201).json({ message: "❤️ Recette ajoutée aux favoris." });
  });
});

// ✅ Supprimer un like
router.delete("/", authenticateUser, (req, res) => {
  const userId = req.user.id;
  const { recipeId } = req.body;

  if (!recipeId) {
    return res.status(400).json({ message: "ID de recette manquant." });
  }

  const query = `
    DELETE FROM liked_recipe
    WHERE code_user = ? AND code_recipe = ?
  `;

  db.query(query, [userId, recipeId], (err, result) => {
    if (err) {
      console.error("❌ Erreur suppression like :", err);
      return res.status(500).json({ message: "Erreur serveur." });
    }

    res.json({ message: "💔 Recette retirée des favoris." });
  });
});

module.exports = router;
