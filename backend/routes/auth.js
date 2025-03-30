const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const db = require("../config/db");
require("dotenv").config();

const router = express.Router();

// 🔐 Validation des champs pour l'inscription et la connexion
const validateUser = [
  body("email").isEmail().withMessage("L'email est invalide."),
  body("password")
    .isLength({ min: 4 })
    .withMessage("Le mot de passe doit contenir au moins 4 caractères."),
];

// 🔹 Inscription (POST /auth/register)
router.post("/register", validateUser, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { email, password } = req.body;
  console.log("📩 Tentative d'inscription avec :", email);

  db.query(
    "SELECT * FROM site_user WHERE email = ?",
    [email],
    (err, result) => {
      if (err) {
        console.error("❌ Erreur SQL :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }

      if (result.length > 0) {
        console.log("⚠️ Email déjà utilisé :", email);
        return res.status(400).json({ error: "Email déjà utilisé." });
      }

      // 🔒 Hash du mot de passe
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          console.error("❌ Erreur génération du sel :", err);
          return res.status(500).json({ error: "Erreur serveur" });
        }

        bcrypt.hash(password, salt, (err, hashedPassword) => {
          if (err) {
            console.error("❌ Erreur hashage :", err);
            return res.status(500).json({ error: "Erreur serveur" });
          }

          db.query(
            "INSERT INTO site_user (email, password, role) VALUES (?, ?, ?)",
            [email, hashedPassword, "user"],
            (err) => {
              if (err) {
                console.error("❌ Erreur SQL (INSERT) :", err);
                return res.status(500).json({ error: "Erreur serveur" });
              }

              console.log("🎉 Utilisateur inscrit :", email);
              res.status(201).json({ message: "Compte créé avec succès !" });
            }
          );
        });
      });
    }
  );
});

// 🔹 Connexion (POST /auth/login)
router.post("/login", validateUser, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { email, password } = req.body;
  console.log("🔐 Tentative de connexion avec :", email);

  db.query(
    "SELECT * FROM site_user WHERE email = ?",
    [email],
    (err, result) => {
      if (err) {
        console.error("❌ Erreur SQL :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }

      if (result.length === 0) {
        console.log("❌ Utilisateur introuvable");
        return res.status(401).json({ error: "Utilisateur non trouvé." });
      }

      const user = result[0];
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error("❌ Erreur comparaison mots de passe :", err);
          return res.status(500).json({ error: "Erreur serveur" });
        }

        if (!isMatch) {
          console.log("❌ Mot de passe incorrect");
          return res.status(401).json({ error: "Mot de passe incorrect." });
        }

        const token = jwt.sign(
          {
            id: user.code_user,
            email: user.email,
            role: user.role,
          },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        console.log("🔑 Token généré pour :", user.email);
        res.json({ message: "Connexion réussie", token });
      });
    }
  );
});

module.exports = router;
