const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authenticateUser = require("../middleware/auth");
const authorizeAdmin = require("../middleware/admin");

// 🔐 Middleware global pour sécuriser toutes les routes ci-dessous
router.use(authenticateUser, authorizeAdmin);

/* ============================================
 ✅ Route publique pour breadcrumb
============================================ */
router.get("/public/:id", (req, res) => {
  const recipeId = req.params.id;

  const sql = `
    SELECT 
      r.code_recipe, 
      r.name
    FROM recipe r
    WHERE r.code_recipe = ?
  `;

  db.query(sql, [recipeId], (err, results) => {
    if (err) {
      console.error("❌ Erreur publique récupération recette :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Recette non trouvée" });
    }
    res.json(results[0]);
  });
});

/* ============================================
 ✅ Toutes les recettes
============================================ */
router.get("/", (req, res) => {
  const sql = `
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
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Erreur récupération des recettes :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }

    console.log("📊 Recettes récupérées côté backend :", results);
    res.json(results);
  });
});

/* ============================================
 ✅ Détail d’une recette
============================================ */
router.get("/:id", (req, res) => {
  const recipeId = req.params.id;

  const sql = `
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
  `;

  db.query(sql, [recipeId], (err, results) => {
    if (err) {
      console.error("❌ Erreur récupération de la recette :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Recette non trouvée" });
    }
    res.json(results[0]);
  });
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
    const connection = await db.promise();

    let finalWorkId = code_work;
    if (!finalWorkId && new_work_title?.trim()) {
      const [result] = await connection.query(
        "INSERT INTO work (title) VALUES (?)",
        [new_work_title.trim()]
      );
      finalWorkId = result.insertId;
    }

    const [recipeResult] = await connection.query(
      `
      INSERT INTO recipe (name, picture, total_time, servings, author, description, instruction)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [name, picture, total_time, servings, author, description, instruction]
    );

    const recipeId = recipeResult.insertId;

    // Lier à la catégorie
    await connection.query(
      "INSERT INTO recipe_category (code_recipe, code_category) VALUES (?, ?)",
      [recipeId, code_category]
    );

    // Lier à l'œuvre si besoin
    if (finalWorkId) {
      await connection.query(
        "INSERT INTO recipe_work (code_recipe, code_work) VALUES (?, ?)",
        [recipeId, finalWorkId]
      );
    }

    // Ingrédients
    for (const { name: ingredientName, quantity } of ingredients) {
      if (!ingredientName?.trim()) continue;

      const [existing] = await connection.query(
        "SELECT code_ingredient FROM ingredient WHERE name = ?",
        [ingredientName.trim()]
      );

      let ingredientId = existing.length
        ? existing[0].code_ingredient
        : (
            await connection.query("INSERT INTO ingredient (name) VALUES (?)", [
              ingredientName.trim(),
            ])
          )[0].insertId;

      await connection.query(
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
    const connection = await db.promise();

    await connection.query(
      `
      UPDATE recipe SET name = ?, picture = ?, total_time = ?, servings = ?, author = ?, 
      description = ?, instruction = ? WHERE code_recipe = ?
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

    await connection.query(
      "REPLACE INTO recipe_category (code_recipe, code_category) VALUES (?, ?)",
      [recipeId, code_category]
    );

    let finalWorkId = code_work;
    if (!finalWorkId && new_work_title?.trim()) {
      const [result] = await connection.query(
        "INSERT INTO work (title) VALUES (?)",
        [new_work_title.trim()]
      );
      finalWorkId = result.insertId;
    }

    if (finalWorkId) {
      await connection.query(
        "REPLACE INTO recipe_work (code_recipe, code_work) VALUES (?, ?)",
        [recipeId, finalWorkId]
      );
    }

    await connection.query("DELETE FROM contains WHERE code_recipe = ?", [
      recipeId,
    ]);

    for (const { name: ingredientName, quantity } of ingredients) {
      if (!ingredientName?.trim()) continue;

      const [existing] = await connection.query(
        "SELECT code_ingredient FROM ingredient WHERE name = ?",
        [ingredientName.trim()]
      );

      let ingredientId = existing.length
        ? existing[0].code_ingredient
        : (
            await connection.query("INSERT INTO ingredient (name) VALUES (?)", [
              ingredientName.trim(),
            ])
          )[0].insertId;

      await connection.query(
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
  const recipeId = req.params.id;

  try {
    const connection = await db.promise();
    const [result] = await connection.query(
      "DELETE FROM recipe WHERE code_recipe = ?",
      [recipeId]
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
