const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authenticateUser = require("../middleware/auth");
const authorizeAdmin = require("../middleware/admin");

// ✅ Récupérer tous les utilisateurs
router.get("/", authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT code_user, pseudo, email, role, firstname, name
      FROM site_user
      ORDER BY code_user DESC
    `);
    res.json(results);
  } catch (err) {
    console.error("❌ Erreur récupération utilisateurs :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Modifier le rôle d'un utilisateur
router.put("/:id/role", authenticateUser, authorizeAdmin, async (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;

  if (!["admin", "user"].includes(role)) {
    return res
      .status(400)
      .json({ error: "Rôle invalide. Doit être 'admin' ou 'user'" });
  }

  try {
    const [result] = await db.query(
      "UPDATE site_user SET role = ? WHERE code_user = ?",
      [role, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json({ message: "✅ Rôle mis à jour avec succès" });
  } catch (err) {
    console.error("❌ Erreur modification rôle :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Supprimer un utilisateur
router.delete("/:id", authenticateUser, authorizeAdmin, async (req, res) => {
  const userId = req.params.id;

  try {
    const [result] = await db.query(
      "DELETE FROM site_user WHERE code_user = ?",
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json({ message: "🗑️ Utilisateur supprimé avec succès" });
  } catch (err) {
    console.error("❌ Erreur suppression utilisateur :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
