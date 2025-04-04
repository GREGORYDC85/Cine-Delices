const express = require("express");
const db = require("../config/db");
const authenticateUser = require("../middleware/auth");
const authorizeAdmin = require("../middleware/admin");

const router = express.Router();

///////////////////////////////
// ✅ DASHBOARD ADMIN
///////////////////////////////
router.get("/dashboard", authenticateUser, authorizeAdmin, (req, res) => {
  res.json({ message: "Bienvenue sur le dashboard admin", admin: req.user });
});

///////////////////////////////
// ✅ GESTION DES ŒUVRES
///////////////////////////////

// 🔍 Liste des œuvres
router.get("/works", authenticateUser, authorizeAdmin, (req, res) => {
  db.query(
    "SELECT code_work, title FROM work ORDER BY title",
    (err, results) => {
      if (err) {
        console.error("❌ Erreur récupération œuvres :", err);
        return res.status(500).json({ message: "Erreur serveur." });
      }
      res.json(results);
    }
  );
});

// ➕ Ajouter une œuvre
router.post("/works", authenticateUser, authorizeAdmin, (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === "") {
    return res.status(400).json({ message: "Le titre est requis." });
  }

  const sql = "INSERT INTO work (title) VALUES (?)";
  db.query(sql, [title.trim()], (err) => {
    if (err) {
      console.error("❌ Erreur ajout œuvre :", err);
      return res.status(500).json({ message: "Erreur serveur." });
    }
    res.status(201).json({ message: "✅ Œuvre ajoutée avec succès !" });
  });
});

// ✏️ Modifier une œuvre
router.put("/works/:id", authenticateUser, authorizeAdmin, (req, res) => {
  const workId = req.params.id;
  const { title } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({ message: "Titre requis." });
  }

  const sql = "UPDATE work SET title = ? WHERE code_work = ?";
  db.query(sql, [title.trim(), workId], (err) => {
    if (err) {
      console.error("❌ Erreur modification œuvre :", err);
      return res.status(500).json({ message: "Erreur serveur." });
    }
    res.json({ message: "✅ Œuvre mise à jour." });
  });
});

