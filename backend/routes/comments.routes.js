const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

/* =====================================================
   💬 COMMENTAIRES PUBLICS D’UNE RECETTE
===================================================== */
router.get("/recipe/:id", (req, res) => {
  const recipeId = req.params.id;

  const sql = `
    SELECT
      c.code_comment,
      c.description,
      c.created_at,
      u.pseudo
    FROM comment c
    JOIN site_user u ON u.code_user = c.code_user
    WHERE c.code_recipe = ?
      AND c.is_approved = 1
    ORDER BY c.created_at DESC
  `;

  db.query(sql, [recipeId], (err, results) => {
    if (err) {
      console.error("❌ Erreur commentaires recette :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    res.json(results);
  });
});

/* =====================================================
   ✍️ AJOUTER UN COMMENTAIRE (UTILISATEUR)
===================================================== */
router.post("/recipe/:id", authMiddleware, (req, res) => {
  const recipeId = req.params.id;
  const userId = req.user.code_user;
  const { description } = req.body;

  if (!description || description.trim().length < 2) {
    return res.status(400).json({ error: "Commentaire trop court" });
  }

  db.query(
    `
    INSERT INTO comment (description, code_user, code_recipe, is_approved)
    VALUES (?, ?, ?, 0)
    `,
    [description.trim(), userId, recipeId],
    (err) => {
      if (err) {
        console.error("❌ Erreur ajout commentaire :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }

      res.status(201).json({
        message: "Commentaire envoyé (en attente de validation)",
      });
    }
  );
});

/* =====================================================
   👤 COMMENTAIRES DE L’UTILISATEUR (PROFIL)
===================================================== */
router.get("/user", authMiddleware, (req, res) => {
  const userId = req.user.code_user;

  db.query(
    `
    SELECT
      c.code_comment,
      c.description,
      c.code_recipe,
      c.created_at,
      r.name AS recipe_name
    FROM comment c
    JOIN recipe r ON r.code_recipe = c.code_recipe
    WHERE c.code_user = ?
    ORDER BY c.created_at DESC
    `,
    [userId],
    (err, results) => {
      if (err) {
        console.error("❌ Erreur commentaires utilisateur :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }
      res.json(results);
    }
  );
});

/* =====================================================
   👑 ADMIN — TOUS LES COMMENTAIRES
===================================================== */
router.get("/admin", authMiddleware, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Accès interdit" });
  }

  const sql = `
    SELECT
      c.code_comment,
      c.description,
      c.created_at,
      c.is_approved,
      u.pseudo,
      r.name AS recipe_name
    FROM comment c
    JOIN site_user u ON u.code_user = c.code_user
    JOIN recipe r ON r.code_recipe = c.code_recipe
    ORDER BY c.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Erreur commentaires admin :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    res.json(results);
  });
});

/* =====================================================
   ✅ ADMIN — APPROUVER
===================================================== */
router.put("/admin/:id/approve", authMiddleware, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Accès interdit" });
  }

  db.query(
    "UPDATE comment SET is_approved = 1 WHERE code_comment = ?",
    [req.params.id],
    (err) => {
      if (err) {
        console.error("❌ Erreur approbation :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }
      res.json({ message: "Commentaire approuvé" });
    }
  );
});

/* =====================================================
   🗑 ADMIN — SUPPRIMER
===================================================== */
router.delete("/admin/:id", authMiddleware, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Accès interdit" });
  }

  db.query(
    "DELETE FROM comment WHERE code_comment = ?",
    [req.params.id],
    (err) => {
      if (err) {
        console.error("❌ Erreur suppression :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }
      res.json({ message: "Commentaire supprimé" });
    }
  );
});

module.exports = router;
