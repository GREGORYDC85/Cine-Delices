const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ✅ Route publique pour récupérer toutes les recettes
router.get("/recipes", async (req, res) => {
  try {
    // Ajout de la pagination pour améliorer les performances
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    const [results] = await db.query(
      `
      SELECT
        r.*,
        c.name AS category_name,
        COUNT(l.code_user) AS like_count,
        (SELECT COUNT(*) FROM comment WHERE code_recipe = r.code_recipe AND is_approved = 1) AS comment_count
      FROM recipe r
      LEFT JOIN recipe_category rc ON r.code_recipe = rc.code_recipe
      LEFT JOIN category c ON rc.code_category = c.code_category
      LEFT JOIN liked_recipe l ON r.code_recipe = l.code_recipe
      GROUP BY r.code_recipe
      ORDER BY r.code_recipe DESC
      LIMIT ? OFFSET ?
    `,
      [limit, offset]
    );

    // Compter le total de recettes pour la pagination
    const [countResult] = await db.query(
      "SELECT COUNT(*) AS total FROM recipe"
    );
    const total = countResult[0].total;

    res.json({
      data: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("❌ Erreur récupération recettes :", err);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la récupération des recettes." });
  }
});

// 🔍 Route de recherche par mot-clé (titre, description ou catégorie)
router.get("/recipes/search", async (req, res) => {
  try {
    const searchTerm = req.query.q?.trim().toLowerCase() || "";

    if (searchTerm.length < 2) {
      return res.status(400).json({
        error: "Le terme de recherche doit contenir au moins 2 caractères.",
      });
    }

    // Ajout de la pagination pour la recherche aussi
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    const likeQuery = `%${searchTerm}%`;

    const [results] = await db.query(
      `
      SELECT
        r.*,
        c.name AS category_name,
        COUNT(l.code_user) AS like_count,
        (SELECT COUNT(*) FROM comment WHERE code_recipe = r.code_recipe AND is_approved = 1) AS comment_count
      FROM recipe r
      LEFT JOIN recipe_category rc ON r.code_recipe = rc.code_recipe
      LEFT JOIN category c ON rc.code_category = c.code_category
      LEFT JOIN liked_recipe l ON r.code_recipe = l.code_recipe
      WHERE LOWER(r.name) LIKE ?
        OR LOWER(r.description) LIKE ?
        OR LOWER(c.name) LIKE ?
      GROUP BY r.code_recipe
      ORDER BY
        CASE
          WHEN LOWER(r.name) LIKE ? THEN 1
          WHEN LOWER(r.name) LIKE ? THEN 2
          WHEN LOWER(c.name) LIKE ? THEN 3
          ELSE 4
        END,
        r.code_recipe DESC
      LIMIT ? OFFSET ?
    `,
      [
        likeQuery,
        likeQuery,
        likeQuery,
        `${searchTerm}%`,
        `%${searchTerm}%`,
        likeQuery,
        limit,
        offset,
      ]
    );

    // Compter le total de résultats pour la pagination
    const [countResult] = await db.query(
      `
      SELECT COUNT(DISTINCT r.code_recipe) AS total
      FROM recipe r
      LEFT JOIN recipe_category rc ON r.code_recipe = rc.code_recipe
      LEFT JOIN category c ON rc.code_category = c.code_category
      WHERE LOWER(r.name) LIKE ?
        OR LOWER(r.description) LIKE ?
        OR LOWER(c.name) LIKE ?
    `,
      [likeQuery, likeQuery, likeQuery]
    );

    const total = countResult[0].total;

    res.json({
      data: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("❌ Erreur lors de la recherche :", err);
    res.status(500).json({ error: "Erreur serveur lors de la recherche." });
  }
});

// ✅ Route pour récupérer une recette spécifique avec ses détails
router.get("/recipes/:id", async (req, res) => {
  try {
    const recipeId = req.params.id;

    const [recipeResults] = await db.query(
      `
      SELECT
        r.*,
        c.name AS category_name,
        COUNT(l.code_user) AS like_count,
        (SELECT COUNT(*) FROM comment WHERE code_recipe = r.code_recipe AND is_approved = 1) AS comment_count
      FROM recipe r
      LEFT JOIN recipe_category rc ON r.code_recipe = rc.code_recipe
      LEFT JOIN category c ON rc.code_category = c.code_category
      LEFT JOIN liked_recipe l ON r.code_recipe = l.code_recipe
      WHERE r.code_recipe = ?
      GROUP BY r.code_recipe
    `,
      [recipeId]
    );

    if (recipeResults.length === 0) {
      return res.status(404).json({ error: "Recette non trouvée." });
    }

    const recipe = recipeResults[0];

    // Récupérer les ingrédients
    const [ingredients] = await db.query(
      `
      SELECT i.name, c.quantity
      FROM contains c
      JOIN ingredient i ON c.code_ingredient = i.code_ingredient
      WHERE c.code_recipe = ?
      ORDER BY i.name
    `,
      [recipeId]
    );

    // Récupérer les œuvres associées
    const [works] = await db.query(
      `
      SELECT w.code_work, w.title
      FROM recipe_work rw
      JOIN work w ON rw.code_work = w.code_work
      WHERE rw.code_recipe = ?
    `,
      [recipeId]
    );

    res.json({
      ...recipe,
      ingredients,
      works,
    });
  } catch (err) {
    console.error("❌ Erreur récupération recette :", err);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la récupération de la recette." });
  }
});

module.exports = router;