// 🗑️ Supprimer une œuvre
router.delete("/works/:id", authenticateUser, authorizeAdmin, (req, res) => {
  const workId = req.params.id;

  db.query("DELETE FROM work WHERE code_work = ?", [workId], (err, result) => {
    if (err) {
      console.error("❌ Erreur suppression œuvre :", err);
      return res.status(500).json({ message: "Erreur serveur." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Œuvre introuvable." });
    }

    res.json({ message: "🗑️ Œuvre supprimée avec succès." });
  });
});

///////////////////////////////
// ✅ GESTION DES RECETTES (ADMIN)
///////////////////////////////

// 🔍 Récupérer toutes les recettes (correction : JOIN avec category et work)
router.get("/recettes", authenticateUser, authorizeAdmin, (req, res) => {
  const sql = `
    SELECT 
      r.code_recipe,
      r.name,
      r.author,
      r.total_time,
      r.servings,
      r.picture,
      r.description,
      r.instruction,
      rc.code_category,
      rw.code_work
    FROM recipe r
    LEFT JOIN recipe_category rc ON r.code_recipe = rc.code_recipe
    LEFT JOIN recipe_work rw ON r.code_recipe = rw.code_recipe
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Erreur récupération recettes :", err);
      return res
        .status(500)
        .json({
          error: "Erreur serveur lors de la récupération des recettes.",
        });
    }
    res.json(results);
  });
});

// ➕ Ajouter une recette (avec ingrédients)
router.post("/recettes", authenticateUser, authorizeAdmin, (req, res) => {
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
    ingredients = [],
  } = req.body;

  const sql = `
    INSERT INTO recipe (name, picture, total_time, servings, author, description, instruction)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(
    sql,
    [name, picture, total_time, servings, author, description, instruction],
    (err, result) => {
      if (err) {
        console.error("❌ Erreur ajout recette :", err);
        return res.status(500).json({ error: "Erreur ajout recette." });
      }

      const recipeId = result.insertId;

      // Lier à la catégorie
      db.query(
        `INSERT INTO recipe_category (code_recipe, code_category) VALUES (?, ?)`,
        [recipeId, code_category]
      );

      // Lier à l’œuvre
      if (code_work) {
        db.query(
          `INSERT INTO recipe_work (code_recipe, code_work) VALUES (?, ?)`,
          [recipeId, code_work]
        );
      }

      // Lier les ingrédients
      ingredients.forEach(({ name, quantity }) => {
        if (!name.trim()) return;

        db.query(
          "SELECT code_ingredient FROM ingredient WHERE name = ?",
          [name.trim()],
          (err, result) => {
            if (err) return;

            const insertContains = (ingredientId) => {
              db.query(
                `INSERT INTO contains (code_recipe, code_ingredient, quantity) VALUES (?, ?, ?)`,
                [recipeId, ingredientId, quantity]
              );
            };

            if (result.length > 0) {
              insertContains(result[0].code_ingredient);
            } else {
              db.query(
                "INSERT INTO ingredient (name) VALUES (?)",
                [name.trim()],
                (err, result) => {
                  if (err) return;
                  insertContains(result.insertId);
                }
              );
            }
          }
        );
      });

      res
        .status(201)
        .json({ message: "✅ Recette + ingrédients ajoutés avec succès !" });
    }
  );
});

// ✏️ Modifier une recette (avec ingrédients)
router.put("/recettes/:id", authenticateUser, authorizeAdmin, (req, res) => {
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
    ingredients = [],
  } = req.body;

  const sql = `
    UPDATE recipe
    SET name = ?, picture = ?, total_time = ?, servings = ?, author = ?, description = ?, instruction = ?
    WHERE code_recipe = ?
  `;
  db.query(
    sql,
    [
      name,
      picture,
      total_time,
      servings,
      author,
      description,
      instruction,
      recipeId,
    ],
    (err) => {
      if (err) {
        console.error("❌ Erreur modification recette :", err);
        return res.status(500).json({ error: "Erreur serveur." });
      }

      db.query(
        `REPLACE INTO recipe_category (code_recipe, code_category) VALUES (?, ?)`,
        [recipeId, code_category]
      );
      db.query(
        `REPLACE INTO recipe_work (code_recipe, code_work) VALUES (?, ?)`,
        [recipeId, code_work]
      );

      // Supprimer les anciens ingrédients
      db.query(
        "DELETE FROM contains WHERE code_recipe = ?",
        [recipeId],
        (err) => {
          if (err) return;

          // Réinsertion des nouveaux
          ingredients.forEach(({ name, quantity }) => {
            if (!name.trim()) return;

            db.query(
              "SELECT code_ingredient FROM ingredient WHERE name = ?",
              [name.trim()],
              (err, result) => {
                if (err) return;

                const insertContains = (ingredientId) => {
                  db.query(
                    `INSERT INTO contains (code_recipe, code_ingredient, quantity) VALUES (?, ?, ?)`,
                    [recipeId, ingredientId, quantity]
                  );
                };

                if (result.length > 0) {
                  insertContains(result[0].code_ingredient);
                } else {
                  db.query(
                    "INSERT INTO ingredient (name) VALUES (?)",
                    [name.trim()],
                    (err, result) => {
                      if (err) return;
                      insertContains(result.insertId);
                    }
                  );
                }
              }
            );
          });
        }
      );

      res.json({ message: "✅ Recette mise à jour avec ingrédients." });
    }
  );
});

// 🗑️ Supprimer une recette
router.delete("/recettes/:id", authenticateUser, authorizeAdmin, (req, res) => {
  const recipeId = req.params.id;

  db.query(
    "DELETE FROM recipe WHERE code_recipe = ?",
    [recipeId],
    (err, result) => {
      if (err) {
        console.error("❌ Erreur suppression recette :", err);
        return res.status(500).json({ error: "Erreur serveur." });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Recette introuvable." });
      }

      res.json({ message: "🗑️ Recette supprimée avec succès." });
    }
  );
});

module.exports = router;
