const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

/* =====================================================
   🔍 CHECK — est-ce que la recette est likée ?
   GET /api/likes/:recipeId
===================================================== */
router.get("/:recipeId", authMiddleware, (req, res) => {
  const userId = req.user.code_user;
  const recipeId = Number(req.params.recipeId);

  if (!recipeId) {
    return res.status(400).json({ error: "recipeId invalide" });
  }

  db.query(
    `
    SELECT 1
    FROM liked_recipe
    WHERE code_user = ? AND code_recipe = ?
    LIMIT 1
    `,
    [userId, recipeId],
    (err, rows) => {
      if (err) {
        console.error("❌ Erreur check like :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }

      res.json({ liked: rows.length > 0 });
    }
  );
});

/* =====================================================
   ❤️ AJOUTER UN LIKE
   POST /api/likes/:recipeId
===================================================== */
router.post("/:recipeId", authMiddleware, (req, res) => {
  const userId = req.user.code_user;
  const recipeId = Number(req.params.recipeId);

  if (!recipeId) {
    return res.status(400).json({ error: "recipeId invalide" });
  }

  db.query(
    `
    INSERT INTO liked_recipe (code_user, code_recipe)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE date_like = CURDATE()
    `,
    [userId, recipeId],
    (err) => {
      if (err) {
        console.error("❌ Erreur ajout like :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }

      res.json({ liked: true });
    }
  );
});

/* =====================================================
   💔 RETIRER UN LIKE
   DELETE /api/likes/:recipeId
===================================================== */
router.delete("/:recipeId", authMiddleware, (req, res) => {
  const userId = req.user.code_user;
  const recipeId = Number(req.params.recipeId);

  if (!recipeId) {
    return res.status(400).json({ error: "recipeId invalide" });
  }

  db.query(
    `
    DELETE FROM liked_recipe
    WHERE code_user = ? AND code_recipe = ?
    `,
    [userId, recipeId],
    (err) => {
      if (err) {
        console.error("❌ Erreur suppression like :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }

      res.json({ liked: false });
    }
  );
});

/* =====================================================
   ⭐ FAVORIS DE L'UTILISATEUR (PROFIL)
   GET /api/likes/user/favorites
===================================================== */
router.get("/user/favorites", authMiddleware, (req, res) => {
  const userId = req.user.code_user;

  db.query(
    `
    SELECT
      r.code_recipe,
      r.name,
      r.picture,
      r.description,
      c.name AS category
    FROM liked_recipe lr
    JOIN recipe r ON r.code_recipe = lr.code_recipe
    LEFT JOIN category c ON c.code_category = r.code_category
    WHERE lr.code_user = ?
    ORDER BY lr.date_like DESC
    `,
    [userId],
    (err, results) => {
      if (err) {
        console.error("❌ Erreur favoris :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }

      res.json(results);
    }
  );
});

module.exports = router;
