const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authenticateUser = require("../middleware/auth.middleware");
const authorizeAdmin = require("../middleware/admin");

// ✅ Récupérer tous les utilisateurs
router.get("/", authenticateUser, authorizeAdmin, (req, res) => {
  const sql = `
    SELECT code_user, pseudo, email, role, firstname, name
    FROM site_user
    ORDER BY code_user DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Erreur récupération utilisateurs :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    res.json(results);
  });
});

// ✅ Modifier le rôle d’un utilisateur
router.put("/:id/role", authenticateUser, authorizeAdmin, (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;

  if (!["admin", "user"].includes(role)) {
    return res.status(400).json({ error: "Rôle invalide" });
  }

  db.query(
    "UPDATE site_user SET role = ? WHERE code_user = ?",
    [role, userId],
    (err) => {
      if (err) {
        console.error("❌ Erreur modification rôle :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }
      res.json({ message: "✅ Rôle mis à jour" });
    }
  );
});

// ✅ Supprimer un utilisateur
router.delete("/:id", authenticateUser, authorizeAdmin, (req, res) => {
  const userId = req.params.id;

  db.query("DELETE FROM site_user WHERE code_user = ?", [userId], (err) => {
    if (err) {
      console.error("❌ Erreur suppression utilisateur :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    res.json({ message: "🗑️ Utilisateur supprimé" });
  });
});

module.exports = router;
