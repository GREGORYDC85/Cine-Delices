const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authenticateUser = require("../middleware/auth");
const authorizeAdmin = require("../middleware/admin");

// 🔐 Middleware global pour sécuriser toutes les routes ci-dessous
router.use(authenticateUser, authorizeAdmin);

/* ============================================
 ✅ Route publique pour breadcrumb (pas besoin d'auth)
============================================ */
router.get("/public/:id", async (req, res) => {
  try {
    const [results] = await db.query(
      `
      SELECT
        r.code_recipe,
        r.name
      FROM recipe r
      WHERE r.code_recipe = ?
    `,
      [req.params.id]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: "Recette non trouvée" });
    }
    res.json(results[0]);
  } catch (err) {
    console.error("❌ Erreur publique récupération recette :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ============================================
 ✅ Toutes les recettes
============================================ */
router.get("/", async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT
        r.code_recipe,
        r.name,
        r.author,
        rc.code_category,
        COALESCE(c.name, 'Non classée') AS category
      FROM recipe r
      LEFT JOIN recipe_category rc ON r.code_recipe = rc.code_recipe
      LEFT JOIN category c ON rc.code_category = c.code_category
      ORDER BY r.code_recipe DESC
    `);
    res.json(results);
  } catch (err) {
    console.error("❌ Erreur récupération des recettes :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ============================================
 ✅ Détail d'une recette
============================================ */
router.get("/:id", async (req, res) => {
  try {
    const [results] = await db.query(
      `
      SELECT
        r.code_recipe,
        r.name,
        r.author,
        rc.code_category,
        COALESCE(c.name, 'Non classée') AS category
      FROM recipe r
      LEFT JOIN recipe_category rc ON r.code_recipe = rc.code_recipe
      LEFT JOIN category c ON rc.code_category = c.code_category
      WHERE r.code_recipe = ?
    `,
      [req.params.id]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: "Recette non trouvée" });
    }
    res.json(results[0]);
  } catch (err) {
    console.error("❌ Erreur récupération de la recette :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ============================================
 ✅ Ajouter une recette
============================================ */
router.post("/", async (req, res) => {
  const {
    name,
    picture,
    total_time,
    servings,
    author,
    description,
    instruction,
    code_category,
    code_work,
    new_work_title,
    ingredients = [],
  } = req.body;

  try {
    // Gestion de l'œuvre
    let finalWorkId = code_work;
    if (!finalWorkId && new_work_title?.trim()) {
      const [result] = await db.query("INSERT INTO work (title) VALUES (?)", [
        new_work_title.trim(),
      ]);
      finalWorkId = result.insertId;
    }

    // Ajout de la recette
    const [recipeResult] = await db.query(
      `
      INSERT INTO recipe (name, picture, total_time, servings, author, description, instruction)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [name, picture, total_time, servings, author, description, instruction]
    );

    const recipeId = recipeResult.insertId;

    // Lien avec la catégorie
    await db.query(
      "INSERT INTO recipe_category (code_recipe, code_category) VALUES (?, ?)",
      [recipeId, code_category]
    );

    // Lien avec l'œuvre si nécessaire
    if (finalWorkId) {
      await db.query(
        "INSERT INTO recipe_work (code_recipe, code_work) VALUES (?, ?)",
        [recipeId, finalWorkId]
      );
    }

    // Gestion des ingrédients
    for (const { name: ingredientName, quantity } of ingredients) {
      if (!ingredientName?.trim()) continue;

      // Vérification si l'ingrédient existe
      const [existing] = await db.query(
        "SELECT code_ingredient FROM ingredient WHERE name = ?",
        [ingredientName.trim()]
      );

      // Récupération ou création de l'ingrédient
      const ingredientId = existing.length
        ? existing[0].code_ingredient
        : (
            await db.query("INSERT INTO ingredient (name) VALUES (?)", [
              ingredientName.trim(),
            ])
          )[0].insertId;

      // Lien avec la recette
      await db.query(
        "INSERT INTO contains (code_recipe, code_ingredient, quantity) VALUES (?, ?, ?)",
        [recipeId, ingredientId, quantity]
      );
    }

    res.status(201).json({ message: "✅ Recette ajoutée avec succès !" });
  } catch (err) {
    console.error("❌ Erreur ajout recette :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ============================================
 ✅ Modifier une recette
============================================ */
router.put("/:id", async (req, res) => {
  const recipeId = req.params.id;
  const {
    name,
    picture,
    total_time,
    servings,
    author,
    description,
    instruction,
    code_category,
    code_work,
    new_work_title,
    ingredients = [],
  } = req.body;

  try {
    // Mise à jour de la recette
    await db.query(
      `
      UPDATE recipe SET
        name = ?,
        picture = ?,
        total_time = ?,
        servings = ?,
        author = ?,
        description = ?,
        instruction = ?
      WHERE code_recipe = ?
    `,
      [
        name,
        picture,
        total_time,
        servings,
        author,
        description,
        instruction,
        recipeId,
      ]
    );

    // Mise à jour de la catégorie
    await db.query(
      "REPLACE INTO recipe_category (code_recipe, code_category) VALUES (?, ?)",
      [recipeId, code_category]
    );

    // Gestion de l'œuvre
    let finalWorkId = code_work;
    if (!finalWorkId && new_work_title?.trim()) {
      const [result] = await db.query("INSERT INTO work (title) VALUES (?)", [
        new_work_title.trim(),
      ]);
      finalWorkId = result.insertId;
    }

    // Mise à jour de l'œuvre si nécessaire
    if (finalWorkId) {
      await db.query(
        "REPLACE INTO recipe_work (code_recipe, code_work) VALUES (?, ?)",
        [recipeId, finalWorkId]
      );
    }

    // Suppression des anciens ingrédients
    await db.query("DELETE FROM contains WHERE code_recipe = ?", [recipeId]);

    // Ajout des nouveaux ingrédients
    for (const { name: ingredientName, quantity } of ingredients) {
      if (!ingredientName?.trim()) continue;

      const [existing] = await db.query(
        "SELECT code_ingredient FROM ingredient WHERE name = ?",
        [ingredientName.trim()]
      );

      const ingredientId = existing.length
        ? existing[0].code_ingredient
        : (
            await db.query("INSERT INTO ingredient (name) VALUES (?)", [
              ingredientName.trim(),
            ])
          )[0].insertId;

      await db.query(
        "INSERT INTO contains (code_recipe, code_ingredient, quantity) VALUES (?, ?, ?)",
        [recipeId, ingredientId, quantity]
      );
    }

    res.json({ message: "✅ Recette mise à jour avec succès." });
  } catch (err) {
    console.error("❌ Erreur modification recette :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ============================================
 ✅ Supprimer une recette
============================================ */
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM recipe WHERE code_recipe = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Recette introuvable." });
    }
    res.json({ message: "🗑️ Recette supprimée avec succès." });
  } catch (err) {
    console.error("❌ Erreur suppression recette :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
