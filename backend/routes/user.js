const express = require("express");
const authenticateUser = require("../middleware/auth"); // 🔥 Importer le middleware

const router = express.Router();

// 🔒 Route protégée : récupérer le profil utilisateur
router.get("/profile", authenticateUser, (req, res) => {
  res.json({ message: "Profil utilisateur sécurisé", user: req.user });
});

module.exports = router;
