const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authenticateUser = require("../middleware/auth");

// ✅ Récupérer le profil (correction des noms de colonnes)
router.get("/profile", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const [results] = await db.query(
      `
      SELECT code_user, pseudo AS username, email, firstname, name, role
      FROM site_user
      WHERE code_user = ?
    `,
      [userId]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    res.json(results[0]);
  } catch (err) {
    console.error("❌ Erreur récupération profil :", err);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la récupération du profil." });
  }
});

// ✅ Modifier le profil (avec validation et correction des noms de colonnes)
router.put("/profile", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const { username, email, firstname, name } = req.body;

  // Validation basique
  if (!email || !username) {
    return res.status(400).json({ error: "L'email et le pseudo sont requis." });
  }

  try {
    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    const [emailCheck] = await db.query(
      "SELECT code_user FROM site_user WHERE email = ? AND code_user != ?",
      [email, userId]
    );

    if (emailCheck.length > 0) {
      return res
        .status(400)
        .json({ error: "Cet email est déjà utilisé par un autre compte." });
    }

    const [result] = await db.query(
      `
      UPDATE site_user
      SET pseudo = ?, email = ?, firstname = ?, name = ?
      WHERE code_user = ?
    `,
      [username, email, firstname || null, name || null, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    res.json({ message: "✅ Profil mis à jour avec succès." });
  } catch (err) {
    console.error("❌ Erreur MAJ profil :", err);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la mise à jour du profil." });
  }
});

// ✅ Récupérer les recettes likées (correction des noms de colonnes)
router.get("/likes", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const [results] = await db.query(
      `
      SELECT
        r.code_recipe,
        r.name AS recipe_name,
        r.picture,
        r.author,
        c.name AS category_name,
        (SELECT COUNT(*) FROM liked_recipe WHERE code_recipe = r.code_recipe) AS like_count
      FROM liked_recipe l
      JOIN recipe r ON l.code_recipe = r.code_recipe
      LEFT JOIN recipe_category rc ON r.code_recipe = rc.code_recipe
      LEFT JOIN category c ON rc.code_category = c.code_category
      WHERE l.code_user = ?
      ORDER BY l.created_at DESC
    `,
      [userId]
    );

    res.json(results);
  } catch (err) {
    console.error("❌ Erreur récupération favoris :", err);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la récupération des favoris." });
  }
});

// ✅ Récupérer les commentaires de l'utilisateur
router.get("/comments", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const [results] = await db.query(
      `
      SELECT
        c.code_comment,
        c.description,
        c.created_at,
        c.is_approved,
        r.code_recipe,
        r.name AS recipe_name
      FROM comment c
      JOIN recipe r ON c.code_recipe = r.code_recipe
      WHERE c.code_user = ?
      ORDER BY c.created_at DESC
    `,
      [userId]
    );

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

// ✅ Récupérer les recettes de l'utilisateur
router.get("/recipes", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const [results] = await db.query(
      `
      SELECT
        r.code_recipe,
        r.name,
        r.picture,
        r.created_at,
        COUNT(l.code_user) AS like_count,
        (SELECT COUNT(*) FROM comment WHERE code_recipe = r.code_recipe) AS comment_count
      FROM recipe r
      LEFT JOIN liked_recipe l ON r.code_recipe = l.code_recipe
      WHERE r.author = ?
      GROUP BY r.code_recipe
      ORDER BY r.created_at DESC
    `,
      [userId]
    );

    res.json(results);
  } catch (err) {
    console.error("❌ Erreur récupération recettes :", err);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la récupération des recettes." });
  }
});

module.exports = router;
