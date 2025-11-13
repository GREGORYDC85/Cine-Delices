const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authenticateUser = require("../middleware/auth");
const authorizeAdmin = require("../middleware/admin");

// ✅ Récupérer toutes les œuvres
router.get("/", authenticateUser, authorizeAdmin, async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM work ORDER BY title ASC");
    res.json(results);
  } catch (err) {
    console.error("❌ Erreur récupération œuvres :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Ajouter une nouvelle œuvre
router.post("/", authenticateUser, authorizeAdmin, async (req, res) => {
  const { title } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "Le titre est requis" });
  }

  try {
    const [result] = await db.query("INSERT INTO work (title) VALUES (?)", [
      title.trim(),
    ]);
    res.status(201).json({
      message: "✅ Œuvre ajoutée avec succès",
      id: result.insertId,
    });
  } catch (err) {
    console.error("❌ Erreur ajout œuvre :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Modifier une œuvre
router.put("/:id", authenticateUser, authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "Le titre est requis" });
  }

  try {
    const [result] = await db.query(
      "UPDATE work SET title = ? WHERE code_work = ?",
      [title.trim(), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Œuvre non trouvée" });
    }

    res.json({ message: "✅ Titre mis à jour avec succès" });
  } catch (err) {
    console.error("❌ Erreur modification œuvre :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Supprimer une œuvre
router.delete("/:id", authenticateUser, authorizeAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM work WHERE code_work = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Œuvre non trouvée" });
    }

    res.json({ message: "🗑️ Œuvre supprimée avec succès" });
  } catch (err) {
    console.error("❌ Erreur suppression œuvre :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
