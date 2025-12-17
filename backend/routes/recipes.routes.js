const express = require("express");
const db = require("../config/db");

const router = express.Router();

/* =====================================================
   🔍 RECHERCHE DE RECETTES (nom / description / ingrédient)
   URL : /recipes/search?q=tomate
   ⚠️ DOIT ÊTRE AVANT /:id
===================================================== */
router.get("/search", (req, res) => {
  const search = req.query.q;

  if (!search) {
    return res.json([]);
  }

  const keyword = `%${search}%`;

  const sql = `
    SELECT DISTINCT
      r.code_recipe,
      r.name,
      r.picture,
      r.description,
      r.author,
      r.code_category,
      c.name AS category
    FROM recipe r
    LEFT JOIN category c ON c.code_category = r.code_category
    LEFT JOIN contains ct ON ct.code_recipe = r.code_recipe
    LEFT JOIN ingredient i ON i.code_ingredient = ct.code_ingredient
    WHERE
      r.name LIKE ?
      OR r.description LIKE ?
      OR i.name LIKE ?
    ORDER BY r.name
  `;

  db.query(sql, [keyword, keyword, keyword], (err, results) => {
    if (err) {
      console.error("❌ Erreur recherche recettes :", err);
      return res.sendStatus(500);
    }
    res.json(results);
  });
});

/* =====================================================
   📋 LISTE DES RECETTES
   URL : /recipes
===================================================== */
router.get("/", (req, res) => {
  const sql = `
    SELECT
      r.code_recipe,
      r.name,
      r.picture,
      r.description,
      r.author,
      r.code_category,
      c.name AS category
    FROM recipe r
    LEFT JOIN category c ON c.code_category = r.code_category
    ORDER BY r.code_recipe DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Erreur récupération recettes :", err);
      return res.sendStatus(500);
    }
    res.json(results);
  });
});

/* =====================================================
   📖 DÉTAIL D’UNE RECETTE
   URL : /recipes/:id
===================================================== */
router.get("/:id", (req, res) => {
  const recipeId = req.params.id;

  const recipeSql = `
    SELECT
      r.code_recipe,
      r.name,
      r.picture,
      r.description,
      r.instruction,
      r.author,
      r.code_category,
      c.name AS category
    FROM recipe r
    LEFT JOIN category c ON c.code_category = r.code_category
    WHERE r.code_recipe = ?
  `;

  const ingredientsSql = `
    SELECT
      i.name,
      ct.quantity
    FROM contains ct
    JOIN ingredient i ON i.code_ingredient = ct.code_ingredient
    WHERE ct.code_recipe = ?
  `;

  db.query(recipeSql, [recipeId], (err, recipeResult) => {
    if (err) {
      console.error("❌ Erreur recette :", err);
      return res.sendStatus(500);
    }

    if (recipeResult.length === 0) {
      return res.status(404).json({ error: "Recette introuvable" });
    }

    db.query(ingredientsSql, [recipeId], (err, ingredientsResult) => {
      if (err) {
        console.error("❌ Erreur ingrédients :", err);
        return res.sendStatus(500);
      }

      const recipe = recipeResult[0];
      recipe.ingredients = ingredientsResult;

      res.json(recipe);
    });
  });
});

module.exports = router;
