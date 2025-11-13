const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authenticateUser = require("../middleware/auth");

// 📥 Ajouter un commentaire
router.post("/", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const { recipeId, description } = req.body;

  if (!description || !recipeId) {
    return res
      .status(400)
      .json({ error: "La description et l'ID de recette sont requis." });
  }

  if (description.trim().length === 0) {
    return res
      .status(400)
      .json({ error: "La description ne peut pas être vide." });
  }

  try {
    // Vérifier que la recette existe
    const [recipe] = await db.query(
      "SELECT 1 FROM recipe WHERE code_recipe = ?",
      [recipeId]
    );
    if (recipe.length === 0) {
      return res.status(404).json({ error: "Recette non trouvée." });
    }

    const [result] = await db.query(
      `
      INSERT INTO comment (code_user, code_recipe, description, created_at)
      VALUES (?, ?, ?, NOW())
    `,
      [userId, recipeId, description.trim()]
    );

    res.status(201).json({
      message: "💬 Commentaire ajouté avec succès",
      commentId: result.insertId,
    });
  } catch (err) {
    console.error("❌ Erreur ajout commentaire :", err);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de l'ajout du commentaire." });
  }
});

// 📤 Obtenir les commentaires d'une recette (approuvés uniquement pour les visiteurs)
router.get("/:recipeId", async (req, res) => {
  const recipeId = req.params.recipeId;

  try {
    // Vérifier que la recette existe
    const [recipe] = await db.query(
      "SELECT 1 FROM recipe WHERE code_recipe = ?",
      [recipeId]
    );
    if (recipe.length === 0) {
      return res.status(404).json({ error: "Recette non trouvée." });
    }

    const [results] = await db.query(
      `
      SELECT c.*, u.pseudo
      FROM comment c
      JOIN site_user u ON c.code_user = u.code_user
      WHERE c.code_recipe = ? AND (c.is_approved = 1 OR c.code_user = ?)
      ORDER BY c.created_at ASC
    `,
      [recipeId, req.user?.id || 0]
    ); // ✅ Afficher aussi ses propres commentaires non approuvés

    res.json(results);
  } catch (err) {
    console.error("❌ Erreur récupération commentaires :", err);
    res
      .status(500)
      .json({
        error: "Erreur serveur lors de la récupération des commentaires.",
      });
  }
});

// ✏️ Modifier un commentaire
router.put("/:commentId", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const { commentId } = req.params;
  const { description } = req.body;

  if (!description || description.trim().length === 0) {
    return res
      .status(400)
      .json({ error: "La description est requise et ne peut pas être vide." });
  }

  try {
    const [result] = await db.query(
      `
      UPDATE comment
      SET description = ?
      WHERE code_comment = ? AND code_user = ?
    `,
      [description.trim(), commentId, userId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({
          error:
            "Commentaire non trouvé ou vous n'êtes pas autorisé à le modifier.",
        });
    }

    res.json({ message: "✏️ Commentaire mis à jour avec succès." });
  } catch (err) {
    console.error("❌ Erreur modification commentaire :", err);
    res
      .status(500)
      .json({
        error: "Erreur serveur lors de la modification du commentaire.",
      });
  }
});

// 🗑️ Supprimer un commentaire
router.delete("/:commentId", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const { commentId } = req.params;

  try {
    const [result] = await db.query(
      `
      DELETE FROM comment
      WHERE code_comment = ? AND code_user = ?
    `,
      [commentId, userId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({
          error:
            "Commentaire non trouvé ou vous n'êtes pas autorisé à le supprimer.",
        });
    }

    res.json({ message: "🗑️ Commentaire supprimé avec succès." });
  } catch (err) {
    console.error("❌ Erreur suppression commentaire :", err);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la suppression du commentaire." });
  }
});

module.exports = router;
