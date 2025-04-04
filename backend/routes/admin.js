const express = require("express");
const db = require("../config/db"); // Utilise la version avec .promise()
const authenticateUser = require("../middleware/auth");
const authorizeAdmin = require("../middleware/admin");

const router = express.Router();

// 🔐 Middleware pour sécuriser toutes les routes ci-dessous
router.use(authenticateUser, authorizeAdmin);

// 🧪 Dashboard admin
router.get("/dashboard", (req, res) => {
  res.json({ message: "Bienvenue sur le dashboard admin", admin: req.user });
});

// 📚 Liste des œuvres
router.get("/works", async (req, res) => {
  try {
    const connection = await db.promise();
    const [works] = await connection.query(
      "SELECT code_work, title FROM work ORDER BY title"
    );
    res.json(works);
  } catch (err) {
    console.error("❌ Erreur récupération œuvres :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// 🆕 Ajouter une œuvre
router.post("/works", async (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === "") {
    return res.status(400).json({ message: "Le titre est requis." });
  }

  try {
    const connection = await db.promise();
    await connection.query("INSERT INTO work (title) VALUES (?)", [
      title.trim(),
    ]);
    res.status(201).json({ message: "✅ Œuvre ajoutée avec succès !" });
  } catch (err) {
    console.error("❌ Erreur ajout œuvre :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// 🔍 Récupérer toutes les recettes
router.get("/recettes", async (req, res) => {
  try {
    const connection = await db.promise();
    const [recipes] = await connection.query(`
      SELECT 
        r.code_recipe, r.name, r.author, r.code_category, r.total_time, r.servings, 
        r.picture, r.description, r.instruction, rw.code_work
      FROM recipe r
      LEFT JOIN recipe_work rw ON r.code_recipe = rw.code_recipe
    `);
    res.json(recipes);
  } catch (err) {
    console.error("❌ Erreur récupération recettes :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ➕ Ajouter une recette
router.post("/recettes", async (req, res) => {
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

    // 💡 Si un titre d'œuvre est fourni, l'insérer et récupérer son ID
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

    // ➕ Lier à la catégorie
    await connection.query(
      "INSERT INTO recipe_category (code_recipe, code_category) VALUES (?, ?)",
      [recipeId, code_category]
    );

    // ➕ Lier à l'œuvre si présente
    if (finalWorkId) {
      await connection.query(
        "INSERT INTO recipe_work (code_recipe, code_work) VALUES (?, ?)",
        [recipeId, finalWorkId]
      );
    }

    // ➕ Ingrédients
    for (const { name: ingredientName, quantity } of ingredients) {
      if (!ingredientName?.trim()) continue;

      const [existing] = await connection.query(
        "SELECT code_ingredient FROM ingredient WHERE name = ?",
        [ingredientName.trim()]
      );
      let ingredientId;

      if (existing.length > 0) {
        ingredientId = existing[0].code_ingredient;
      } else {
        const [inserted] = await connection.query(
          "INSERT INTO ingredient (name) VALUES (?)",
          [ingredientName.trim()]
        );
        ingredientId = inserted.insertId;
      }

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

// ✏️ Modifier une recette
router.put("/recettes/:id", async (req, res) => {
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

    // 🔄 Mise à jour recette
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

    // 🔄 Catégorie
    await connection.query(
      "REPLACE INTO recipe_category (code_recipe, code_category) VALUES (?, ?)",
      [recipeId, code_category]
    );

    // 🔄 Œuvre
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

    // 🔄 Ingrédients
    await connection.query("DELETE FROM contains WHERE code_recipe = ?", [
      recipeId,
    ]);

    for (const { name: ingredientName, quantity } of ingredients) {
      if (!ingredientName?.trim()) continue;

      const [existing] = await connection.query(
        "SELECT code_ingredient FROM ingredient WHERE name = ?",
        [ingredientName.trim()]
      );
      let ingredientId;

      if (existing.length > 0) {
        ingredientId = existing[0].code_ingredient;
      } else {
        const [inserted] = await connection.query(
          "INSERT INTO ingredient (name) VALUES (?)",
          [ingredientName.trim()]
        );
        ingredientId = inserted.insertId;
      }

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

// 🗑️ Supprimer une recette
router.delete("/recettes/:id", async (req, res) => {
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
