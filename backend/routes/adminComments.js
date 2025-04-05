const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authenticateUser = require("../middleware/auth");
const authorizeAdmin = require("../middleware/admin"); // si tu veux limiter l'accès

// ✅ Liste de tous les commentaires avec infos utilisateur + recette
router.get("/all", authenticateUser, authorizeAdmin, (req, res) => {
  const sql = `
    SELECT 
      c.code_comment,
      c.description,
      c.created_at,
      u.pseudo,
      r.name AS recipe_name
    FROM comment c
    JOIN site_user u ON c.code_user = u.code_user
    JOIN recipe r ON c.code_recipe = r.code_recipe
    ORDER BY c.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Erreur récupération des commentaires :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }

    res.json(results);
  });
});

// ✅ Suppression d’un commentaire
router.delete("/:id", authenticateUser, authorizeAdmin, (req, res) => {
  const commentId = req.params.id;

  db.query("DELETE FROM comment WHERE code_comment = ?", [commentId], (err) => {
    if (err) {
      console.error("❌ Erreur suppression commentaire :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }

    res.json({ message: "🗑️ Commentaire supprimé" });
  });
});

// ✅ Approbation d’un commentaire (à adapter selon ta BDD)
router.put("/:id/approve", authenticateUser, authorizeAdmin, (req, res) => {
  const commentId = req.params.id;

  db.query(
    "UPDATE comment SET is_approved = 1 WHERE code_comment = ?",
    [commentId],
    (err) => {
      if (err) {
        console.error("❌ Erreur approbation commentaire :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }

      res.json({ message: "✅ Commentaire approuvé" });
    }
  );
});

module.exports = router;
