const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authenticateUser = require("../middleware/auth");
const authorizeAdmin = require("../middleware/admin");

// ✅ Récupération de tous les commentaires
router.get("/all", authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT
        c.code_comment,
        c.description,
        c.created_at,
        c.is_approved,
        u.pseudo,
        r.name AS recipe_name
      FROM comment c
      JOIN site_user u ON c.code_user = u.code_user
      JOIN recipe r ON c.code_recipe = r.code_recipe
      ORDER BY c.created_at DESC
    `);
    res.json(results);
  } catch (err) {
    console.error("❌ Erreur récupération des commentaires :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Approuver un commentaire
router.put(
  "/:id/approve",
  authenticateUser,
  authorizeAdmin,
  async (req, res) => {
    const commentId = req.params.id;
    try {
      const [result] = await db.query(
        "UPDATE comment SET is_approved = 1 WHERE code_comment = ?",
        [commentId]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Commentaire non trouvé" });
      }
      res.json({ message: "✅ Commentaire approuvé" });
    } catch (err) {
      console.error("❌ Erreur approbation commentaire :", err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }
);

// ✅ Supprimer un commentaire
router.delete("/:id", authenticateUser, authorizeAdmin, async (req, res) => {
  const commentId = req.params.id;
  try {
    const [result] = await db.query(
      "DELETE FROM comment WHERE code_comment = ?",
      [commentId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Commentaire non trouvé" });
    }
    res.json({ message: "🗑️ Commentaire supprimé" });
  } catch (err) {
    console.error("❌ Erreur suppression commentaire :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
