const express = require("express");
const authenticateUser = require("../middleware/auth");
const authorizeAdmin = require("../middleware/admin");
const db = require("../config/db");

const router = express.Router();

// ✅ Dashboard admin
router.get("/dashboard", authenticateUser, authorizeAdmin, (req, res) => {
  res.json({
    message: "Bienvenue sur le dashboard admin",
    admin: req.user,
  });
});

// ✅ Liste des recettes pour le panneau admin
router.get("/recettes", authenticateUser, authorizeAdmin, (req, res) => {
  const query = "SELECT * FROM recipes ORDER BY code_recipe DESC";

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Erreur récupération recettes :", err);
      return res.status(500).json({
        message: "Erreur serveur lors de la récupération des recettes.",
      });
    }
    res.json(results);
  });
});

// ✅ Supprimer une recette (admin uniquement)
router.delete("/recettes/:id", authenticateUser, authorizeAdmin, (req, res) => {
  const recipeId = req.params.id;

  const query = "DELETE FROM recipes WHERE code_recipe = ?";

  db.query(query, [recipeId], (err, result) => {
    if (err) {
      console.error("❌ Erreur suppression recette :", err);
      return res
        .status(500)
        .json({ message: "Erreur serveur lors de la suppression." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Recette introuvable." });
    }

    res.json({ message: "✅ Recette supprimée avec succès." });
  });
});

module.exports = router;
