const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authenticateUser = require("../middleware/auth");

// ✅ Vérifier si l'utilisateur a liké une recette
router.get("/:recipeId", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const recipeId = req.params.recipeId;

  try {
    // Vérifier que la recette existe
    const [recipe] = await db.query(
      "SELECT 1 FROM recipe WHERE code_recipe = ?",
      [recipeId]
    );
    if (recipe.length === 0) {
      return res
        .status(404)
        .json({ error: "Recette non trouvée", liked: false });
    }

    const [result] = await db.query(
      `
      SELECT 1 FROM liked_recipe
      WHERE code_user = ? AND code_recipe = ?
    `,
      [userId, recipeId]
    );

    res.json({ liked: result.length > 0 });
  } catch (err) {
    console.error("❌ Erreur vérification like :", err);
    res.status(500).json({ error: "Erreur serveur", liked: false });
  }
});

// ✅ Ajouter un like
router.post("/", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const { recipeId } = req.body;

  if (!recipeId) {
    return res.status(400).json({ error: "L'ID de la recette est requis." });
  }

  try {
    // Vérifier que la recette existe
    const [recipe] = await db.query(
      "SELECT 1 FROM recipe WHERE code_recipe = ?",
      [recipeId]
    );
    if (recipe.length === 0) {
      return res.status(404).json({ error: "Recette non trouvée" });
    }

    await db.query(
      `
      INSERT IGNORE INTO liked_recipe (code_user, code_recipe)
      VALUES (?, ?)
    `,
      [userId, recipeId]
    );

    res.status(201).json({
      message: "❤️ Recette ajoutée aux favoris",
      liked: true,
    });
  } catch (err) {
    console.error("❌ Erreur ajout like :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Supprimer un like
router.delete("/", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const { recipeId } = req.body;

  if (!recipeId) {
    return res.status(400).json({ error: "L'ID de la recette est requis." });
  }

  try {
    const [result] = await db.query(
      `
      DELETE FROM liked_recipe
      WHERE code_user = ? AND code_recipe = ?
    `,
      [userId, recipeId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Like non trouvé" });
    }

    res.json({
      message: "💔 Recette retirée des favoris",
      liked: false,
    });
  } catch (err) {
    console.error("❌ Erreur suppression like :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Compter les likes d'une recette (route publique)
router.get("/count/:recipeId", async (req, res) => {
  const recipeId = req.params.recipeId;

  try {
    // Vérifier que la recette existe
    const [recipe] = await db.query(
      "SELECT 1 FROM recipe WHERE code_recipe = ?",
      [recipeId]
    );
    if (recipe.length === 0) {
      return res.status(404).json({ error: "Recette non trouvée", count: 0 });
    }

    const [result] = await db.query(
      `
      SELECT COUNT(*) as count FROM liked_recipe
      WHERE code_recipe = ?
    `,
      [recipeId]
    );

    res.json({ count: result[0].count });
  } catch (err) {
    console.error("❌ Erreur comptage likes :", err);
    res.status(500).json({ error: "Erreur serveur", count: 0 });
  }
});

module.exports = router;
