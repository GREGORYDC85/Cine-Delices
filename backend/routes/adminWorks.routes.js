// routes/adminWorks.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authenticateUser = require("../middleware/auth.middleware");
const authorizeAdmin = require("../middleware/admin");

// ✅ Récupérer toutes les œuvres
router.get("/", authenticateUser, authorizeAdmin, (req, res) => {
  db.query("SELECT * FROM work ORDER BY title ASC", (err, results) => {
    if (err) return res.status(500).json({ error: "Erreur serveur" });
    res.json(results);
  });
});

// ✅ Ajouter une nouvelle œuvre
router.post("/", authenticateUser, authorizeAdmin, (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "Titre requis" });
  }

  db.query("INSERT INTO work (title) VALUES (?)", [title], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur serveur" });
    res.status(201).json({ message: "Œuvre ajoutée", id: result.insertId });
  });
});

// ✅ Modifier une œuvre
router.put("/:id", authenticateUser, authorizeAdmin, (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  db.query(
    "UPDATE work SET title = ? WHERE code_work = ?",
    [title, id],
    (err) => {
      if (err) return res.status(500).json({ error: "Erreur serveur" });
      res.json({ message: "Titre mis à jour" });
    }
  );
});

// ✅ Supprimer une œuvre
router.delete("/:id", authenticateUser, authorizeAdmin, (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM work WHERE code_work = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: "Erreur serveur" });
    res.json({ message: "Œuvre supprimée" });
  });
});

module.exports = router;
