const express = require("express");
const router = express.Router();

// ================================
// 1. Route pour toutes les recettes
// ================================
router.get("/", async (req, res) => {
  try {
    req.logger.info("📝 Tentative de récupération de toutes les recettes");
    const [recipes] = await req.db.query(`
      SELECT
        r.code_recipe,
        r.name AS recipe_name,
        r.picture,
        r.description
      FROM recipe r
      ORDER BY r.code_recipe DESC
    `);
    res.json(recipes);
  } catch (err) {
    req.logger.error(`❌ Erreur SQL (toutes les recettes) : ${err.message}`);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la récupération des recettes." });
  }
});

// ================================
// 2. Route pour une recette spécifique
// ================================
router.get("/:code_recipe", async (req, res) => {
  try {
    const { code_recipe } = req.params;
    const [recipe] = await req.db.query(
      `
      SELECT
        r.code_recipe,
        r.name AS recipe_name,
        r.picture,
        r.description
      FROM recipe r
      WHERE r.code_recipe = ?
    `,
      [code_recipe]
    );

    if (recipe.length === 0) {
      return res.status(404).json({ error: "Recette non trouvée" });
    }

    req.logger.info(`✅ Recette ${code_recipe} récupérée`);
    res.json(recipe[0]);
  } catch (err) {
    req.logger.error(`❌ Erreur SQL (recette ${code_recipe}) : ${err.message}`);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ================================
// 3. Route pour filtrer par catégorie
// ================================
router.get("/category/:category_name", async (req, res) => {
  try {
    const { category_name } = req.params;
    req.logger.info(`📝 Filtre par catégorie : ${category_name}`);

    const [recipes] = await req.db.query(
      `
      SELECT DISTINCT r.code_recipe, r.name AS recipe_name, r.picture, r.description
      FROM recipe r
      JOIN recipe_category rc ON r.code_recipe = rc.code_recipe
      JOIN category c ON rc.code_category = c.code_category
      WHERE c.name = ?
      ORDER BY r.code_recipe DESC
    `,
      [category_name]
    );

    if (recipes.length === 0) {
      return res
        .status(404)
        .json({ error: "Aucune recette trouvée pour cette catégorie" });
    }

    res.json(recipes);
  } catch (err) {
    req.logger.error(`❌ Erreur SQL (filtre catégorie) : ${err.message}`);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ================================
// 4. Route pour filtrer par film/série
// ================================
router.get("/work/:work_title", async (req, res) => {
  try {
    const { work_title } = req.params;
    req.logger.info(`📝 Filtre par film/série : ${work_title}`);

    const [recipes] = await req.db.query(
      `
      SELECT DISTINCT r.code_recipe, r.name AS recipe_name, r.picture, r.description
      FROM recipe r
      JOIN recipe_work rw ON r.code_recipe = rw.code_recipe
      JOIN work w ON rw.code_work = w.code_work
      WHERE w.title = ?
      ORDER BY r.code_recipe DESC
    `,
      [work_title]
    );

    if (recipes.length === 0) {
      return res
        .status(404)
        .json({ error: "Aucune recette trouvée pour ce film/série" });
    }

    res.json(recipes);
  } catch (err) {
    req.logger.error(`❌ Erreur SQL (filtre film/série) : ${err.message}`);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ================================
// 5. Route pour rechercher par ingrédient (simple)
// ================================
router.get("/ingredient/:ingredient_name", async (req, res) => {
  try {
    const { ingredient_name } = req.params;
    req.logger.info(`📝 Recherche par ingrédient : ${ingredient_name}`);

    const [recipes] = await req.db.query(
      `
      SELECT DISTINCT r.code_recipe, r.name AS recipe_name, r.picture, r.description
      FROM recipe r
      JOIN contains c ON r.code_recipe = c.code_recipe
      JOIN ingredient i ON c.code_ingredient = i.code_ingredient
      WHERE i.name LIKE ?
      ORDER BY r.code_recipe DESC
    `,
      [`%${ingredient_name}%`]
    );

    if (recipes.length === 0) {
      return res
        .status(404)
        .json({ error: "Aucune recette trouvée avec cet ingrédient" });
    }

    res.json(recipes);
  } catch (err) {
    req.logger.error(`❌ Erreur SQL (recherche ingrédient) : ${err.message}`);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ================================
// 6. Route pour rechercher par ingrédients multiples
// ================================
router.get("/ingredients/:ingredients", async (req, res) => {
  try {
    const ingredients = req.params.ingredients.split(",");
    req.logger.info(`📝 Recherche par ingrédients : ${ingredients.join(", ")}`);

    const placeholders = ingredients.map(() => "?").join(", ");
    const [recipes] = await req.db.query(
      `
      SELECT DISTINCT r.code_recipe, r.name AS recipe_name, r.picture, r.description
      FROM recipe r
      JOIN contains c ON r.code_recipe = c.code_recipe
      JOIN ingredient i ON c.code_ingredient = i.code_ingredient
      WHERE i.name IN (${placeholders})
      ORDER BY r.code_recipe DESC
    `,
      ingredients
    );

    if (recipes.length === 0) {
      return res
        .status(404)
        .json({ error: "Aucune recette trouvée avec ces ingrédients" });
    }

    res.json(recipes);
  } catch (err) {
    req.logger.error(
      `❌ Erreur SQL (recherche multi-ingrédients) : ${err.message}`
    );
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ================================
// 7. Route pour afficher les ingrédients d'une recette
// ================================
router.get("/:code_recipe/ingredients", async (req, res) => {
  try {
    const { code_recipe } = req.params;
    req.logger.info(
      `📝 Récupération des ingrédients pour la recette ${code_recipe}`
    );

    const [ingredients] = await req.db.query(
      `
      SELECT
        i.code_ingredient,
        i.name AS ingredient_name,
        c.quantity
      FROM contains c
      JOIN ingredient i ON c.code_ingredient = i.code_ingredient
      WHERE c.code_recipe = ?
      ORDER BY i.name
    `,
      [code_recipe]
    );

    if (ingredients.length === 0) {
      return res
        .status(404)
        .json({ error: "Aucun ingrédient trouvé pour cette recette" });
    }

    res.json(ingredients);
  } catch (err) {
    req.logger.error(
      `❌ Erreur SQL (ingrédients de la recette ${code_recipe}) : ${err.message}`
    );
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
