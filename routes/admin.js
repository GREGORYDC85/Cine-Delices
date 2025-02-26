const express = require("express");
const authenticateUser = require("../middleware/auth"); // Vérifie si l'utilisateur est connecté
const authorizeAdmin = require("../middleware/admin"); // Vérifie si c'est un admin

const router = express.Router();

// ✅ Route protégée pour les admins
router.get("/dashboard", authenticateUser, authorizeAdmin, (req, res) => {
  res.json({
    message: "Bienvenue sur le dashboard admin",
    admin: req.user,
  });
});

module.exports = router;
