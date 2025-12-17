const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const db = require("../config/db");
require("dotenv").config();

const router = express.Router();

// 🔐 Validation des champs
const validateUser = [
  body("email").isEmail().withMessage("Email invalide."),
  body("password").isLength({ min: 4 }).withMessage("Mot de passe trop court."),
];

// 🔹 INSCRIPTION
router.post("/register", validateUser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const email = req.body.email.trim().toLowerCase();
  const password = req.body.password;

  console.log("📩 INSCRIPTION :", email);

  try {
    db.query(
      "SELECT code_user FROM site_user WHERE email = ?",
      [email],
      async (err, result) => {
        if (err) {
          console.error("❌ ERREUR SQL (SELECT) :", err);
          return res.status(500).json({ error: "Erreur serveur" });
        }

        if (result.length > 0) {
          console.log("⚠️ Email déjà utilisé :", email);
          return res.status(400).json({ error: "Email déjà utilisé" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
          "INSERT INTO site_user (email, password, role) VALUES (?, ?, 'user')",
          [email, hashedPassword],
          (err) => {
            if (err) {
              console.error("❌ ERREUR SQL (INSERT) :", err);
              return res.status(500).json({ error: "Erreur serveur" });
            }

            console.log("✅ Utilisateur créé :", email);
            res.status(201).json({ message: "Compte créé avec succès" });
          }
        );
      }
    );
  } catch (err) {
    console.error("❌ ERREUR INSCRIPTION :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 CONNEXION (DEBUG)
router.post("/login", (req, res) => {
  console.log("=================================");
  console.log("🔐 NOUVELLE TENTATIVE DE CONNEXION");

  console.log("➡️ BODY REÇU :", req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    console.log("❌ Email ou mot de passe manquant");
    return res.status(400).json({ error: "Champs manquants" });
  }

  const emailClean = email.trim().toLowerCase();
  console.log("➡️ EMAIL NETTOYÉ :", emailClean);

  db.query(
    "SELECT * FROM site_user WHERE email = ?",
    [emailClean],
    async (err, results) => {
      if (err) {
        console.error("❌ ERREUR SQL :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }

      console.log("➡️ RÉSULTATS SQL :", results);

      if (results.length === 0) {
        console.log("❌ AUCUN UTILISATEUR TROUVÉ");
        return res.status(401).json({ error: "Identifiants incorrects" });
      }

      const user = results[0];

      const isMatch = await bcrypt.compare(password, user.password);
      console.log("➡️ MOT DE PASSE OK ?", isMatch);

      if (!isMatch) {
        console.log("❌ MOT DE PASSE INCORRECT");
        return res.status(401).json({ error: "Identifiants incorrects" });
      }

      console.log("✅ AUTHENTIFICATION OK POUR :", user.email);

      const token = jwt.sign(
        {
          code_user: user.code_user,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET || "secret_temporaire",
        { expiresIn: "1h" }
      );

      res.json({
        message: "Connexion réussie",
        token,
        user: {
          code_user: user.code_user,
          email: user.email,
          role: user.role,
        },
      });
    }
  );
});

module.exports = router;
