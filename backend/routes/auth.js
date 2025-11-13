const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const db = require("../config/db");
require("dotenv").config();
const router = express.Router();

// 🔐 Validation des champs pour l'inscription et la connexion
const validateUser = [
  body("email").isEmail().withMessage("L'email est invalide."),
  body("password")
    .isLength({ min: 8 }) // ✅ Augmenté à 8 caractères pour plus de sécurité
    .withMessage("Le mot de passe doit contenir au moins 8 caractères.")
    .matches(/\d/) // ✅ Au moins un chiffre
    .withMessage("Le mot de passe doit contenir au moins un chiffre."),
];

// 🔹 Inscription (POST /auth/register)
router.post("/register", validateUser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { email, password, pseudo = "", firstname = "", name = "" } = req.body;

  try {
    // Vérification de l'existence de l'email
    const [users] = await db.query("SELECT * FROM site_user WHERE email = ?", [
      email,
    ]);
    if (users.length > 0) {
      console.log("⚠️ Email déjà utilisé :", email);
      return res.status(400).json({ error: "Email déjà utilisé." });
    }

    // Hash du mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insertion de l'utilisateur
    await db.query(
      "INSERT INTO site_user (email, password, role, pseudo, firstname, name) VALUES (?, ?, ?, ?, ?, ?)",
      [email, hashedPassword, "user", pseudo, firstname, name]
    );

    console.log("🎉 Utilisateur inscrit :", email);
    res.status(201).json({ message: "Compte créé avec succès !" });
  } catch (err) {
    console.error("❌ Erreur inscription :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 Connexion (POST /auth/login)
router.post("/login", validateUser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { email, password } = req.body;

  try {
    // Recherche de l'utilisateur
    const [users] = await db.query("SELECT * FROM site_user WHERE email = ?", [
      email,
    ]);
    if (users.length === 0) {
      console.log("❌ Utilisateur introuvable");
      return res
        .status(401)
        .json({ error: "Email ou mot de passe incorrect." });
    }

    const user = users[0];

    // Comparaison des mots de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Mot de passe incorrect");
      return res
        .status(401)
        .json({ error: "Email ou mot de passe incorrect." });
    }

    // Génération du token
    const token = jwt.sign(
      {
        id: user.code_user,
        email: user.email,
        role: user.role,
        pseudo: user.pseudo,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" } // ✅ Durée étendue à 24h pour une meilleure UX
    );

    console.log("🔑 Token généré pour :", user.email);
    res.json({
      message: "Connexion réussie",
      token,
      user: {
        id: user.code_user,
        email: user.email,
        role: user.role,
        pseudo: user.pseudo,
      },
    });
  } catch (err) {
    console.error("❌ Erreur connexion :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
