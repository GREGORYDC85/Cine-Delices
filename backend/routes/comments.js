const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authenticateUser = require("../middleware/auth");

// 📥 Ajouter un commentaire
router.post("/", authenticateUser, (req, res) => {
  const userId = req.user.id; // ✅ Utiliser "id" issu du token
  const { recipeId, description } = req.body;

  if (!description || !recipeId) {
    return res.status(400).json({ error: "Champs requis manquants." });
  }

  const sql = `
    INSERT INTO comment (code_user, code_recipe, description, created_at)
    VALUES (?, ?, ?, NOW())
  `;

  db.query(sql, [userId, recipeId, description], (err, result) => {
    if (err) {
      console.error("❌ Erreur ajout commentaire :", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    res.status(201).json({ message: "💬 Commentaire ajouté." });
  });
});

// 📤 Obtenir les commentaires d'une recette
router.get("/:recipeId", (req, res) => {
  const recipeId = req.params.recipeId;

  const sql = `
    SELECT c.*, u.pseudo
    FROM comment c
    JOIN site_user u ON c.code_user = u.code_user
    WHERE c.code_recipe = ?
    ORDER BY c.created_at ASC
  `;

  db.query(sql, [recipeId], (err, results) => {
    if (err) {
      console.error("❌ Erreur récupération commentaires :", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    res.json(results);
  });
});

// ✏️ Modifier un commentaire
router.put("/:commentId", authenticateUser, (req, res) => {
  const userId = req.user.id;
  const { commentId } = req.params;
  const { description } = req.body;

  const sql = `
    UPDATE comment
    SET description = ?
    WHERE code_comment = ? AND code_user = ?
  `;

  db.query(sql, [description, commentId, userId], (err) => {
    if (err) {
      console.error("❌ Erreur modification commentaire :", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    res.json({ message: "✏️ Commentaire mis à jour." });
  });
});

// 🗑️ Supprimer un commentaire
router.delete("/:commentId", authenticateUser, (req, res) => {
  const userId = req.user.id;
  const { commentId } = req.params;

  const sql = `
    DELETE FROM comment
    WHERE code_comment = ? AND code_user = ?
  `;

  db.query(sql, [commentId, userId], (err) => {
    if (err) {
      console.error("❌ Erreur suppression commentaire :", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
    res.json({ message: "🗑️ Commentaire supprimé." });
  });
});

module.exports = router;
