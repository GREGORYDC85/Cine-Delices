const express = require("express");
const db = require("../config/db");
const authenticateUser = require("../middleware/auth");

const router = express.Router();

// ✅ Récupérer le profil
router.get("/profile", authenticateUser, (req, res) => {
  const userId = req.user.id;

  db.query(
    "SELECT username, email FROM site_user WHERE id_user = ?",
    [userId],
    (err, result) => {
      if (err) {
        console.error("❌ Erreur récupération profil :", err);
        return res.status(500).json({ message: "Erreur serveur." });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: "Utilisateur non trouvé." });
      }
      res.json(result[0]);
    }
  );
});

// ✅ Modifier le profil
router.post("/profile/update", authenticateUser, (req, res) => {
  const userId = req.user.id;
  const { username, email } = req.body;

  db.query(
    "UPDATE site_user SET username = ?, email = ? WHERE id_user = ?",
    [username, email, userId],
    (err, result) => {
      if (err) {
        console.error("❌ Erreur MAJ profil :", err);
        return res.status(500).json({ message: "Erreur serveur." });
      }
      res.json({ message: "✅ Profil mis à jour." });
    }
  );
});

// ✅ Récupérer les recettes likées
router.get("/likes", authenticateUser, (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT r.code_recipe, r.name AS recipe_name, r.picture
    FROM liked_recipe l
    JOIN recipe r ON l.code_recipe = r.code_recipe
    WHERE l.id_user = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("❌ Erreur récupération favoris :", err);
      return res.status(500).json({ message: "Erreur serveur." });
    }
    res.json(results);
  });
});

module.exports = router;
